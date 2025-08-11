#!/usr/bin/env python3
"""
Database Management Script for Sentiment Analysis
Use this script to explore and manage the PostgreSQL database.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models.database import SentimentDatabase

def print_separator():
    print("=" * 60)

def show_database_stats():
    """Show database statistics"""
    print_separator()
    print("DATABASE STATISTICS")
    print_separator()
    
    db = SentimentDatabase()
    stats = db.get_database_stats()
    
    print(f"Total Posts: {stats['total_posts']}")
    print(f"Total Analysis Sessions: {stats['total_sessions']}")
    print(f"Unique Topics Analyzed: {stats['unique_topics']}")
    print(f"Unique Subreddits: {stats['unique_subreddits']}")
    print()

def show_analysis_history(limit=10):
    """Show recent analysis sessions"""
    print_separator()
    print(f"RECENT ANALYSIS SESSIONS (Last {limit})")
    print_separator()
    
    db = SentimentDatabase()
    history = db.get_analysis_history(limit)
    
    if not history:
        print("No analysis sessions found.")
        return
    
    for i, session in enumerate(history, 1):
        print(f"{i}. Topic: '{session['topic']}' | Type: {session['search_type']} | Posts: {session['posts_count']} | Date: {session['created_at']}")
    print()

def show_latest_analysis():
    """Show the latest analysis results"""
    print_separator()
    print("LATEST ANALYSIS RESULTS")
    print_separator()
    
    db = SentimentDatabase()
    result = db.get_latest_analysis()
    
    if not result:
        print("No analysis results found.")
        return
    
    session = result['session']
    print(f"Session ID: {session['id']}")
    print(f"Topic: {session['topic']}")
    print(f"Search Type: {session['search_type']}")
    print(f"Posts Analyzed: {session['posts_count']}")
    print(f"Date: {session['created_at']}")
    print()
    
    print("SENTIMENT SUMMARY:")
    for method, counts in result['sentiment_summary'].items():
        print(f"  {method.upper()}: {counts}")
    print()
    
    print("SAMPLE POSTS:")
    for i, post in enumerate(result['posts'][:3], 1):
        print(f"  {i}. {post['title'][:80]}...")
        print(f"     Subreddit: {post['subreddit']}")
        print(f"     VADER: {post.get('vader_label', 'N/A')} | TextBlob: {post.get('textblob_label', 'N/A')} | BERT: {post.get('bert_label', 'N/A')}")
        print()

def search_posts_in_db(topic):
    """Search posts by topic in database"""
    print_separator()
    print(f"SEARCHING FOR: '{topic}'")
    print_separator()
    
    db = SentimentDatabase()
    posts = db.search_posts_by_topic(topic, limit=10)
    
    if not posts:
        print(f"No posts found containing '{topic}'")
        return
    
    print(f"Found {len(posts)} posts:")
    for i, post in enumerate(posts, 1):
        print(f"  {i}. {post['title'][:80]}...")
        print(f"     Subreddit: {post['subreddit']} | VADER: {post.get('vader_label', 'N/A')}")
    print()

def show_table_schema():
    """Show database table schema"""
    print_separator()
    print("DATABASE SCHEMA")
    print_separator()
    
    db = SentimentDatabase()
    print("PostgreSQL database schema:")
    print("- posts: id, reddit_id, title, score, url, author, created_utc, num_comments, subreddit, clean_title, created_at")
    print("- sentiment_analysis: id, post_id, analysis_type, sentiment_label, sentiment_score, emotion_label, created_at")
    print("- analysis_sessions: id, topic, search_type, limit_count, posts_count, created_at")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python db_manager.py <command> [options]")
        print("\nCommands:")
        print("  stats              - Show database statistics")
        print("  history [limit]    - Show analysis history (default: 10)")
        print("  latest             - Show latest analysis results")
        print("  search <topic>     - Search posts by topic")
        print("  schema             - Show database schema")
        print("  all                - Run all commands")
        return
    
    command = sys.argv[1].lower()
    
    if command == "stats":
        show_database_stats()
    elif command == "history":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        show_analysis_history(limit)
    elif command == "latest":
        show_latest_analysis()
    elif command == "search":
        if len(sys.argv) < 3:
            print("Error: Topic required for search command")
            return
        topic = sys.argv[2]
        search_posts_in_db(topic)
    elif command == "schema":
        show_table_schema()
    elif command == "all":
        show_database_stats()
        show_analysis_history()
        show_latest_analysis()
        show_table_schema()
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main() 