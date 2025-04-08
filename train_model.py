import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import optuna
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
from optuna.samplers import TPESampler

# === LOAD DATA ===
df = pd.read_csv("simulator_pricing_data.csv")

# === Select relevant columns ===
categorical_cols = ["cab_type", "provider", "trip_type"]
numerical_cols = [
    "distance", "hour", "day", "base_price",
    "is_peak_hour", "is_weekend", "surge_level"
]
target_col = "final_price"

# === ENCODING (Fix: preserve column names) ===
encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
encoder.fit(df[categorical_cols])  # Fit on categorical columns

# Keep original column names for later consistency
cat_df = pd.DataFrame(df[categorical_cols], columns=categorical_cols)
encoded_cats = encoder.transform(cat_df)
encoded_cat_names = encoder.get_feature_names_out(categorical_cols)

X = pd.concat([
    pd.DataFrame(encoded_cats, columns=encoded_cat_names),
    df[numerical_cols].reset_index(drop=True)
], axis=1)

y = df[target_col]

# === TRAIN/TEST SPLIT ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === OPTUNA TUNING ===
def objective(trial):
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 200, 600),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.1),
        "max_depth": trial.suggest_int("max_depth", 3, 9),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 1.0),
        "reg_lambda": trial.suggest_float("reg_lambda", 0.0, 1.0),
        "random_state": 42,
        "n_jobs": -1,
    }

    model = xgb.XGBRegressor(**params)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    preds = model.predict(X_test)
    return mean_absolute_error(y_test, preds)

# === RUN STUDY ===
print("🔍 Starting hyperparameter tuning...")
study = optuna.create_study(direction="minimize", sampler=TPESampler(seed=42))
study.optimize(objective, n_trials=50)
print(f"Best MAE: ${study.best_value:.2f}")
print(f"Best params:\n{study.best_params}")

# === FINAL MODEL TRAINING ===
print("Training final model...")
best_params = study.best_params
best_params.update({"random_state": 42, "n_jobs": -1})
final_model = xgb.XGBRegressor(**best_params)
final_model.fit(X_train, y_train)

# === METRICS ===
y_pred = final_model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"\nFinal MAE:  ${mae:.2f}")
print(f"Final RMSE: ${rmse:.2f}")

# === SAVE MODEL + ENCODER ===
joblib.dump(final_model, "realistic_price_model_mega.pkl")
joblib.dump(encoder, "realistic_encoder_mega.pkl")
print("Saved: realistic_price_model_mega.pkl, realistic_encoder_mega.pkl")
