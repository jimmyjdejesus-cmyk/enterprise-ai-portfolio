# Base Python Image
FROM python:3.11-slim

# Working directory
WORKDIR /app

# Prevent Python from writing .pyc files & buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose FastAPI application port
EXPOSE 8001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/api/meta')" || exit 1

RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Launch FastAPI High-Performance Analytics Server
ENTRYPOINT ["python", "server.py", "--host", "0.0.0.0", "--port", "8001"]
