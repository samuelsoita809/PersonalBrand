# Use Node.js LTS as the base image
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
# Use turbo to prune the workspace for the backend app
RUN npx turbo prune backend --docker

FROM base AS installer
WORKDIR /app

# First copy the pruned lockfile and package.json
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# If there was a build step, we would run it here
# RUN npx turbo run build --filter=backend

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 expressjs
USER expressjs

COPY --from=installer /app .

EXPOSE 3001

CMD ["node", "apps/backend/src/index.js"]
