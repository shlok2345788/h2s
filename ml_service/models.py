"""
Model Training and Inference Module
Trains XGBoost for difficulty classification and RandomForest for quality prediction.
Includes SHAP explainability.
"""

import numpy as np
import pickle
import json
from typing import Dict, Tuple, List
from pathlib import Path

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

import pandas as pd

from features import extract_all_features, get_feature_names


# ---------------------------------------------------------------------------
# Pickle compatibility helper to load objects saved when running as __main__
# ---------------------------------------------------------------------------
class _RenamingUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        # Map __main__ references (created when training via `python models.py`)
        # back to this module so loads succeed when imported elsewhere.
        if module == '__main__':
            module = __name__
        return super().find_class(module, name)


# ============================================================================
# MODEL PATHS
# ============================================================================

MODEL_DIR = Path(__file__).parent / 'models'
MODEL_DIR.mkdir(exist_ok=True)

DIFFICULTY_MODEL_PATH = MODEL_DIR / 'difficulty_model.pkl'
QUALITY_MODEL_PATH = MODEL_DIR / 'quality_model.pkl'
SCALER_PATH = MODEL_DIR / 'scaler.pkl'
LABEL_ENCODER_PATH = MODEL_DIR / 'label_encoder.pkl'
METADATA_PATH = MODEL_DIR / 'metadata.json'


# ============================================================================
# TRAINING DATA LOADER
# ============================================================================

def load_training_data(csv_path: str) -> Tuple[pd.DataFrame, List[str], List[float]]:
    """
    Load training data from CSV.
    
    Expected CSV format:
    question,difficulty,quality_score
    "What is photosynthesis?",Easy,75
    "Analyze the economic policies...",Hard,85
    
    Returns:
    - features_df: DataFrame with all extracted features
    - difficulties: List of difficulty labels
    - quality_scores: List of quality scores (0-100)
    """
    df = pd.read_csv(csv_path)
    
    # Extract features for all questions
    feature_dicts = []
    embeddings = []
    
    for question in df['question'].values:
        features, embedding = extract_all_features(question)
        feature_dicts.append(features)
        embeddings.append(embedding)
    
    # Create feature DataFrame
    features_df = pd.DataFrame(feature_dicts)
    
    # Add PCA-reduced embeddings (use top components)
    from sklearn.decomposition import PCA
    pca = PCA(n_components=8)
    embedding_reduced = pca.fit_transform(np.array(embeddings))
    
    for i in range(8):
        features_df[f'embedding_pca_{i}'] = embedding_reduced[:, i]
    
    # Get labels and quality scores
    difficulties = df['difficulty'].values.tolist()
    quality_scores = df['quality_score'].values.astype(float).tolist()
    
    return features_df, difficulties, quality_scores, embeddings, pca


# ============================================================================
# DIFFICULTY CLASSIFICATION
# ============================================================================

class DifficultyClassifier:
    """Train and predict question difficulty."""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = get_feature_names() + [f'embedding_pca_{i}' for i in range(8)]
        self.shap_explainer = None
    
    def train(self, X: pd.DataFrame, y: List[str]) -> Dict:
        """
        Train difficulty classification model.
        
        Args:
        - X: Feature DataFrame
        - y: List of difficulty labels (Easy, Medium, Hard)
        
        Returns:
        - metrics: Dict with accuracy, f1_score, cross_val_score
        """
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        if HAS_XGBOOST:
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                eval_metric='mlogloss'
            )
        else:
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                random_state=42,
                n_jobs=-1
            )
        
        self.model.fit(X_scaled, y_encoded)
        
        # Compute metrics
        y_pred = self.model.predict(X_scaled)
        accuracy = accuracy_score(y_encoded, y_pred)
        f1 = f1_score(y_encoded, y_pred, average='weighted', zero_division=0)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_scaled, y_encoded, cv=5, scoring='accuracy')
        
        # Setup SHAP explainer
        if HAS_SHAP and not isinstance(self.model, xgb.XGBClassifier):
            self.shap_explainer = shap.TreeExplainer(self.model)
        
        return {
            'accuracy': float(accuracy),
            'f1_score': float(f1),
            'cv_mean': float(cv_scores.mean()),
            'cv_std': float(cv_scores.std()),
        }
    
    def predict(self, features: Dict) -> Tuple[str, float]:
        """
        Predict difficulty and confidence.
        
        Returns:
        - difficulty: 'Easy', 'Medium', or 'Hard'
        - confidence: 0.0-1.0
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Convert dict to DataFrame
        X = pd.DataFrame([features])
        X_scaled = self.scaler.transform(X)
        
        # Predict
        pred_encoded = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        confidence = float(np.max(probabilities))
        
        difficulty = self.label_encoder.inverse_transform([pred_encoded])[0]
        
        return difficulty, confidence
    
    def explain(self, features: Dict) -> List[Tuple[str, float]]:
        """
        Get SHAP feature importance for a prediction.
        
        Returns:
        - List of (feature_name, importance_value) tuples, sorted by importance
        """
        if self.shap_explainer is None:
            return []
        
        X = pd.DataFrame([features])
        X_scaled = self.scaler.transform(X)
        
        shap_values = self.shap_explainer.shap_values(X_scaled)
        
        # Get mean absolute SHAP values
        if isinstance(shap_values, list):  # Multi-class
            shap_values = shap_values[0]
        
        mean_abs_shap = np.abs(shap_values[0])
        
        # Rank features
        feature_importance = list(zip(self.feature_names, mean_abs_shap))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        return feature_importance[:5]  # Top 5 features
    
    def save(self, path: str = None):
        """Save model to disk."""
        path = path or str(DIFFICULTY_MODEL_PATH)
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load(path: str = None):
        """Load model from disk."""
        path = path or str(DIFFICULTY_MODEL_PATH)
        with open(path, 'rb') as f:
            return _RenamingUnpickler(f).load()


# ============================================================================
# QUALITY SCORE REGRESSION
# ============================================================================

class QualityRegressor:
    """Train and predict question quality score (0-100)."""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = get_feature_names() + [f'embedding_pca_{i}' for i in range(8)]
        self.shap_explainer = None
    
    def train(self, X: pd.DataFrame, y: List[float]) -> Dict:
        """
        Train quality score regression model.
        
        Args:
        - X: Feature DataFrame
        - y: List of quality scores (0-100)
        
        Returns:
        - metrics: Dict with MAE, R2, RMSE
        """
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_scaled, y)
        
        # Compute metrics
        y_pred = self.model.predict(X_scaled)
        mae = mean_absolute_error(y, y_pred)
        r2 = r2_score(y, y_pred)
        rmse = np.sqrt(np.mean((y - y_pred) ** 2))
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_scaled, y, cv=5, scoring='r2')
        
        # Setup SHAP explainer
        if HAS_SHAP:
            self.shap_explainer = shap.TreeExplainer(self.model)
        
        return {
            'mae': float(mae),
            'rmse': float(rmse),
            'r2': float(r2),
            'cv_mean': float(cv_scores.mean()),
            'cv_std': float(cv_scores.std()),
        }
    
    def predict(self, features: Dict) -> float:
        """
        Predict quality score (0-100).
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Convert dict to DataFrame
        X = pd.DataFrame([features])
        X_scaled = self.scaler.transform(X)
        
        # Predict and clamp to [0, 100]
        score = float(self.model.predict(X_scaled)[0])
        return max(0, min(100, score))
    
    def explain(self, features: Dict) -> List[Tuple[str, float]]:
        """
        Get SHAP feature importance for a prediction.
        """
        if self.shap_explainer is None:
            return []
        
        X = pd.DataFrame([features])
        X_scaled = self.scaler.transform(X)
        
        shap_values = self.shap_explainer.shap_values(X_scaled)[0]
        mean_abs_shap = np.abs(shap_values)
        
        # Rank features
        feature_importance = list(zip(self.feature_names, mean_abs_shap))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        return feature_importance[:5]  # Top 5 features
    
    def save(self, path: str = None):
        """Save model to disk."""
        path = path or str(QUALITY_MODEL_PATH)
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load(path: str = None):
        """Load model from disk."""
        path = path or str(QUALITY_MODEL_PATH)
        with open(path, 'rb') as f:
            return _RenamingUnpickler(f).load()


# ============================================================================
# FULL PIPELINE
# ============================================================================

def train_models(csv_path: str) -> Dict:
    """
    Train both difficulty and quality models.
    
    Args:
    - csv_path: Path to training data CSV
    
    Returns:
    - metrics: Dict with all training metrics
    """
    print("Loading training data...")
    X, difficulties, quality_scores, embeddings, pca = load_training_data(csv_path)
    
    print("\nTraining difficulty classifier...")
    difficulty_clf = DifficultyClassifier()
    difficulty_metrics = difficulty_clf.train(X, difficulties)
    difficulty_clf.save()
    
    print("\nTraining quality regressor...")
    quality_reg = QualityRegressor()
    quality_metrics = quality_reg.train(X, quality_scores)
    quality_reg.save()
    
    # Save metadata
    metadata = {
        'feature_names': get_feature_names() + [f'embedding_pca_{i}' for i in range(8)],
        'difficulty_metrics': difficulty_metrics,
        'quality_metrics': quality_metrics,
        'num_training_samples': len(X),
    }
    
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("\n" + "=" * 50)
    print("DIFFICULTY CLASSIFIER METRICS:")
    for key, value in difficulty_metrics.items():
        print(f"  {key}: {value:.4f}")
    
    print("\nQUALITY REGRESSOR METRICS:")
    for key, value in quality_metrics.items():
        print(f"  {key}: {value:.4f}")
    print("=" * 50)
    
    return {
        'difficulty': difficulty_metrics,
        'quality': quality_metrics,
    }


if __name__ == '__main__':
    # Example usage
    import sys
    
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
        metrics = train_models(csv_path)
    else:
        print("Usage: python models.py <path_to_training_data.csv>")
        print("\nExpected CSV format:")
        print("question,difficulty,quality_score")
        print('"What is photosynthesis?",Easy,75')
