import pandas as pd
import random
from datetime import datetime
import numpy as np

random.seed(42)

def generate_row():
    cab_types = ["Economy", "Quickest", "WaitAndSave", "Minivan", "BlackSUV"]
    providers = ["cab1", "cab2"]

    cab_type = random.choice(cab_types)
    provider = random.choice(providers)
    distance = round(random.uniform(0.5, 30), 2)

    # Time components
    hour = random.randint(0, 23)
    day = random.randint(0, 6)
    is_peak_hour = int(7 <= hour <= 10 or 17 <= hour <= 20)
    is_weekend = int(day >= 5)

    # Surge level
    surge_level = (
        3 if is_peak_hour and random.random() > 0.5 else
        2 if is_peak_hour else
        1
    )

    # Trip type
    trip_type = (
        "short" if distance <= 3 else
        "medium" if distance <= 10 else
        "long"
    )

    # Base price — fixed for both to remove provider bias
    base_price = 5.0  

    # Fare formula
    cab_type_factor = {
        "Economy": 1.0,
        "Quickest": 1.3,
        "WaitAndSave": 0.8,
        "Minivan": 1.6,
        "BlackSUV": 2.0
    }[cab_type]

    time_factor = 1.15 if is_peak_hour else 1.0
    surge_multiplier = 1.0 if time_factor == 1.0 else random.uniform(1.0, 1.5)

    per_km_rate = 0.95
    fare = (base_price + distance * per_km_rate) * cab_type_factor * surge_multiplier * time_factor

    # Introduce price tilt randomly (to break pattern)
    if random.random() > 0.5:
        fare *= 0.98 if provider == "cab1" else 1.02
    else:
        fare *= 1.02 if provider == "cab1" else 0.98

    # Add noise
    noise = fare * random.uniform(-0.025, 0.025)
    final_price = round(fare + noise, 2)

    return {
        "distance": distance,
        "hour": hour,
        "day": day,
        "base_price": base_price,
        "is_peak_hour": is_peak_hour,
        "is_weekend": is_weekend,
        "surge_level": surge_level,
        "cab_type": cab_type,
        "provider": provider,
        "trip_type": trip_type,
        "final_price": final_price
    }

# Generate dataset
rows = [generate_row() for _ in range(20000)]
df = pd.DataFrame(rows)
df.to_csv("simulator_pricing_data.csv", index=False)
print("Saved simulator_pricing_data.csv")
