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
                'num_comments': submission.num_comments
            })
        return posts

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

# Example usage
if __name__ == "__main__":
    # Load credentials from .env file
    load_dotenv()
    CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
    CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
    USERNAME = os.getenv('REDDIT_USERNAME')
    PASSWORD = os.getenv('REDDIT_PASSWORD')
    USER_AGENT = os.getenv('REDDIT_USER_AGENT')

    scraper = RedditAPIScraper(CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD, USER_AGENT)
    posts = scraper.fetch_subreddit_posts('technology', limit=20)
    df = scraper.to_dataframe(posts)
    df = scraper.add_sentiment_columns(df)
    print(f"Scraped {len(posts)} posts from r/technology with sentiment and emotion labels.")
    print(df[['title', 'vader_label', 'textblob_label', 'bert_label', 'bert_emotion']].head())
    # Save to CSV in the data directory
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/reddit_posts_with_sentiment.csv', index=False)
    print("Saved labeled data to data/reddit_posts_with_sentiment.csv") 