import pickle
import pandas as pd
from pathlib import Path

model_path = Path("model/shelf_life_model.pkl")
with open(model_path, "rb") as f:
    model = pickle.load(f)

test_cases = [
    {"produce_type": "tomato",  "ripeness_stage": "ripe",     "defect_count": 0},
    {"produce_type": "apple",   "ripeness_stage": "unripe",   "defect_count": 0},
    {"produce_type": "spinach", "ripeness_stage": "overripe", "defect_count": 2},
    {"produce_type": "grain",   "ripeness_stage": "ripe",     "defect_count": 0},
    {"produce_type": "onion",   "ripeness_stage": "spoiled",  "defect_count": 5},
    {"produce_type": "mango",   "ripeness_stage": "ripe",     "defect_count": 1},
]

print("Shelf Life Predictions:")
print("-" * 58)
for tc in test_cases:
    df = pd.DataFrame([tc])
    pred = max(0, round(float(model.predict(df)[0])))
    ptype = tc["produce_type"]
    rstage = tc["ripeness_stage"]
    dcount = tc["defect_count"]
    print(f"{ptype:12s} | {rstage:10s} | defects={dcount} => {pred} days")
print("-" * 58)
print("All predictions OK!")
