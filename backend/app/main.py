# backend/app/main.py

import sys
import os
from fastapi.middleware.cors import CORSMiddleware

# Add the project root to the system path so that modules can be imported easily
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

# Create an instance of the FastAPI application
app = FastAPI()

# Enable CORS (Cross-Origin Resource Sharing) to allow the frontend (React app) to access this backend


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mlcostcatcher.vercel.app"],
    allow_origin_regex=r"https://.*\.vercel\.app$",  # allow preview deployments too
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes from the routes.py file
app.include_router(api_router)
