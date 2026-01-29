# ==============================================================================
# 🎮 Snake Game Frontend — Dockerfile
# ==============================================================================
# Multi-stage build: Node для сборки, Nginx для раздачи статики

# --- Stage 1: Build ---
FROM node:20-alpine as builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Передаём API URL через build-time переменную
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

# Собираем production build
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:alpine

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Порт
EXPOSE 80

# Nginx запускается автоматически
CMD ["nginx", "-g", "daemon off;"]
