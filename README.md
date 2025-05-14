# Social Media Sentiment Analysis Dashboard

A real-time sentiment analysis system that analyzes public opinion on polarizing topics across social media platforms.

## Project Overview
This project aims to develop a web-based tool that:
- Scrapes posts from Twitter, Reddit, and YouTube
- Analyzes sentiment using multiple NLP models (VADER, TextBlob, BERT)
- Visualizes public opinion trends
- Predicts future sentiment trajectories

## Tech Stack
- **Backend**: Python, Flask/FastAPI
- **Frontend**: React.js, Plotly/D3.js
- **NLP**: NLTK, TextBlob, HuggingFace Transformers
- **Data Processing**: scikit-learn, pandas
- **Web Scraping**: snscrape, BeautifulSoup

## Project Structure
```
sentiment-analysis-dashboard/
├── backend/
│   ├── api/                 # API endpoints
│   ├── models/             # ML models and sentiment analysis
│   ├── scrapers/           # Web scraping modules
│   └── utils/              # Utility functions
├── frontend/
│   ├── src/                # React source code
│   ├── public/             # Static files
│   └── components/         # React components
├── data/                   # Data storage
├── tests/                  # Test files
└── docs/                   # Documentation
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

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

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development
- Backend server: `python backend/app.py`
- Frontend development: `npm start` (in frontend directory)

## Project Timeline
- May 1-15: Setup & Initial Scraping
- May 16-31: Sentiment Analysis Engine
- June 1-15: Backend API Development
- June 16-30: Frontend Development (v1)
- July 1-15: Visualization and Feature Expansion
- July 16-31: Prediction & Hosting Preparation
- August 1-15: Final Deployment & Polish
- August 16-31: Final Presentation & Demonstration

## License
This project is part of EECS 4080 Computer Science Project at York University.

## Contact
- Student: Aditya Manjrekar (manjrek5@my.yorku.ca)
- Supervisor: Dr. Aijun An (aan@yorku.ca) 