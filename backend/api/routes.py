from flask import Blueprint, request, jsonify
import pandas as pd
import os
from datetime import datetime
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scrapers.reddit_scraper import RedditAPIScraper
from models.database import SentimentDatabase
from benchmarking.simple_datasets import Sentiment140Loader
from benchmarking.evaluator import SentimentEvaluator
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_bp = Blueprint('api', __name__)

# Initialize scraper and database
scraper = None
db = SentimentDatabase()

def get_scraper():
    global scraper
    if scraper is None:
        scraper = RedditAPIScraper(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            username=os.getenv('REDDIT_USERNAME'),
            password=os.getenv('REDDIT_PASSWORD'),
            user_agent=os.getenv('REDDIT_USER_AGENT')
        )
    return scraper

@api_bp.route('/scrape', methods=['POST'])
def scrape_reddit():
    """Trigger Reddit scraping with specified parameters"""
    try:
        data = request.get_json() or {}
        topic = data.get('topic', 'technology')
        limit = data.get('limit', 20)
        search_type = data.get('search_type', 'search')  # 'subreddit' or 'search'
        
        scraper = get_scraper()
        posts = scraper.fetch_posts_by_topic(topic, limit, search_type)
        df = scraper.to_dataframe(posts)
        
        # Save to database
        session_id = db.save_posts_with_sentiment(posts, topic, search_type, limit)
        
        return jsonify({
            'success': True,
            'message': f'Successfully scraped {len(posts)} posts for "{topic}" using {search_type}',
            'data': {
                'session_id': session_id,
                'topic': topic,
                'search_type': search_type,
                'limit': limit,
                'posts_count': len(posts),
                'posts': posts[:5]  # Return first 5 posts as sample
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """Run sentiment analysis on scraped data"""
    try:
        data = request.get_json() or {}
        topic = data.get('topic', 'technology')
        limit = data.get('limit', 20)
        search_type = data.get('search_type', 'search')  # 'subreddit' or 'search'
        display_limit = data.get('display_limit', limit)  # How many posts to display
        
        scraper = get_scraper()
        posts = scraper.fetch_posts_by_topic(topic, limit, search_type)
        df = scraper.to_dataframe(posts)
        df = scraper.add_sentiment_columns(df)
        
        # Convert DataFrame to list of dictionaries
        posts_with_sentiment = df.to_dict('records')
        
        # Save to database
        session_id = db.save_posts_with_sentiment(posts_with_sentiment, topic, search_type, limit)
        
        # Get the saved data from database
        result = db.get_latest_analysis(limit)
        
        if result:
            # Return all posts, frontend will handle display limit
            return jsonify({
                'success': True,
                'message': f'Successfully analyzed {len(posts)} posts for "{topic}" using {search_type}',
                'data': {
                    'session_id': session_id,
                    'topic': topic,
                    'search_type': search_type,
                    'limit': limit,
                    'display_limit': display_limit,
                    'posts_count': len(posts),
                    'sentiment_summary': result['sentiment_summary'],
                    'all_posts': result['posts'],  # Return all posts
                    'sample_posts': result['posts'][:display_limit]  # Return display_limit posts for table
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to retrieve analysis results from database'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/results', methods=['GET'])
def get_results():
    """Get latest analysis results from database"""
    try:
        result = db.get_latest_analysis()
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'No analysis results found in database'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'session': result['session'],
                'total_posts': len(result['posts']),
                'sentiment_summary': result['sentiment_summary'],
                'posts': result['posts']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/history', methods=['GET'])
def get_analysis_history():
    """Get analysis session history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        history = db.get_analysis_history(limit)
        
        return jsonify({
            'success': True,
            'data': {
                'sessions': history,
                'total_sessions': len(history)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/search', methods=['GET'])
def search_posts():
    """Search posts by topic in database"""
    try:
        topic = request.args.get('topic', '')
        limit = request.args.get('limit', 50, type=int)
        
        if not topic:
            return jsonify({
                'success': False,
                'error': 'Topic parameter is required'
            }), 400
        
        posts = db.search_posts_by_topic(topic, limit)
        
        return jsonify({
            'success': True,
            'data': {
                'topic': topic,
                'posts_count': len(posts),
                'posts': posts
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/stats', methods=['GET'])
def get_database_stats():
    """Get database statistics"""
    try:
        stats = db.get_database_stats()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running',
        'timestamp': datetime.now().isoformat()
    }), 200

@api_bp.route('/benchmark', methods=['POST'])
def run_benchmark():
    """Run sentiment analysis model benchmarking on Sentiment140 dataset"""
    try:
        data = request.get_json() or {}
        filepath = data.get('filepath', 'sentiment140.csv')
        sample_size = data.get('sample_size', 1000)
        models = data.get('models', ['vader', 'textblob', 'bert'])
        
        # Load Sentiment140 dataset
        dataset = Sentiment140Loader.load_sentiment140(filepath, sample_size)
        
        # Run evaluation
        evaluator = SentimentEvaluator()
        results = evaluator.compare_models(dataset, models)
        
        # Generate report
        report = evaluator.generate_report(results)
        
        return jsonify({
            'success': True,
            'message': f'Benchmark completed on Sentiment140 dataset with {len(dataset.get_texts())} samples',
            'data': {
                'dataset': 'Sentiment140',
                'filepath': filepath,
                'sample_size': len(dataset.get_texts()),
                'models_evaluated': models,
                'results': results,
                'report': report
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/benchmark/info', methods=['GET'])
def get_benchmark_info():
    """Get information about Sentiment140 benchmarking"""
    try:
        info = Sentiment140Loader.get_dataset_info()
        
        return jsonify({
            'success': True,
            'data': {
                'dataset': 'Sentiment140',
                'description': info['sentiment140'],
                'file_required': 'sentiment140.csv',
                'format': 'CSV with 6+ columns: [polarity, id, date, query, user, text]',
                'polarity_values': '0=negative, 2=neutral, 4=positive'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 