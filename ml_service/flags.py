"""
Flag Detection Module
Detects quality issues in questions using rule-based and ML-based methods.
"""

import re
import numpy as np
from typing import List, Dict
from features import extract_linguistic_features, extract_readability_features, extract_bloom_features


# ============================================================================
# RULE-BASED FLAGS
# ============================================================================

class RuleBasedFlagDetector:
    """Detect quality issues using hand-crafted rules."""
    
    # Configuration thresholds
    MIN_QUESTION_LENGTH = 6  # words
    MAX_QUESTION_LENGTH = 40  # words
    AMBIGUOUS_PRONOUN_PATTERN = r'\b(it|that|this|these|those)\b'
    MULTIPLE_QUESTION_MARKS = 2
    
    @staticmethod
    def detect(text: str) -> List[str]:
        """
        Detect quality flags in a question.
        
        Returns:
        - List of flag messages
        """
        flags = []
        
        # 1. Too short
        word_count = len(text.split())
        if word_count < RuleBasedFlagDetector.MIN_QUESTION_LENGTH:
            flags.append(f"too_short")
        
        # 2. Too long
        if word_count > RuleBasedFlagDetector.MAX_QUESTION_LENGTH:
            flags.append(f"too_long")
        
        # 3. Multiple question marks
        question_mark_count = text.count('?')
        if question_mark_count >= RuleBasedFlagDetector.MULTIPLE_QUESTION_MARKS:
            flags.append(f"multiple_question_marks")
        
        # 4. Ambiguous pronouns (without clear antecedent)
        pronouns = re.findall(RuleBasedFlagDetector.AMBIGUOUS_PRONOUN_PATTERN, text.lower())
        if len(pronouns) > len(text.split()) * 0.15:  # > 15% pronouns
            flags.append(f"ambiguous_pronouns")
        
        # 5. Missing context keywords
        context_keywords = {
            'when': 0, 'where': 0, 'who': 0, 'why': 0, 'how': 0,
            'example': 0, 'case': 0, 'scenario': 0
        }
        text_lower = text.lower()
        keyword_count = sum(1 for kw in context_keywords if kw in text_lower)
        if keyword_count == 0 and word_count > 10:
            flags.append(f"missing_context")
        
        # 6. No verbs (likely incomplete)
        verb_patterns = [
            r'\b(is|are|was|were|be|have|has|do|does|can|could|should|would|may|might)\b',
            r'\b(want|need|require|ask|state|provide|describe|explain|analyze|evaluate)\b',
        ]
        has_verb = any(re.search(pattern, text.lower()) for pattern in verb_patterns)
        if not has_verb:
            flags.append(f"no_main_verb")
        
        # 7. Vague quantifiers
        vague_quantifiers = ['some', 'many', 'few', 'several', 'various', 'several']
        vague_count = sum(text.lower().count(vq) for vq in vague_quantifiers)
        if vague_count >= 2:
            flags.append(f"vague_quantifiers")
        
        return list(set(flags))  # Remove duplicates


# ============================================================================
# ML-BASED FLAGS
# ============================================================================

class MLBasedFlagDetector:
    """Detect quality issues using ML features."""
    
    # Thresholds based on feature analysis
    EMBEDDING_VARIANCE_THRESHOLD = 0.15
    PREDICTION_CONFIDENCE_THRESHOLD = 0.6
    
    @staticmethod
    def detect(features: Dict, difficulty_confidence: float, 
               quality_score: float, embeddings_collection: List[np.ndarray] = None) -> List[str]:
        """
        Detect quality flags using ML features.
        
        Args:
        - features: Extracted features dict
        - difficulty_confidence: Model confidence (0-1)
        - quality_score: Predicted quality score (0-100)
        - embeddings_collection: Optional - all embeddings for variance comparison
        
        Returns:
        - List of flag messages
        """
        flags = []
        
        # 1. Low prediction confidence
        if difficulty_confidence < MLBasedFlagDetector.PREDICTION_CONFIDENCE_THRESHOLD:
            flags.append(f"low_confidence_difficulty")
        
        # 2. Very low quality score
        if quality_score < 40:
            flags.append(f"low_quality_score")
        
        # 3. High entropy in embedding (ambiguous semantically)
        embedding_entropy = features.get('embedding_entropy', 0)
        if embedding_entropy > 4.5:  # High entropy = ambiguous
            flags.append(f"high_semantic_variance")
        
        # 4. Low readability (too academic)
        gunning_fog = features.get('gunning_fog_index', 0)
        if gunning_fog > 16:  # College+ level
            flags.append(f"high_abstract_terminology")
        
        # 5. Imbalanced Bloom levels (too easy or too hard)
        highest_bloom = features.get('highest_bloom_level', 1)
        bloom_sum = (features.get('bloom_level_1_remember', 0) +
                     features.get('bloom_level_2_understand', 0) +
                     features.get('bloom_level_3_apply', 0) +
                     features.get('bloom_level_4_analyze', 0) +
                     features.get('bloom_level_5_evaluate', 0) +
                     features.get('bloom_level_6_create', 0))
        
        if highest_bloom >= 5 and bloom_sum < 1:
            flags.append(f"high_cognitive_demand_unclear")
        
        return list(set(flags))


# ============================================================================
# UNIFIED FLAG DETECTOR
# ============================================================================

def detect_all_flags(text: str, features: Dict, difficulty_confidence: float,
                     quality_score: float) -> List[str]:
    """
    Detect all quality issues (rule-based + ML-based).
    
    Returns:
    - List of flag descriptions
    """
    rule_flags = RuleBasedFlagDetector.detect(text)
    ml_flags = MLBasedFlagDetector.detect(features, difficulty_confidence, quality_score)
    
    all_flags = list(set(rule_flags + ml_flags))
    
    return all_flags


# ============================================================================
# FLAG EXPLANATIONS
# ============================================================================

FLAG_EXPLANATIONS = {
    'too_short': {
        'title': 'Question too short',
        'description': 'Question has fewer than 6 words. May lack sufficient context or clarity.',
        'suggestion': 'Add more detail and context to the question.',
        'severity': 'high'
    },
    'too_long': {
        'title': 'Question too long',
        'description': 'Question exceeds 40 words. May be difficult to understand or contain multiple sub-questions.',
        'suggestion': 'Break into smaller, more focused questions or remove unnecessary information.',
        'severity': 'medium'
    },
    'multiple_question_marks': {
        'title': 'Multiple question marks',
        'description': 'Contains 2+ question marks, indicating potentially multiple sub-questions.',
        'suggestion': 'Separate into distinct questions or clarify what is being asked.',
        'severity': 'high'
    },
    'ambiguous_pronouns': {
        'title': 'Ambiguous pronouns',
        'description': 'Contains pronouns (it, that, this) that may lack clear antecedents.',
        'suggestion': 'Replace pronouns with specific nouns for clarity.',
        'severity': 'medium'
    },
    'missing_context': {
        'title': 'Missing contextual keywords',
        'description': 'Question lacks context markers (when, where, who, why, how) or examples.',
        'suggestion': 'Provide specific context, scenario, or example for better understanding.',
        'severity': 'medium'
    },
    'no_main_verb': {
        'title': 'No main verb',
        'description': 'Question lacks clear action verb, appears incomplete.',
        'suggestion': 'Ensure question contains a clear verb (describe, explain, analyze, etc).',
        'severity': 'high'
    },
    'vague_quantifiers': {
        'title': 'Vague quantifiers',
        'description': 'Contains vague terms (some, many, few, several) that lack precision.',
        'suggestion': 'Use specific numbers or clear qualifiers instead.',
        'severity': 'low'
    },
    'low_confidence_difficulty': {
        'title': 'Unclear difficulty level',
        'description': 'The model is uncertain about question difficulty, suggesting unclear structure.',
        'suggestion': 'Review question clarity and structure to make difficulty more apparent.',
        'severity': 'medium'
    },
    'low_quality_score': {
        'title': 'Overall low quality',
        'description': 'Multiple quality metrics indicate issues with this question.',
        'suggestion': 'Review the suggestions above and revise the question.',
        'severity': 'high'
    },
    'high_semantic_variance': {
        'title': 'Semantically ambiguous',
        'description': 'Question has high semantic variance (multiple interpretations).',
        'suggestion': 'Clarify the specific concept or skill being assessed.',
        'severity': 'medium'
    },
    'high_abstract_terminology': {
        'title': 'Highly abstract language',
        'description': 'Question uses complex, abstract terminology (Grade 16+).',
        'suggestion': 'Simplify language or provide definitions for technical terms.',
        'severity': 'medium'
    },
    'high_cognitive_demand_unclear': {
        'title': 'High cognitive demand without clarity',
        'description': 'Requires high-level thinking but lacks clear structure.',
        'suggestion': 'Provide more explicit guidance or step-by-step structure.',
        'severity': 'high'
    }
}


def get_flag_info(flag_key: str) -> Dict:
    """Get explanation and suggestions for a flag."""
    default_info = {
        'title': flag_key,
        'description': 'Quality issue detected.',
        'suggestion': 'Review and revise the question.',
        'severity': 'medium'
    }
    return FLAG_EXPLANATIONS.get(flag_key, default_info)


if __name__ == '__main__':
    # Test flag detection
    test_questions = [
        "What?",  # Too short
        "What is the historical, cultural, and economic significance of the Silk Road and how did it impact trade relationships between Europe and Asia?",  # Too long
        "What is photosynthesis? Is it important? Should we learn it??",  # Multiple marks
        "It is important and should be studied carefully.",  # No question mark
    ]
    
    for q in test_questions:
        flags = RuleBasedFlagDetector.detect(q)
        print(f"Question: {q[:50]}...")
        print(f"Flags: {flags}\n")
