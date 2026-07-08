#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
python manage.py migrate --noinput

echo "[entrypoint] Collecting static files..."
python manage.py collectstatic --noinput --clear 2>&1 | tail -3

# Seed initial data if DB is empty (first deploy)
USER_COUNT=$(python manage.py shell -c \
    "from accounts.models import User; print(User.objects.count())" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
    echo "[entrypoint] Seeding initial data (roles + test accounts)..."
    python manage.py init_data 2>&1 | grep -E "✓|创建完成|ERROR" || true
fi

echo "[entrypoint] Starting server..."
exec "$@"
