FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    supervisor \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Yarn
RUN npm install -g yarn

# Create virtual environment
RUN python -m venv /root/.venv
ENV PATH="/root/.venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy application code
COPY app/ /app/app/
COPY migrations/ /app/migrations/
COPY alembic.ini /app/alembic.ini
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Note: Frontend is in a separate repository
# This image provides the backend API only

WORKDIR /app

# Create log directories
RUN mkdir -p /var/log/supervisor

# Expose ports (8000 for API, 8001 for alternate)
EXPOSE 8000 8001

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
