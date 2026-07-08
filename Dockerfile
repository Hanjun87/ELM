# =============================================================================
# ELM Backend Dockerfile
# =============================================================================
FROM python:3.13-slim AS base

# System dependencies for psycopg2 and general build
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

WORKDIR /app

# Copy dependency files for layer caching
COPY pyproject.toml uv.lock ./

# Install Python dependencies into .venv
RUN uv sync --frozen --no-dev

# Add .venv to PATH so python/daphne/etc are available directly
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/src" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy source code
COPY src/ ./src/

# Copy entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/src/elm

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/merchants/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["daphne", "config.asgi:application", "--bind", "0.0.0.0", "--port", "8000"]
