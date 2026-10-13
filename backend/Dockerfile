FROM python:3.12-slim

# Install system compiler toolchain (gcc, g++, make)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root unprivileged execution user
RUN useradd -m -u 1000 ide_runner

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/

# Set ownership
RUN chown -R ide_runner:ide_runner /app

USER ide_runner

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
