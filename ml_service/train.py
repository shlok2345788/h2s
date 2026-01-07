import json
from pathlib import Path
from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion
from sklearn.metrics import classification_report, mean_squared_error

DATA_PATH = Path("data/questions.csv")
ARTIFACT_DIR = Path("artifacts")
ARTIFACT_DIR.mkdir(exist_ok=True, parents=True)


def load_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError("questions.csv not found. Add labeled data before training.")
    return pd.read_csv(DATA_PATH)


def build_features(texts: List[str]) -> Tuple[TfidfVectorizer, np.ndarray]:
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=20000)
    X = vectorizer.fit_transform(texts)
    return vectorizer, X


def train_models(df: pd.DataFrame):
    df = df.dropna(subset=["question", "difficulty_label"])
    texts = df["question"].tolist()
    vectorizer, X = build_features(texts)

    y_cls = df["difficulty_label"]
    cls_model = LogisticRegression(max_iter=200)
    cls_model.fit(X, y_cls)

    reg_model = None
    if "quality_score" in df.columns:
        df_quality = df.dropna(subset=["quality_score"])
        if not df_quality.empty:
            Xq = vectorizer.transform(df_quality["question"].tolist())
            y_reg = df_quality["quality_score"].astype(float)
            reg_model = LinearRegression()
            reg_model.fit(Xq, y_reg)

    # Save artifacts
    artifacts = {
        "vectorizer": vectorizer,
        "cls_model": cls_model,
        "reg_model": reg_model,
    }
    with open(ARTIFACT_DIR / "artifacts.pkl", "wb") as f:
        import pickle

        pickle.dump(artifacts, f)

    print("Difficulty report:\n", classification_report(y_cls, cls_model.predict(X)))
    if reg_model is not None:
        preds = reg_model.predict(Xq)
        print("Quality RMSE", mean_squared_error(y_reg, preds, squared=False))


def main():
    df = load_data()
    train_models(df)


if __name__ == "__main__":
    main()
