# Social Media Sentiment Analysis Dashboard

A real-time sentiment analysis system that analyzes public opinion on polarizing topics from Reddit using multiple NLP models.

## Project Overview
This project provides a web-based tool that:
- Scrapes posts from Reddit using PRAW API
- Analyzes sentiment using multiple NLP models (VADER, TextBlob, BERT)
- Stores data efficiently in PostgreSQL database
- Visualizes public opinion trends with interactive charts
- Supports both topic-based search and subreddit-specific analysis

## Tech Stack
- **Backend**: Python, Flask
- **Frontend**: React.js, Vite, Material-UI, Chart.js
- **NLP**: NLTK, TextBlob, HuggingFace Transformers
- **Data Processing**: pandas, numpy
- **Database**: PostgreSQL
- **Web Scraping**: PRAW (Reddit API)

## Project Structure
```
EECS 4080/
├── backend/
│   ├── api/                 # API endpoints
│   ├── models/             # Database models
│   ├── scrapers/           # Reddit scraping modules
│   ├── app.py              # Flask application
│   └── db_manager.py       # Database management tools
├── frontend/
│   ├── src/                # React source code
│   ├── public/             # Static files
│   └── package.json        # Dependencies
├── data/                   # Data storage directory
├── requirements.txt        # Python dependencies
└── test_api.py            # API testing script
```

## Features

### 🔍 **Flexible Search Options**
- **Search All Reddit**: Find posts about any topic across all subreddits
- **Specific Subreddit**: Analyze posts from a particular subreddit
- **Topic Examples**: climate change, vaccines, AI, politics, etc.

### 📊 **Multiple Sentiment Models**
- **VADER**: Rule-based sentiment analysis
- **TextBlob**: Machine learning-based sentiment
- **BERT**: Advanced transformer-based sentiment and emotion classification

### 💾 **Efficient Data Storage**
- **PostgreSQL Database**: Production-ready database with advanced features
- **Duplicate Prevention**: Avoids analyzing the same post twice
- **Session Tracking**: Complete history of all analyses
- **Fast Queries**: Efficient search across all stored data

### 📈 **Interactive Visualizations**
- **Sentiment Charts**: Pie charts for each sentiment model
- **Data Tables**: Detailed view of posts and sentiment scores
- **Real-time Updates**: Immediate results after analysis

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- Reddit API credentials

### Backend Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up Reddit API credentials in `.env` file:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   REDDIT_USERNAME=your_username
   REDDIT_PASSWORD=your_password
   REDDIT_USER_AGENT=your_user_agent
   ```

4. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Running the Application
1. Start backend: `cd backend && python app.py` (runs on port 5001)
2. Start frontend: `cd frontend && npm run dev` (runs on port 5173)
3. Open browser to `http://localhost:5173`

### Database Management
Use the database manager to explore your data:
```bash
cd backend
python db_manager.py stats          # Show database statistics
python db_manager.py history        # Show analysis history
python db_manager.py search "topic" # Search posts by topic
python db_manager.py latest         # Show latest analysis
```

### API Testing
Test the API endpoints:
```bash
python test_api.py
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/analyze` - Run sentiment analysis
- `GET /api/results` - Get latest results
- `GET /api/history` - Get analysis history
- `GET /api/search` - Search posts by topic
- `GET /api/stats` - Get database statistics

## Data Flow

1. **User Input**: Topic, post limit, search type
2. **Reddit Scraping**: Fetch posts using PRAW API
3. **Sentiment Analysis**: Apply VADER, TextBlob, BERT models
4. **Database Storage**: Save to PostgreSQL with session tracking
5. **Results Display**: Show charts and tables in frontend

## License
This project is part of EECS 4080 Computer Science Project at York University.

## Contact
- Student: Aditya Manjrekar (manjrek5@my.yorku.ca)
- Supervisor: Dr. Aijun An (aan@yorku.ca) 