# =============================================================================
# Customer 前端 Dockerfile
# Build context: project root (ELM/)
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy shared module (imported by all frontends via @shared alias)
COPY fronted/shared/ ./fronted/shared/

# Copy Customer app
COPY fronted/Customer/ ./fronted/Customer/

WORKDIR /app/fronted/Customer

# Install dependencies
RUN npm ci

# Build — VITE_API_BASE_URL can be overridden at build time
# Default is empty so the app falls back to http://localhost:8000/api/v1
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# =============================================================================
# Production stage — serve with nginx
# =============================================================================
FROM nginx:alpine

COPY --from=builder /app/fronted/Customer/dist /usr/share/nginx/html
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
