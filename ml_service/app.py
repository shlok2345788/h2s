"""
ML Service Flask Application
Provides REST API for question analysis.
Runs on port 5001.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
import sys
from pathlib import Path

# Add parent directory to path so we can import ml_service modules
sys.path.insert(0, str(Path(__file__).parent))

from inference import get_analyzer_service

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)

# Load analyzer service lazily
analyzer = None

def get_analyzer():
    """Get analyzer, initializing on first use."""
    global analyzer
    if analyzer is None:
        analyzer = get_analyzer_service()
        if analyzer and analyzer.models_loaded:
            logger.info("✅ ML models loaded successfully")
        else:
            logger.warning("⚠️  WARNING: ML models not loaded. Training required.")
            logger.warning("   Run: python models.py training_data.csv")
    return analyzer

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    analyzer = get_analyzer()
    return jsonify({
        'status': 'ok',
        'service': 'ML Question Analyzer',
        'models_loaded': analyzer.models_loaded if analyzer else False,
    }), 200

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze a question.
    
    Request body:
    {
        "question": "What is photosynthesis?"
    }
    
    Response:
    {
        "success": true,
        "question": "...",
        "analysis": {
            "difficulty": {...},
            "quality": {...},
            "readability": {...},
            "flags": [...],
            "feature_importance": {...},
            "suggested_improvements": [...]
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: question'
            }), 400
        
        question = data['question'].strip()
        
        if len(question) < 3:
            return jsonify({
                'success': False,
                'error': 'Question must be at least 3 characters long'
            }), 400
        
        analyzer = get_analyzer()
        if not analyzer or not analyzer.models_loaded:
            logger.warning("Models not loaded, returning error")
            return jsonify({
                'success': False,
                'error': 'ML models not loaded. Please train models first: python models.py training_data.csv',
                'question': question,
            }), 503
        
        result = analyzer.analyze(question)
        
        return jsonify(result), 200 if result.get('success') else 400
    
    except Exception as e:
        logger.error(f"Error analyzing question: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/analyze-batch', methods=['POST'])
def analyze_batch():
    """
    Analyze multiple questions at once.
    
    Request body:
    {
        "questions": [
            "What is photosynthesis?",
            "Explain evolution."
        ]
    }
    
    Response:
    {
        "success": true,
        "results": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'questions' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: questions'
            }), 400
        
        questions = data['questions']
        
        if not isinstance(questions, list):
            return jsonify({
                'success': False,
                'error': 'questions must be a list'
            }), 400
        
        if len(questions) > 100:
            return jsonify({
                'success': False,
                'error': 'Maximum 100 questions per request'
            }), 400
        
        analyzer = get_analyzer()
        results = []
        for question in questions:
            if not isinstance(question, str):
                results.append({'success': False, 'error': 'Invalid question format'})
                continue
            
            result = analyzer.analyze(question) if analyzer and analyzer.models_loaded else {
                'success': False,
                'error': 'ML models not loaded'
            }
            results.append(result)
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        }), 200
    
    except Exception as e:
        logger.error(f"Error in batch analysis: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/models/status', methods=['GET'])
def model_status():
    """Get status of loaded models."""
    if not analyzer:
        return jsonify({
            'status': 'not_initialized',
            'message': 'Analyzer service not initialized'
        }), 503
    
    return jsonify({
        'status': 'ok' if analyzer.models_loaded else 'not_loaded',
        'models_loaded': analyzer.models_loaded,
        'message': 'Models loaded successfully' if analyzer.models_loaded else 'Models need to be trained. Run: python models.py training_data.csv'
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'success': False, 'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {str(error)}")
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize analyzer so health endpoint reflects model state at startup
    get_analyzer()
    
    logger.info("\n" + "="*60)
    logger.info("🚀 Starting ML Question Analyzer Service...")
    logger.info("="*60)
    logger.info(f"Service running on http://localhost:5001")
    logger.info("\n📊 Endpoints:")
    logger.info("  POST /analyze - Analyze a single question")
    logger.info("  POST /analyze-batch - Analyze multiple questions")
    logger.info("  GET /health - Health check")
    logger.info("  GET /models/status - Model status")
    logger.info("="*60 + "\n")
    
    app.run(host='127.0.0.1', port=5001, debug=False, use_reloader=False)
