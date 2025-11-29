# 1. Base image
FROM python:3.11-slim

# 2. Work directory
WORKDIR /app

# 3. Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy reqs and install
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 5. Copy backend source
COPY . /app

# 6. Expose port
EXPOSE 8000

# 7. Start backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
