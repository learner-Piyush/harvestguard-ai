import os
import pickle
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "produce_shelf_life.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "shelf_life_model.pkl")


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"[train] Loaded {len(df)} rows from {path}")
    print(f"[train] Columns: {list(df.columns)}")
    return df


def build_pipeline() -> Pipeline:
    categorical_features = ["produce_type", "ripeness_stage"]
    numerical_features = ["defect_count"]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_features,
            ),
        ],
        remainder="passthrough",
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=200,
                    max_depth=None,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    return pipeline


def train_and_save():
    df = load_data(DATA_PATH)

    feature_cols = ["produce_type", "ripeness_stage", "defect_count"]
    target_col = "shelf_life_days"

    X = df[feature_cols]
    y = df[target_col]

    pipeline = build_pipeline()
    pipeline.fit(X, y)
    print("[train] Model training complete.")

    preds = pipeline.predict(X)
    mae = (abs(preds - y)).mean()
    print(f"[train] Training MAE: {mae:.2f} days")

    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"[train] Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()
