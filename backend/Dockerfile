# ==============================================================================
# 🐍 Snake Game Backend — Dockerfile
# ==============================================================================
# Multi-stage build для оптимального размера образа

# --- Stage 1: Builder ---
FROM python:3.11-slim as builder

WORKDIR /app

# Устанавливаем зависимости для сборки
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# --- Stage 2: Runtime ---
FROM python:3.11-slim

WORKDIR /app

# Создаём пользователя для безопасности (не root)
RUN addgroup --system app && adduser --system --group app

# Копируем wheels из builder stage
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# Копируем код приложения
COPY ./app ./app

# Создаём директорию для БД и даём права
RUN mkdir -p /app/data && chown -R app:app /app

# Переключаемся на непривилегированного пользователя
USER app

# Переменные окружения
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Порт
EXPOSE 8000

# Запуск
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
