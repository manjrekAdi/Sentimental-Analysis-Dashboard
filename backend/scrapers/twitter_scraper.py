import snscrape.modules.twitter as sntwitter
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pandas as pd

class TwitterScraper:
    def __init__(self):
        """Initialize the Twitter scraper"""
        pass

    def search_tweets(
        self,
        query: str,
        limit: int = 100,
        since: datetime = None,
        until: datetime = None
    ) -> List[Dict[str, Any]]:
        """
        Search for tweets matching the given query
        
        Args:
            query (str): Search query
            limit (int): Maximum number of tweets to fetch
            since (datetime): Start date for search
            until (datetime): End date for search
            
        Returns:
            List[Dict[str, Any]]: List of tweets with their metadata
        """
        if since is None:
            since = datetime.now() - timedelta(days=7)
        if until is None:
            until = datetime.now()

        # Format the search query
        search_query = f"{query} since:{since.strftime('%Y-%m-%d')} until:{until.strftime('%Y-%m-%d')}"
        
        tweets = []
        try:
            # Use snscrape to search tweets
            for i, tweet in enumerate(sntwitter.TwitterSearchScraper(search_query).get_items()):
                if i >= limit:
                    break
                    
                tweet_data = {
                    'id': tweet.id,
                    'date': tweet.date,
                    'content': tweet.rawContent,
                    'username': tweet.user.username,
                    'retweet_count': tweet.retweetCount,
                    'like_count': tweet.likeCount,
                    'reply_count': tweet.replyCount,
                    'quote_count': tweet.quoteCount,
                    'lang': tweet.lang
                }
                tweets.append(tweet_data)
                
        except Exception as e:
            print(f"Error scraping tweets: {str(e)}")
            return []
            
        return tweets

    def to_dataframe(self, tweets: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Convert list of tweets to pandas DataFrame
        
        Args:
            tweets (List[Dict[str, Any]]): List of tweet dictionaries
            
        Returns:
            pd.DataFrame: DataFrame containing tweet data
        """
        return pd.DataFrame(tweets)

# Example usage
if __name__ == "__main__":
    scraper = TwitterScraper()
    # Example search for AI tweets from May 1, 2024 to May 10, 2024
    tweets = scraper.search_tweets(
        query="AI",
        limit=10,
        since=datetime(2024, 5, 1),
        until=datetime(2024, 5, 10)
    )
    df = scraper.to_dataframe(tweets)
    print(f"Scraped {len(tweets)} tweets")
    print(df.head()) 