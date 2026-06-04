# ── Stage 1: Build Vite frontend ────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Inject production API URL at build time
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ── Stage 2: PHP-Apache backend ─────────────────────────────
FROM php:8.2-apache

# Install PHP extensions required for PDO + cURL + MySQL
RUN apt-get update && apt-get install -y libcurl4-openssl-dev && \
    docker-php-ext-install pdo pdo_mysql curl && \
    a2enmod rewrite

# Apache config: allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www/html

# Copy PHP backend
COPY backend/ ./backend/

# Copy compiled frontend into the web root
COPY --from=frontend-build /app/frontend/dist ./

# Rewrite rules for SPA + API
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Runtime env vars (overridden at deploy time via -e or compose)
ENV DB_HOST=db \
    DB_NAME=shambapoint \
    DB_USER=root \
    DB_PASS=shambapoint \
    JWT_SECRET=change_me_in_production \
    MPESA_MODE=mock \
    DARAJA_CONSUMER_KEY= \
    DARAJA_CONSUMER_SECRET= \
    DARAJA_SHORTCODE=174379 \
    DARAJA_CALLBACK_URL=http://localhost/api/mpesa?action=callback

EXPOSE 80
