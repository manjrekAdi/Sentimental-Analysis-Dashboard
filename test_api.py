import requests
import json

# API base URL
BASE_URL = 'http://localhost:5001/api'

def test_health():
    """Test health check endpoint"""
    print("Testing health check...")
    response = requests.get(f'{BASE_URL}/health')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_display_limit():
    """Test sentiment analysis with different display limits"""
    print("Testing display limit functionality...")
    
    # Test 1: Analyze 10 posts, display 5
    print("Test 1: Analyze 10 posts, display 5")
    data = {
        "topic": "climate change",
        "limit": 10,
        "display_limit": 5,
        "search_type": "search"
    }
    response = requests.post(f"{BASE_URL}/analyze", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Total posts analyzed: {result['data']['posts_count']}")
        print(f"Posts displayed: {len(result['data']['sample_posts'])}")
        print(f"All posts available: {len(result['data']['all_posts'])}")
    else:
        print(f"Error: {response.text}")
    print()

    # Test 2: Analyze 15 posts, display all
    print("Test 2: Analyze 15 posts, display all")
    data = {
        "topic": "technology",
        "limit": 15,
        "display_limit": 15,
        "search_type": "search"
    }
    response = requests.post(f"{BASE_URL}/analyze", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Total posts analyzed: {result['data']['posts_count']}")
        print(f"Posts displayed: {len(result['data']['sample_posts'])}")
        print(f"All posts available: {len(result['data']['all_posts'])}")
    else:
        print(f"Error: {response.text}")
    print()

def test_database_analysis():
    """Test sentiment analysis with database storage"""
    print("Testing sentiment analysis with database storage...")
    
    # Test 1: Search for "climate change" across all Reddit
    print("Test 1: Searching for 'climate change' across all Reddit")
    data = {
        "topic": "climate change",
        "limit": 5,
        "search_type": "search"
    }
    response = requests.post(f"{BASE_URL}/analyze", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Session ID: {result['data']['session_id']}")
        print(f"Posts found: {result['data']['posts_count']}")
        print(f"Topic: {result['data']['topic']}")
        print(f"Search type: {result['data']['search_type']}")
    else:
        print(f"Error: {response.text}")
    print()

    # Test 2: Search specific subreddit
    print("Test 2: Searching specific subreddit 'politics'")
    data = {
        "topic": "politics",
        "limit": 5,
        "search_type": "subreddit"
    }
    response = requests.post(f"{BASE_URL}/analyze", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Session ID: {result['data']['session_id']}")
        print(f"Posts found: {result['data']['posts_count']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_database_endpoints():
    """Test new database-related endpoints"""
    print("Testing database endpoints...")
    
    # Test 1: Get latest results
    print("Test 1: Getting latest results from database")
    response = requests.get(f"{BASE_URL}/results")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Total posts: {result['data']['total_posts']}")
        if result['data']['session']:
            print(f"Session topic: {result['data']['session']['topic']}")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 2: Get analysis history
    print("Test 2: Getting analysis history")
    response = requests.get(f"{BASE_URL}/history?limit=5")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Total sessions: {result['data']['total_sessions']}")
        for session in result['data']['sessions'][:3]:
            print(f"  - {session['topic']} ({session['search_type']}) - {session['posts_count']} posts")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 3: Get database stats
    print("Test 3: Getting database statistics")
    response = requests.get(f"{BASE_URL}/stats")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        stats = result['data']
        print(f"Total posts: {stats['total_posts']}")
        print(f"Total sessions: {stats['total_sessions']}")
        print(f"Unique topics: {stats['unique_topics']}")
        print(f"Unique subreddits: {stats['unique_subreddits']}")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 4: Search posts in database
    print("Test 4: Searching posts in database")
    response = requests.get(f"{BASE_URL}/search?topic=climate&limit=3")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Posts found: {result['data']['posts_count']}")
        for post in result['data']['posts'][:2]:
            print(f"  - {post['title'][:60]}...")
    else:
        print(f"Error: {response.text}")
    print()

if __name__ == '__main__':
    print("Testing Reddit Sentiment Analysis API with Database Storage")
    print("=" * 70)
    
    test_health()
    test_display_limit()
    test_database_analysis()
    test_database_endpoints()
    
    print("Testing completed!") 