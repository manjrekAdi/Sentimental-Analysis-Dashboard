from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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