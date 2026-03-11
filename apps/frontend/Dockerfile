# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npx turbo prune frontend --docker

FROM node:20-slim AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo run build --filter=frontend

# Production stage
FROM nginx:alpine AS runner
COPY --from=installer /app/apps/frontend/dist /usr/share/nginx/html
# Custom nginx config could be added here if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
