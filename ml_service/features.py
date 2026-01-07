"""
Feature Engineering Module
Extracts linguistic, readability, cognitive, and semantic features from questions.
"""

import re
import math
import numpy as np
from typing import Dict, List, Tuple
from sentence_transformers import SentenceTransformer

# Initialize SBERT model (runs once on import)
SBERT_MODEL = None

def get_sbert_model():
    """Lazy load SBERT model"""
    global SBERT_MODEL
    if SBERT_MODEL is None:
        SBERT_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    return SBERT_MODEL


# ============================================================================
# 1. LINGUISTIC FEATURES
# ============================================================================

def extract_linguistic_features(text: str) -> Dict[str, float]:
    """
    Extract basic linguistic features from question text.
    
    Features:
    - sentence_length: Average number of words
    - word_length: Average characters per word
    - clause_count: Number of clauses (approximated by comma + conjunctions)
    - passive_voice_ratio: Ratio of passive voice constructions
    - negation_count: Number of negations (not, no, never, etc.)
    - question_mark_count: Number of question marks
    """
    
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Basic stats
    word_count = len(words)
    sentence_count = max(len(sentences), 1)
    avg_sentence_length = word_count / sentence_count
    
    avg_word_length = np.mean([len(w) for w in words]) if words else 0
    
    # Clause count (rough approximation)
    clause_matches = re.findall(r',|\band\b|\bor\b|\bbut\b|\bwhich\b|\bthat\b', text.lower())
    clause_count = len(clause_matches) + sentence_count
    
    # Passive voice detection (simplified)
    passive_pattern = r'\bwas\b|\bwere\b|\bbeen\b|\bby\b'
    passive_count = len(re.findall(passive_pattern, text.lower()))
    passive_voice_ratio = passive_count / sentence_count if sentence_count > 0 else 0
    
    # Negation count
    negation_pattern = r'\bnot\b|\bno\b|\bnever\b|\bneither\b|\bnor\b|\bwithout\b'
    negation_count = len(re.findall(negation_pattern, text.lower()))
    
    # Question marks
    question_mark_count = text.count('?')
    
    return {
        'avg_sentence_length': float(avg_sentence_length),
        'avg_word_length': float(avg_word_length),
        'clause_count': float(clause_count),
        'passive_voice_ratio': float(passive_voice_ratio),
        'negation_count': float(negation_count),
        'question_mark_count': float(question_mark_count),
        'word_count': float(word_count),
        'sentence_count': float(sentence_count),
    }


# ============================================================================
# 2. READABILITY METRICS
# ============================================================================

def flesch_reading_ease(text: str) -> float:
    """
    Flesch Reading Ease Score (0-100)
    Higher = Easier
    
    Formula: 206.835 - 1.015(W/S) - 84.6(Sy/W)
    W = words, S = sentences, Sy = syllables
    """
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    word_count = len(words)
    sentence_count = max(len(sentences), 1)
    syllable_count = sum(_count_syllables(word) for word in words)
    
    if word_count == 0:
        return 0.0
    
    score = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
    return max(0, min(100, score))  # Clamp to [0, 100]


def flesch_kincaid_grade(text: str) -> float:
    """
    Flesch-Kincaid Grade Level (0-18+)
    Approximates US school grade level.
    
    Formula: 0.39(W/S) + 11.8(Sy/W) - 15.59
    """
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    word_count = len(words)
    sentence_count = max(len(sentences), 1)
    syllable_count = sum(_count_syllables(word) for word in words)
    
    if word_count == 0:
        return 0.0
    
    grade = 0.39 * (word_count / sentence_count) + 11.8 * (syllable_count / word_count) - 15.59
    return max(0, grade)


def gunning_fog_index(text: str) -> float:
    """
    Gunning Fog Index (0-18+)
    Estimates years of education needed.
    
    Formula: 0.4 * [(W/S) + 100*(complex_words/W)]
    Complex words = 3+ syllables
    """
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    word_count = len(words)
    sentence_count = max(len(sentences), 1)
    
    # Count complex words (3+ syllables)
    complex_word_count = sum(1 for word in words if _count_syllables(word) >= 3)
    
    if word_count == 0:
        return 0.0
    
    index = 0.4 * ((word_count / sentence_count) + 100 * (complex_word_count / word_count))
    return max(0, index)


def smog_index(text: str) -> float:
    """
    SMOG Index (Simple Measure of Gobbledygook)
    Years of education needed to understand text.
    
    Formula: 1.0430 * sqrt(polysyllable_count * 30/sentence_count) + 3.1291
    Polysyllable = 3+ syllables
    """
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    sentence_count = max(len(sentences), 1)
    polysyllable_count = sum(1 for word in words if _count_syllables(word) >= 3)
    
    if polysyllable_count == 0:
        return 0.0
    
    score = 1.0430 * math.sqrt(polysyllable_count * 30 / sentence_count) + 3.1291
    return max(0, score)


def _count_syllables(word: str) -> int:
    """
    Estimate syllable count using vowel groups.
    This is a simple approximation.
    """
    word = word.lower()
    count = 0
    vowels = 'aeiouy'
    prev_was_vowel = False
    
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_was_vowel:
            count += 1
        prev_was_vowel = is_vowel
    
    # Adjust for silent e
    if word.endswith('e'):
        count -= 1
    
    # Adjust for -le
    if word.endswith('le') and len(word) > 2 and word[-3] not in vowels:
        count += 1
    
    return max(1, count)


def extract_readability_features(text: str) -> Dict[str, float]:
    """
    Extract all readability metrics.
    """
    return {
        'flesch_reading_ease': flesch_reading_ease(text),
        'flesch_kincaid_grade': flesch_kincaid_grade(text),
        'gunning_fog_index': gunning_fog_index(text),
        'smog_index': smog_index(text),
    }


# ============================================================================
# 3. BLOOM'S TAXONOMY FEATURES
# ============================================================================

BLOOM_VERBS = {
    # Level 1: Remember
    1: {'define', 'list', 'name', 'recall', 'recite', 'state', 'write', 'label', 'identify'},
    
    # Level 2: Understand
    2: {'explain', 'summarize', 'describe', 'interpret', 'discuss', 'translate', 'illustrate', 'paraphrase', 'infer'},
    
    # Level 3: Apply
    3: {'solve', 'calculate', 'apply', 'demonstrate', 'illustrate', 'use', 'show', 'construct', 'complete', 'produce'},
    
    # Level 4: Analyze
    4: {'compare', 'contrast', 'distinguish', 'examine', 'analyze', 'justify', 'categorize', 'differentiate', 'separate'},
    
    # Level 5: Evaluate
    5: {'critique', 'evaluate', 'judge', 'justify', 'assess', 'debate', 'support', 'defend', 'choose'},
    
    # Level 6: Create
    6: {'create', 'design', 'develop', 'synthesize', 'compose', 'generate', 'plan', 'write', 'construct', 'organize'},
}


def extract_bloom_features(text: str) -> Dict[str, float]:
    """
    Extract Bloom's taxonomy cognitive level features.
    
    Returns:
    - highest_bloom_level: 1-6
    - bloom_level_count: Number of words matching each level
    """
    words = text.lower().split()
    
    bloom_counts = {i: 0 for i in range(1, 7)}
    highest_level = 1
    
    for word in words:
        # Remove punctuation
        clean_word = re.sub(r'[^\w]', '', word)
        
        for level, verbs in BLOOM_VERBS.items():
            if clean_word in verbs:
                bloom_counts[level] += 1
                highest_level = max(highest_level, level)
    
    return {
        'highest_bloom_level': float(highest_level),
        'bloom_level_1_remember': float(bloom_counts[1]),
        'bloom_level_2_understand': float(bloom_counts[2]),
        'bloom_level_3_apply': float(bloom_counts[3]),
        'bloom_level_4_analyze': float(bloom_counts[4]),
        'bloom_level_5_evaluate': float(bloom_counts[5]),
        'bloom_level_6_create': float(bloom_counts[6]),
    }


# ============================================================================
# 4. SEMANTIC FEATURES (SBERT EMBEDDINGS)
# ============================================================================

def extract_semantic_embedding(text: str) -> np.ndarray:
    """
    Extract SBERT embedding (384 dimensions for MiniLM).
    This is a fixed-size vector representation of semantic meaning.
    """
    model = get_sbert_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding


def extract_semantic_features(text: str, embedding: np.ndarray = None) -> Dict[str, float]:
    """
    Extract semantic features from SBERT embedding.
    
    Features:
    - embedding_magnitude: L2 norm of embedding
    - embedding_entropy: Entropy of normalized embedding
    """
    if embedding is None:
        embedding = extract_semantic_embedding(text)
    
    # Magnitude
    magnitude = np.linalg.norm(embedding)
    
    # Entropy of normalized embedding (as probability distribution)
    normalized = np.abs(embedding) / (np.sum(np.abs(embedding)) + 1e-10)
    entropy = -np.sum(normalized * np.log(normalized + 1e-10))
    
    return {
        'embedding_magnitude': float(magnitude),
        'embedding_entropy': float(entropy),
    }


# ============================================================================
# 5. COMBINED FEATURE EXTRACTION
# ============================================================================

def extract_all_features(text: str) -> Tuple[Dict[str, float], np.ndarray]:
    """
    Extract all features from a question text.
    
    Returns:
    - features_dict: All numeric features (linguistic, readability, bloom, semantic)
    - embedding: SBERT embedding vector
    """
    # Extract each feature group
    linguistic = extract_linguistic_features(text)
    readability = extract_readability_features(text)
    bloom = extract_bloom_features(text)
    embedding = extract_semantic_embedding(text)
    semantic = extract_semantic_features(text, embedding)
    
    # Combine all features
    all_features = {
        **linguistic,
        **readability,
        **bloom,
        **semantic,
    }
    
    return all_features, embedding


def get_feature_names() -> List[str]:
    """
    Get list of all feature names in extraction order.
    Useful for model training.
    """
    return [
        # Linguistic
        'avg_sentence_length', 'avg_word_length', 'clause_count',
        'passive_voice_ratio', 'negation_count', 'question_mark_count',
        'word_count', 'sentence_count',
        
        # Readability
        'flesch_reading_ease', 'flesch_kincaid_grade',
        'gunning_fog_index', 'smog_index',
        
        # Bloom's Taxonomy
        'highest_bloom_level',
        'bloom_level_1_remember', 'bloom_level_2_understand', 'bloom_level_3_apply',
        'bloom_level_4_analyze', 'bloom_level_5_evaluate', 'bloom_level_6_create',
        
        # Semantic
        'embedding_magnitude', 'embedding_entropy',
    ]


if __name__ == '__main__':
    # Test feature extraction
    sample_text = "Analyze the economic impact of trade policies on developing nations."
    
    features, embedding = extract_all_features(sample_text)
    
    print("Extracted Features:")
    for name, value in sorted(features.items()):
        print(f"  {name}: {value:.4f}")
    
    print(f"\nEmbedding shape: {embedding.shape}")
    print(f"Embedding norm: {np.linalg.norm(embedding):.4f}")
