import pickle
from pathlib import Path
from typing import Literal
import pandas as pd
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "model" / "shelf_life_model.pkl"
DATA_PATH = BASE_DIR / "data" / "produce_shelf_life.csv"


app = FastAPI(
    title="HarvestGuard AI – Shelf Life Predictor",
    description=(
        "Predicts estimated shelf life in days based on produce type, "
        "ripeness stage, and visible defect count using a trained Random Forest model."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_model = None


def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise HTTPException(
                status_code=503,
                detail=(
                    "Model not found. Please run `python train_model.py` first "
                    "to generate model/shelf_life_model.pkl."
                ),
            )
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
    return _model


RIPENESS_STAGES = Literal["unripe", "ripe", "overripe", "spoiled"]


class PredictRequest(BaseModel):
    produce_type: str = Field(
        ...,
        description="Type of produce (e.g. tomato, apple, spinach)",
        examples=["tomato"],
    )
    ripeness_stage: RIPENESS_STAGES = Field(
        ...,
        description="Ripeness stage of the produce",
        examples=["ripe"],
    )
    defect_count: int = Field(
        ...,
        ge=0,
        description="Number of visible defects (blemishes, bruises, decay spots)",
        examples=[1],
    )


class PredictResponse(BaseModel):
    produce_type: str
    ripeness_stage: str
    defect_count: int
    predicted_shelf_life_days: int
    confidence_note: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: str


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    model_ready = MODEL_PATH.exists()
    return HealthResponse(
        status="ok" if model_ready else "model_missing",
        model_loaded=model_ready,
        model_path=str(MODEL_PATH),
    )


@app.get("/produce-types", tags=["Data"])
def list_produce_types():
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Training data CSV not found.")
    df = pd.read_csv(DATA_PATH)
    return {
        "produce_types": sorted(df["produce_type"].unique().tolist()),
        "ripeness_stages": sorted(df["ripeness_stage"].unique().tolist()),
    }


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict_shelf_life(request: PredictRequest):
    model = get_model()

    input_df = pd.DataFrame([{
        "produce_type": request.produce_type.strip().lower(),
        "ripeness_stage": request.ripeness_stage,
        "defect_count": request.defect_count,
    }])

    raw_prediction = model.predict(input_df)[0]

    predicted_days = max(0, round(float(raw_prediction)))

    if not DATA_PATH.exists():
        confidence_note = "Unknown produce type – prediction is extrapolated."
    else:
        df = pd.read_csv(DATA_PATH)
        known_types = df["produce_type"].str.lower().unique().tolist()
        if request.produce_type.strip().lower() in known_types:
            confidence_note = "Produce type found in training data – high confidence."
        else:
            confidence_note = (
                "Produce type not in training data – prediction extrapolated "
                "from similar produce patterns. Treat as estimate."
            )

    return PredictResponse(
        produce_type=request.produce_type,
        ripeness_stage=request.ripeness_stage,
        defect_count=request.defect_count,
        predicted_shelf_life_days=predicted_days,
        confidence_note=confidence_note,
    )
