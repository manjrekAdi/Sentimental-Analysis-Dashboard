from flask import Blueprint, request, jsonify
import pandas as pd
import os
from datetime import datetime
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scrapers.reddit_scraper import RedditAPIScraper
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_bp = Blueprint('api', __name__)

# Initialize scraper
scraper = None

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
        subreddit = data.get('subreddit', 'technology')
        limit = data.get('limit', 20)
        
        scraper = get_scraper()
        posts = scraper.fetch_subreddit_posts(subreddit, limit)
        df = scraper.to_dataframe(posts)
        
        # Save raw data
        os.makedirs('data', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'data/reddit_posts_{subreddit}_{timestamp}.csv'
        df.to_csv(filename, index=False)
        
        return jsonify({
            'success': True,
            'message': f'Successfully scraped {len(posts)} posts from r/{subreddit}',
            'data': {
                'subreddit': subreddit,
                'limit': limit,
                'posts_count': len(posts),
                'filename': filename,
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
        subreddit = data.get('subreddit', 'technology')
        limit = data.get('limit', 20)
        
        scraper = get_scraper()
        posts = scraper.fetch_subreddit_posts(subreddit, limit)
        df = scraper.to_dataframe(posts)
        df = scraper.add_sentiment_columns(df)
        
        # Save analyzed data
        os.makedirs('data', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'data/reddit_posts_with_sentiment_{subreddit}_{timestamp}.csv'
        df.to_csv(filename, index=False)
        
        # Prepare summary statistics
        sentiment_summary = {
            'vader': df['vader_label'].value_counts().to_dict(),
            'textblob': df['textblob_label'].value_counts().to_dict(),
            'bert_sentiment': df['bert_label'].value_counts().to_dict(),
            'bert_emotion': df['bert_emotion'].value_counts().to_dict()
        }
        
        return jsonify({
            'success': True,
            'message': f'Successfully analyzed {len(posts)} posts from r/{subreddit}',
            'data': {
                'subreddit': subreddit,
                'limit': limit,
                'posts_count': len(posts),
                'filename': filename,
                'sentiment_summary': sentiment_summary,
                'sample_posts': df[['title', 'vader_label', 'textblob_label', 'bert_label', 'bert_emotion']].head(5).to_dict('records')
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/results', methods=['GET'])
def get_results():
    """Get latest analysis results"""
    try:
        data_dir = 'data'
        if not os.path.exists(data_dir):
            return jsonify({
                'success': False,
                'error': 'No data directory found'
            }), 404
        
        # Find the most recent sentiment analysis file
        sentiment_files = [f for f in os.listdir(data_dir) if 'sentiment' in f and f.endswith('.csv')]
        if not sentiment_files:
            return jsonify({
                'success': False,
                'error': 'No sentiment analysis files found'
            }), 404
        
        latest_file = max(sentiment_files, key=lambda x: os.path.getctime(os.path.join(data_dir, x)))
        df = pd.read_csv(os.path.join(data_dir, latest_file))
        
        # Prepare summary
        sentiment_summary = {
            'vader': df['vader_label'].value_counts().to_dict(),
            'textblob': df['textblob_label'].value_counts().to_dict(),
            'bert_sentiment': df['bert_label'].value_counts().to_dict(),
            'bert_emotion': df['bert_emotion'].value_counts().to_dict()
        }
        
        return jsonify({
            'success': True,
            'data': {
                'filename': latest_file,
                'total_posts': len(df),
                'sentiment_summary': sentiment_summary,
                'posts': df.to_dict('records')
            }
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