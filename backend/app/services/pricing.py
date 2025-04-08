import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from app.services.geocode import geocode_address
from app.utils.distance import haversine_distance
import asyncio
import os

# === Load the machine learning model and encoder once at startup ===
BASE_DIR = os.path.dirname(__file__)
model = joblib.load(os.path.join(BASE_DIR, "realistic_price_model_mega.pkl"))
encoder = joblib.load(os.path.join(BASE_DIR, "realistic_encoder_mega.pkl"))

# === Generate features for prediction based on current context and inputs ===
def build_features(provider: str, base_price: float, distance: float, cab_type: str):
    now = datetime.now()
    hour = now.hour
    day = now.weekday()

    is_peak = int(7 <= hour <= 10 or 17 <= hour <= 20)  # Morning or evening rush hour
    is_weekend = int(day >= 5)  # Saturday or Sunday

    # Define trip type based on distance
    trip_type = (
        "short" if distance <= 3 else
        "medium" if distance <= 10 else
        "long"
    )

    # Simulate surge levels
    surge_level = (
        3 if is_peak and np.random.rand() > 0.5 else
        2 if is_peak else
        1
    )

    # Return all relevant features for ML model
    return {
        "distance_km": distance,
        "cab_type": cab_type,
        "hour_of_day": hour,
        "day_of_week": day,
        "provider": provider,
        "base_price": base_price,
        "is_peak_hour": is_peak,
        "is_weekend": is_weekend,
        "trip_type": trip_type,
        "surge_level": surge_level
    }

# === Predict the cab price using model and optionally add fluctuations ===
def predict_price(features: dict) -> float:
    # Prepare categorical data
    cat_df = pd.DataFrame([{
        "cab_type": features["cab_type"],
        "provider": features["provider"],
        "trip_type": features["trip_type"]
    }])

    # Encode categorical features using fitted encoder
    encoded = encoder.transform(cat_df)

    # Prepare numerical features
    numerics = [[
        features["distance_km"], features["hour_of_day"], features["day_of_week"],
        features["base_price"], features["is_peak_hour"], features["is_weekend"],
        features["surge_level"]
    ]]

    # Combine encoded and numeric inputs for model
    final_input = np.concatenate([encoded, numerics], axis=1)

    # Make prediction
    predicted = model.predict(final_input)[0]

    # Add real-time fluctuation for realism
    if features["is_peak_hour"]:
        dynamic_factor = 1 + np.random.uniform(0.01, 0.08)
    else:
        dynamic_factor = 1 + np.random.uniform(-0.03, 0.01)

    fluctuated_price = predicted * dynamic_factor
    return float(round(fluctuated_price, 2))

# === Fetch the predicted price for a single provider ===
async def fetch_price(provider: dict, distance: float, cab_type: str = None):
    base_price = 5.0 if provider["name"] == "cab1" else 4.5  # Slight difference per provider
    features = build_features(provider["name"], base_price, distance, cab_type)
    predicted = predict_price(features)
    return {
        "provider": provider["name"],
        "price": predicted,
        "category": provider["category"],
        "breakdown": features  # Useful for debugging or display
    }

# === Compare prices from all providers for a given trip ===
async def compare_prices(category, pickup=None, dropoff=None, cab_type=None):
    # Prevent pricing if pickup and dropoff are the same
    if pickup and dropoff and pickup.strip().lower() == dropoff.strip().lower():
        return [
            {"provider": "cab1", "price": None, "error": "Same address"},
            {"provider": "cab2", "price": None, "error": "Same address"}
        ]

    # Default to 10 km if addresses are not available
    pickup_coords, dropoff_coords, distance = None, None, 10.0

    # Geocode addresses to get coordinates and calculate actual distance
    if pickup and dropoff:
        pickup_coords, pickup_err = await geocode_address(pickup)
        dropoff_coords, dropoff_err = await geocode_address(dropoff)
        if pickup_err or dropoff_err:
            return [
                {"provider": "cab1", "price": None, "error": pickup_err or dropoff_err},
                {"provider": "cab2", "price": None, "error": pickup_err or dropoff_err}
            ]
        distance = haversine_distance(*pickup_coords, *dropoff_coords)

    # Define cab providers to compare
    providers = [
        {"name": "cab1", "category": "ride"},
        {"name": "cab2", "category": "ride"}
    ]

    # Fetch and return predicted prices for all providers concurrently
    results = await asyncio.gather(*[fetch_price(p, distance, cab_type) for p in providers])
    return results
