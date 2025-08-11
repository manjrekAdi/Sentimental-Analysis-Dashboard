#!/usr/bin/env python3
"""
Generate a secure secret key for Flask application
"""

import secrets

def generate_secret_key():
    """Generate a secure random secret key"""
    secret_key = secrets.token_hex(32)
    print("🔐 GENERATED SECRET KEY")
    print("=" * 50)
    print(f"SECRET_KEY={secret_key}")
    print("=" * 50)
    print("💡 Copy this key and use it in your .env file and Render dashboard")
    return secret_key

if __name__ == "__main__":
    generate_secret_key()

