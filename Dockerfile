# Use a lightweight Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy dependency list first for efficient caching
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of backend code
COPY backend/ /app/

# Ensure model artifacts are present in the image (match file names exactly)
COPY backend/app/services/realistic_price_model_mega.pkl /app/app/services/
COPY backend/app/services/realistic_encoder_mega.pkl    /app/app/services/

# Set environment variable for port
ENV PORT=8080

# Run the FastAPI app using uvicorn (bind to all interfaces, honor $PORT)
CMD ["sh","-c","python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
