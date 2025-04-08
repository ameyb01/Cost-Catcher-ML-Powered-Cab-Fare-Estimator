# Cost-Catcher-ML-Powered-Cab-Fare-Estimator

Backend Setup

Step into backend
cd backend

Create virtual environment
python -m venv env

Activate env (Windows)
.\env\Scripts\activate

Install dependencies
pip install -r requirements.txt

Create config file for API key
echo OPENCAGE_API_KEY = "put your api here" > app/config.py

Start backend server
uvicorn app.main:app --reload --port 8000

Frontend Setup

Step into frontend
cd frontend

Install dependencies
npm install

Start React app
npm start

Generate Dataset
Synthetic ride pricing data is generated using generate_dataset.py. It creates realistic fare estimates based on:

Distance, Time of Day, Day of Week

Cab Type (Economy, Minivan, etc.)

Provider (Kuber, Dryft) :)

Peak hours, Surge levels, Trip type

Train ML Model
The train_model.py script:

Loads and preprocesses the dataset

Uses OneHotEncoder + XGBoost

Performs Optuna tuning for best results

Saves model and encoder for backend use
