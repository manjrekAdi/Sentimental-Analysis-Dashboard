import praw
import pandas as pd
from typing import List, Dict
import os
from dotenv import load_dotenv
import re
from nltk.sentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from transformers import pipeline

class RedditAPIScraper:
    def __init__(self, client_id, client_secret, username, password, user_agent):
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            username=username,
            password=password,
            user_agent=user_agent
        )
        self.vader = SentimentIntensityAnalyzer()
        # Load BERT sentiment pipeline
        self.bert_sentiment = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        # Load BERT emotion pipeline
        self.bert_emotion = pipeline("text-classification", model="bhadresh-savani/bert-base-uncased-emotion")

    def fetch_subreddit_posts(self, subreddit: str, limit: int = 20) -> List[Dict]:
        """
        Fetches posts from a subreddit using Reddit API (PRAW).
        Args:
            subreddit (str): The subreddit to fetch from (without r/)
            limit (int): Number of posts to fetch
        Returns:
            List[Dict]: List of post data
        """
        posts = []
        for submission in self.reddit.subreddit(subreddit).hot(limit=limit):
            posts.append({
                'title': submission.title,
                'score': submission.score,
                'url': submission.url,
                'id': submission.id,
                'author': str(submission.author),
                'created_utc': submission.created_utc,
                'num_comments': submission.num_comments,
                'subreddit': submission.subreddit.display_name
            })
        return posts

    def search_reddit_posts(self, search_term: str, limit: int = 20, sort: str = 'hot') -> List[Dict]:
        """
        Searches for posts across all of Reddit based on a search term.
        Args:
            search_term (str): The term to search for
            limit (int): Number of posts to fetch
            sort (str): Sort method ('hot', 'new', 'top', 'relevance')
        Returns:
            List[Dict]: List of post data
        """
        posts = []
        try:
            # Search across all of Reddit
            search_results = self.reddit.subreddit('all').search(search_term, limit=limit, sort=sort)
            
            for submission in search_results:
                posts.append({
                    'title': submission.title,
                    'score': submission.score,
                    'url': submission.url,
                    'id': submission.id,
                    'author': str(submission.author),
                    'created_utc': submission.created_utc,
                    'num_comments': submission.num_comments,
                    'subreddit': submission.subreddit.display_name
                })
        except Exception as e:
            print(f"Error searching Reddit: {e}")
            # Fallback to subreddit search if general search fails
            if search_term.lower() in ['politics', 'technology', 'science', 'news', 'worldnews']:
                return self.fetch_subreddit_posts(search_term, limit)
        
        return posts

    def fetch_posts_by_topic(self, topic: str, limit: int = 20, search_type: str = 'search') -> List[Dict]:
        """
        Unified method to fetch posts either by subreddit or search term.
        Args:
            topic (str): The topic/subreddit to search for
            limit (int): Number of posts to fetch
            search_type (str): 'subreddit' for specific subreddit, 'search' for general search
        Returns:
            List[Dict]: List of post data
        """
        if search_type == 'subreddit':
            return self.fetch_subreddit_posts(topic, limit)
        else:
            return self.search_reddit_posts(topic, limit)

    @staticmethod
    def preprocess_text(text: str) -> str:
        text = text.lower()
        text = re.sub(r'http\S+', '', text)  # Remove URLs
        text = re.sub(r'[^a-z0-9\s]', '', text)  # Remove special characters
        text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
        return text

    def add_sentiment_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        # Preprocess text
        df['clean_title'] = df['title'].apply(self.preprocess_text)
        # VADER sentiment
        df['vader_compound'] = df['clean_title'].apply(lambda x: self.vader.polarity_scores(x)['compound'])
        df['vader_label'] = df['vader_compound'].apply(lambda x: 'positive' if x > 0.05 else ('negative' if x < -0.05 else 'neutral'))
        # TextBlob sentiment
        df['textblob_polarity'] = df['clean_title'].apply(lambda x: TextBlob(x).sentiment.polarity)
        df['textblob_label'] = df['textblob_polarity'].apply(lambda x: 'positive' if x > 0.05 else ('negative' if x < -0.05 else 'neutral'))
        # BERT sentiment (binary)
        df['bert_label'] = df['clean_title'].apply(lambda x: self.bert_sentiment(x)[0]['label'].lower())
        # BERT emotion classification
        df['bert_emotion'] = df['clean_title'].apply(lambda x: self.bert_emotion(x)[0]['label'].lower())
        return df

    def to_dataframe(self, posts: List[Dict]) -> pd.DataFrame:
        return pd.DataFrame(posts) 