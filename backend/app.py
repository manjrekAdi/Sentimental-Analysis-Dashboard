from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import nltk

# Load environment variables
load_dotenv()

# Download required NLTK data
try:
    nltk.download('vader_lexicon', quiet=True)
    print("✅ NLTK VADER lexicon downloaded successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not download NLTK data: {e}")

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from your frontend domain
CORS(app, 
     origins=["https://sentimental-analysis-dashboard-1.onrender.com", "http://localhost:5173"],
     supports_credentials=False,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Accept"])

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    # Handle preflight requests
    if request.method == 'OPTIONS':
        response = make_response()
        response.status_code = 200
    
    # Get the origin from the request
    origin = request.headers.get('Origin')
    allowed_origins = [
        'https://sentimental-analysis-dashboard-1.onrender.com',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ]
    
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    else:
        # Fallback to main frontend domain
        response.headers.add('Access-Control-Allow-Origin', 'https://sentimental-analysis-dashboard-1.onrender.com')
    
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Max-Age', '86400')  # Cache preflight for 24 hours
    return response

# Configuration
app.config.update(
    SECRET_KEY=os.getenv('SECRET_KEY', 'dev-key-please-change'),
    DEBUG=os.getenv('FLASK_ENV', 'True').lower() == 'true'
)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running',
        'environment': os.getenv('FLASK_ENV', 'development'),
        'database': 'postgresql',
        'timestamp': datetime.now().isoformat()
    })

# Import and register blueprints
from api.routes import api_bp
app.register_blueprint(api_bp, url_prefix='/api')

if __name__ == '__main__':
    # Use Render's PORT environment variable for free tier
    port = int(os.environ.get('PORT', 5001))
    # Use 0.0.0.0 to bind to all available network interfaces
    app.run(host='0.0.0.0', port=port, debug=False)  # Set debug=False for production 