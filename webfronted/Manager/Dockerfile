# =============================================================================
# Manager 前端 Dockerfile
# Build context: project root (ELM/)
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY fronted/shared/ ./fronted/shared/
COPY fronted/Manager/ ./fronted/Manager/

WORKDIR /app/fronted/Manager

RUN npm ci

ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/fronted/Manager/dist /usr/share/nginx/html
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
