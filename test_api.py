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

def test_scrape():
    """Test scraping endpoint"""
    print("Testing scraping endpoint...")
    data = {
        'subreddit': 'technology',
        'limit': 5
    }
    response = requests.post(f'{BASE_URL}/scrape', json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_analyze():
    """Test sentiment analysis endpoint"""
    print("Testing sentiment analysis endpoint...")
    data = {
        'subreddit': 'technology',
        'limit': 5
    }
    response = requests.post(f'{BASE_URL}/analyze', json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_results():
    """Test results endpoint"""
    print("Testing results endpoint...")
    response = requests.get(f'{BASE_URL}/results')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

if __name__ == '__main__':
    print("Testing Flask API Endpoints")
    print("=" * 50)
    
    test_health()
    test_scrape()
    test_analyze()
    test_results() 