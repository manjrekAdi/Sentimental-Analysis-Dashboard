import praw
import pandas as pd
from typing import List, Dict
import os
from dotenv import load_dotenv

class RedditAPIScraper:
    def __init__(self, client_id, client_secret, username, password, user_agent):
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            username=username,
            password=password,
            user_agent=user_agent
        )

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
    posts = scraper.fetch_subreddit_posts('technology', limit=10)
    df = scraper.to_dataframe(posts)
    print(f"Scraped {len(posts)} posts from r/technology")
    print(df.head()) 