import sqlite3
import pandas as pd
from datetime import datetime
import os
from typing import List, Dict, Optional

class SentimentDatabase:
    def __init__(self, db_path: str = 'data/sentiment_analysis.db'):
        """Initialize the database connection"""
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """Initialize the database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create posts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    reddit_id TEXT UNIQUE,
                    title TEXT NOT NULL,
                    score INTEGER,
                    url TEXT,
                    author TEXT,
                    created_utc INTEGER,
                    num_comments INTEGER,
                    subreddit TEXT,
                    clean_title TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create sentiment_analysis table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sentiment_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    post_id INTEGER,
                    analysis_type TEXT NOT NULL,
                    sentiment_label TEXT,
                    sentiment_score REAL,
                    emotion_label TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES posts (id),
                    UNIQUE(post_id, analysis_type)
                )
            ''')
            
            # Create analysis_sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS analysis_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT NOT NULL,
                    search_type TEXT NOT NULL,
                    limit_count INTEGER,
                    posts_count INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
    
    def save_posts_with_sentiment(self, posts_data: List[Dict], topic: str, search_type: str, limit_count: int) -> int:
        """Save posts and their sentiment analysis to the database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create analysis session
            cursor.execute('''
                INSERT INTO analysis_sessions (topic, search_type, limit_count, posts_count)
                VALUES (?, ?, ?, ?)
            ''', (topic, search_type, limit_count, len(posts_data)))
            session_id = cursor.lastrowid
            
            for post_data in posts_data:
                # Insert or update post
                cursor.execute('''
                    INSERT OR REPLACE INTO posts 
                    (reddit_id, title, score, url, author, created_utc, num_comments, subreddit, clean_title)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    post_data['id'],
                    post_data['title'],
                    post_data['score'],
                    post_data['url'],
                    post_data['author'],
                    post_data['created_utc'],
                    post_data['num_comments'],
                    post_data.get('subreddit', ''),
                    post_data.get('clean_title', '')
                ))
                
                post_id = cursor.lastrowid
                
                # Insert sentiment analysis results
                sentiment_data = [
                    ('vader', post_data.get('vader_label'), post_data.get('vader_compound')),
                    ('textblob', post_data.get('textblob_label'), post_data.get('textblob_polarity')),
                    ('bert_sentiment', post_data.get('bert_label'), None),
                    ('bert_emotion', None, None, post_data.get('bert_emotion'))
                ]
                
                for analysis_type, label, score, *extra in sentiment_data:
                    emotion = extra[0] if extra else None
                    cursor.execute('''
                        INSERT OR REPLACE INTO sentiment_analysis 
                        (post_id, analysis_type, sentiment_label, sentiment_score, emotion_label)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (post_id, analysis_type, label, score, emotion))
            
            conn.commit()
            return session_id
    
    def get_latest_analysis(self, limit: int = 50) -> Dict:
        """Get the latest sentiment analysis results"""
        with sqlite3.connect(self.db_path) as conn:
            # Get the most recent session
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM analysis_sessions 
                ORDER BY created_at DESC 
                LIMIT 1
            ''')
            session = cursor.fetchone()
            
            if not session:
                return None
            
            # Get posts with sentiment analysis
            cursor.execute('''
                SELECT 
                    p.*,
                    sa_vader.sentiment_label as vader_label,
                    sa_vader.sentiment_score as vader_compound,
                    sa_textblob.sentiment_label as textblob_label,
                    sa_textblob.sentiment_score as textblob_polarity,
                    sa_bert.sentiment_label as bert_label,
                    sa_emotion.emotion_label as bert_emotion
                FROM posts p
                LEFT JOIN sentiment_analysis sa_vader ON p.id = sa_vader.post_id AND sa_vader.analysis_type = 'vader'
                LEFT JOIN sentiment_analysis sa_textblob ON p.id = sa_textblob.post_id AND sa_textblob.analysis_type = 'textblob'
                LEFT JOIN sentiment_analysis sa_bert ON p.id = sa_bert.post_id AND sa_bert.analysis_type = 'bert_sentiment'
                LEFT JOIN sentiment_analysis sa_emotion ON p.id = sa_emotion.post_id AND sa_emotion.analysis_type = 'bert_emotion'
                WHERE p.created_at >= (SELECT created_at FROM analysis_sessions ORDER BY created_at DESC LIMIT 1)
                ORDER BY p.created_at DESC
                LIMIT ?
            ''', (limit,))
            
            posts = cursor.fetchall()
            
            # Convert to list of dictionaries
            columns = [desc[0] for desc in cursor.description]
            posts_data = [dict(zip(columns, row)) for row in posts]
            
            # Calculate sentiment summary
            sentiment_summary = {
                'vader': {},
                'textblob': {},
                'bert_sentiment': {},
                'bert_emotion': {}
            }
            
            for post in posts_data:
                for key in sentiment_summary:
                    label = post.get(f'{key.split("_")[0]}_label' if key != 'bert_emotion' else 'bert_emotion')
                    if label:
                        sentiment_summary[key][label] = sentiment_summary[key].get(label, 0) + 1
            
            return {
                'session': {
                    'id': session[0],
                    'topic': session[1],
                    'search_type': session[2],
                    'limit_count': session[3],
                    'posts_count': session[4],
                    'created_at': session[5]
                },
                'posts': posts_data,
                'sentiment_summary': sentiment_summary
            }
    
    def get_analysis_history(self, limit: int = 10) -> List[Dict]:
        """Get analysis session history"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM analysis_sessions 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            
            sessions = cursor.fetchall()
            columns = ['id', 'topic', 'search_type', 'limit_count', 'posts_count', 'created_at']
            return [dict(zip(columns, session)) for session in sessions]
    
    def search_posts_by_topic(self, topic: str, limit: int = 50) -> List[Dict]:
        """Search posts by topic"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    p.*,
                    sa_vader.sentiment_label as vader_label,
                    sa_vader.sentiment_score as vader_compound,
                    sa_textblob.sentiment_label as textblob_label,
                    sa_textblob.sentiment_score as textblob_polarity,
                    sa_bert.sentiment_label as bert_label,
                    sa_emotion.emotion_label as bert_emotion
                FROM posts p
                LEFT JOIN sentiment_analysis sa_vader ON p.id = sa_vader.post_id AND sa_vader.analysis_type = 'vader'
                LEFT JOIN sentiment_analysis sa_textblob ON p.id = sa_textblob.post_id AND sa_textblob.analysis_type = 'textblob'
                LEFT JOIN sentiment_analysis sa_bert ON p.id = sa_bert.post_id AND sa_bert.analysis_type = 'bert_sentiment'
                LEFT JOIN sentiment_analysis sa_emotion ON p.id = sa_emotion.post_id AND sa_emotion.analysis_type = 'bert_emotion'
                WHERE p.title LIKE ? OR p.clean_title LIKE ?
                ORDER BY p.created_at DESC
                LIMIT ?
            ''', (f'%{topic}%', f'%{topic}%', limit))
            
            posts = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            return [dict(zip(columns, row)) for row in posts]
    
    def get_database_stats(self) -> Dict:
        """Get database statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('SELECT COUNT(*) FROM posts')
            total_posts = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM analysis_sessions')
            total_sessions = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(DISTINCT topic) FROM analysis_sessions')
            unique_topics = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(DISTINCT subreddit) FROM posts')
            unique_subreddits = cursor.fetchone()[0]
            
            return {
                'total_posts': total_posts,
                'total_sessions': total_sessions,
                'unique_topics': unique_topics,
                'unique_subreddits': unique_subreddits
            } 