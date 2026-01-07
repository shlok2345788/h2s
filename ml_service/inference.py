"""
ML Inference Service
Main entry point for question analysis.
Returns professional judge-grade output.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Optional

from features import extract_all_features, extract_readability_features
from models import DifficultyClassifier, QualityRegressor
from flags import detect_all_flags, get_flag_info


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================================
# INFERENCE SERVICE
# ============================================================================

class QuestionAnalyzerService:
    """Main service for analyzing question difficulty and quality."""
    
    def __init__(self):
        """Initialize models from disk."""
        self.difficulty_clf = None
        self.quality_reg = None
        self.models_loaded = False
        
        try:
            self.difficulty_clf = DifficultyClassifier.load()
            self.quality_reg = QualityRegressor.load()
            self.models_loaded = True
            logger.info("Models loaded successfully")
        except FileNotFoundError:
            logger.warning("Models not found. Run training first: python models.py <training_data.csv>")
    
    def analyze(self, question: str) -> Dict:
        """
        Analyze a question and return comprehensive results.
        
        Args:
        - question: The question text to analyze
        
        Returns:
        - Dict with difficulty, quality_score, flags, explanation, etc.
        """
        
        if not self.models_loaded:
            return {
                'error': 'Models not loaded. Please train models first.',
                'success': False
            }
        
        # Extract features
        logger.info(f"Analyzing question: {question[:50]}...")
        features, embedding = extract_all_features(question)
        
        # Get readability info
        readability = extract_readability_features(question)
        
        # Predict difficulty
        difficulty, difficulty_confidence = self.difficulty_clf.predict(features)
        
        # Predict quality score
        quality_score = self.quality_reg.predict(features)
        
        # Detect flags
        flags = detect_all_flags(question, features, difficulty_confidence, quality_score)
        
        # Get explanations
        difficulty_explanation = self._get_difficulty_explanation(features)
        quality_explanation = self._get_quality_explanation(features, quality_score)
        
        # Get feature contributions
        difficulty_top_features = self.difficulty_clf.explain(features)
        quality_top_features = self.quality_reg.explain(features)
        
        # Calculate additional confidence metrics
        quality_confidence = self._calculate_quality_confidence(quality_score)
        overall_confidence = (difficulty_confidence + quality_confidence) / 2
        
        # Build response
        response = {
            'success': True,
            'question': question,
            'model_version': 'v1.0',
            'analysis': {
                'difficulty': {
                    'level': difficulty,
                    'confidence': round(difficulty_confidence, 3),
                    'explanation': difficulty_explanation,
                    'confidence_interpretation': self._interpret_confidence(difficulty_confidence),
                },
                'quality': {
                    'score': round(quality_score, 1),
                    'confidence': round(quality_confidence, 3),
                    'explanation': quality_explanation,
                    'grade': self._quality_to_grade(quality_score),
                },
                'readability': {
                    'flesch_ease': round(readability['flesch_reading_ease'], 1),
                    'grade_level': round(readability['flesch_kincaid_grade'], 1),
                    'assessment': self._assess_readability(readability['flesch_kincaid_grade']),
                },
                'flags': [
                    {
                        'key': flag,
                        'title': get_flag_info(flag).get('title', flag),
                        'description': get_flag_info(flag).get('description'),
                        'suggestion': get_flag_info(flag).get('suggestion'),
                        'severity': get_flag_info(flag).get('severity', 'medium'),
                    }
                    for flag in flags
                ] if flags else [],
                'feature_importance': {
                    'difficulty': [(name, round(val, 4)) for name, val in difficulty_top_features[:3]],
                    'quality': [(name, round(val, 4)) for name, val in quality_top_features[:3]],
                },
                'suggested_improvements': self._get_suggestions(flags, quality_score),
                'overall_confidence': round(overall_confidence, 3),
            }
        }
        
        return response
    
    @staticmethod
    def _get_difficulty_explanation(features: Dict) -> str:
        """Generate human-readable explanation for difficulty."""
        bloom_level = int(features.get('highest_bloom_level', 1))
        gunning_fog = features.get('gunning_fog_index', 0)
        
        bloom_descriptions = {
            1: 'recalls facts or basic concepts',
            2: 'requires understanding concepts',
            3: 'requires applying knowledge',
            4: 'requires analyzing concepts',
            5: 'requires evaluating information',
            6: 'requires creating new knowledge',
        }
        
        bloom_desc = bloom_descriptions.get(min(bloom_level, 6), '')
        
        if gunning_fog < 8:
            readability = 'simple, clear language'
        elif gunning_fog < 12:
            readability = 'college-level language'
        else:
            readability = 'advanced, technical language'
        
        return f"Question {bloom_desc} and uses {readability}."
    
    @staticmethod
    def _get_quality_explanation(features: Dict, quality_score: float) -> str:
        """Generate human-readable explanation for quality."""
        if quality_score >= 85:
            return "High-quality question with clear structure and appropriate difficulty."
        elif quality_score >= 70:
            return "Good question with minor issues in clarity or scope."
        elif quality_score >= 50:
            return "Fair question, but has significant issues affecting clarity or alignment."
        else:
            return "Question needs substantial revision to meet quality standards."
    
    @staticmethod
    def _assess_readability(grade_level: float) -> str:
        """Assess readability based on grade level."""
        if grade_level < 6:
            return 'Elementary school level'
        elif grade_level < 9:
            return 'Middle school level'
        elif grade_level < 13:
            return 'High school level'
        elif grade_level < 16:
            return 'College level'
        else:
            return 'Graduate level'
    
    @staticmethod
    def _calculate_quality_confidence(quality_score: float) -> float:
        """Calculate confidence for quality prediction based on score distribution."""
        # Higher confidence for extreme scores, lower for mid-range
        # Normalized to 0-1 range
        distance_from_center = abs(quality_score - 50) / 50
        return 0.6 + (distance_from_center * 0.4)
    
    @staticmethod
    def _interpret_confidence(confidence: float) -> str:
        """Interpret confidence score as human-readable text."""
        if confidence >= 0.9:
            return 'Very High'
        elif confidence >= 0.75:
            return 'High'
        elif confidence >= 0.6:
            return 'Moderate'
        else:
            return 'Low'
    
    @staticmethod
    def _quality_to_grade(quality_score: float) -> str:
        """Convert quality score to letter grade."""
        if quality_score >= 90:
            return 'A+'
        elif quality_score >= 85:
            return 'A'
        elif quality_score >= 80:
            return 'A-'
        elif quality_score >= 75:
            return 'B+'
        elif quality_score >= 70:
            return 'B'
        elif quality_score >= 65:
            return 'B-'
        elif quality_score >= 60:
            return 'C+'
        elif quality_score >= 55:
            return 'C'
        else:
            return 'C-'
    
    @staticmethod
    def _get_suggestions(flags: list, quality_score: float) -> list:
        """Generate actionable suggestions for improvement."""
        suggestions = []
        
        if not flags and quality_score >= 85:
            return ['Question appears well-crafted. Minor refinements recommended.']
        
        if quality_score < 50:
            suggestions.append('Prioritize clarity: rewrite for conciseness and precision.')
        
        if 'too_long' in flags:
            suggestions.append('Break into multiple shorter questions for better focus.')
        elif 'too_short' in flags:
            suggestions.append('Add context and specificity to the question.')
        
        if 'ambiguous_pronouns' in flags:
            suggestions.append('Replace pronouns (it, that, this) with specific nouns.')
        
        if 'vague_quantifiers' in flags:
            suggestions.append('Replace vague terms (many, some) with specific numbers.')
        
        if 'missing_context' in flags:
            suggestions.append('Add a scenario or example to establish context.')
        
        if quality_score < 60:
            suggestions.append('Have subject matter experts review for alignment to learning objectives.')
        
        return suggestions or ['Review question structure and clarity.']


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_service_instance = None

def get_analyzer_service() -> QuestionAnalyzerService:
    """Get or create the analyzer service (singleton)."""
    global _service_instance
    if _service_instance is None:
        _service_instance = QuestionAnalyzerService()
    return _service_instance


# ============================================================================
# STANDALONE ANALYSIS FUNCTION
# ============================================================================

def analyze_question(question: str) -> Dict:
    """
    Analyze a single question.
    
    Usage:
        result = analyze_question("What is photosynthesis?")
        print(json.dumps(result, indent=2))
    """
    service = get_analyzer_service()
    return service.analyze(question)


if __name__ == '__main__':
    # Test inference
    import sys
    
    if len(sys.argv) > 1:
        question = ' '.join(sys.argv[1:])
    else:
        # Test questions
        test_questions = [
            "What is photosynthesis?",
            "Analyze the economic impact of trade policies on developing nations.",
            "It is important.",
            "What are the multiple perspectives on climate change and how do they differ in their emphasis on various contributing factors?",
        ]
        
        service = get_analyzer_service()
        
        for q in test_questions:
            print("\n" + "=" * 80)
            print(f"Question: {q}")
            print("=" * 80)
            
            result = service.analyze(q)
            
            if result.get('success'):
                analysis = result['analysis']
                print(f"Difficulty: {analysis['difficulty']['level']} (confidence: {analysis['difficulty']['confidence']})")
                print(f"Quality: {analysis['quality']['score']}/100")
                print(f"Readability: {analysis['readability']['assessment']}")
                
                if analysis['flags']:
                    print("\nFlags:")
                    for flag in analysis['flags']:
                        print(f"  - {flag['title']}: {flag['suggestion']}")
                
                print("\nSuggestions:")
                for sugg in analysis['suggested_improvements']:
                    print(f"  - {sugg}")
            else:
                print("Error:", result.get('error'))
        
        sys.exit(0)
    
    # Single question analysis
    service = get_analyzer_service()
    result = analyze_question(question)
    print(json.dumps(result, indent=2))
