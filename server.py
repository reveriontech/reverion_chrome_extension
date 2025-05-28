#!/usr/bin/env python3
"""
Python backend server for Chrome extension
Provides API endpoints for text processing and analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import json
from collections import Counter
import string

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension requests

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Python server is running"})

@app.route('/process', methods=['POST'])
def process_text():
    """Process text input from the Chrome extension"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Example processing: reverse the text and make it uppercase
        processed = text[::-1].upper()
        
        # Add some additional processing
        word_count = len(text.split())
        char_count = len(text)
        
        result = {
            "result": processed,
            "original_length": char_count,
            "word_count": word_count,
            "processing_type": "reverse_uppercase"
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """Analyze text and return various metrics"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Text analysis
        words = text.lower().split()
        word_count = len(words)
        char_count = len(text)
        char_count_no_spaces = len(text.replace(' ', ''))
        
        # Sentence count (simple approach)
        sentences = re.split(r'[.!?]+', text)
        sentence_count = len([s for s in sentences if s.strip()])
        
        # Most common words
        word_freq = Counter(word.strip(string.punctuation) for word in words)
        most_common = word_freq.most_common(5)
        
        # Simple sentiment analysis (very basic)
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'happy', 'love', 'best']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'sad', 'angry', 'disappointed']
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        if positive_count > negative_count:
            sentiment = "Positive"
        elif negative_count > positive_count:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        
        result = {
            "word_count": word_count,
            "char_count": char_count,
            "char_count_no_spaces": char_count_no_spaces,
            "sentence_count": sentence_count,
            "most_common_words": most_common,
            "sentiment": sentiment,
            "positive_words_found": positive_count,
            "negative_words_found": negative_count
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    """Simple text transformation (example: ROT13)"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        transform_type = data.get('type', 'rot13')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if transform_type == 'rot13':
            # ROT13 transformation
            result_text = text.encode('rot13')
        elif transform_type == 'reverse':
            result_text = text[::-1]
        elif transform_type == 'uppercase':
            result_text = text.upper()
        elif transform_type == 'lowercase':
            result_text = text.lower()
        else:
            result_text = text
        
        result = {
            "original": text,
            "transformed": result_text,
            "transformation": transform_type
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/wordcloud', methods=['POST'])
def generate_word_data():
    """Generate word frequency data for word cloud visualization"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Clean and process text
        words = re.findall(r'\w+', text.lower())
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'}
        
        filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
        
        # Get word frequencies
        word_freq = Counter(filtered_words)
        
        # Convert to format suitable for visualization
        word_data = [{"word": word, "count": count} for word, count in word_freq.most_common(50)]
        
        result = {
            "word_data": word_data,
            "total_words": len(words),
            "unique_words": len(word_freq),
            "filtered_words": len(filtered_words)
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Python server for Chrome extension...")
    print("Server will run on http://localhost:8000")
    print("Make sure to install Flask and flask-cors: pip install flask flask-cors")
    app.run(host='localhost', port=8000, debug=True)