FROM node:24-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/bartys-saloon/package.json ./artifacts/bartys-saloon/

COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY lib/integrations-gemini-ai/package.json ./lib/integrations-gemini-ai/
COPY scripts/package.json ./scripts/

RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .

# Vite requires PORT and BASE_PATH at build time (module-level checks in vite.config.ts).
# PORT is only used for the dev server so any value works here.
# BASE_PATH must be "/" so the frontend is served from the root in production.
ENV PORT=3000
ENV BASE_PATH=/

RUN pnpm run typecheck:libs

RUN pnpm --filter @workspace/api-spec run codegen

RUN pnpm --filter @workspace/api-server run build

RUN pnpm --filter @workspace/bartys-saloon run build

FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# API server bundle
COPY --from=builder /app/artifacts/api-server/dist ./api-server/dist

# Frontend static files — served by the API server in production
COPY --from=builder /app/artifacts/bartys-saloon/dist ./frontend/dist

# Production dependencies for the API server
COPY package.json pnpm-workspace.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/db/package.json ./lib/db/
COPY lib/integrations-gemini-ai/package.json ./lib/integrations-gemini-ai/
RUN pnpm install --prod --filter @workspace/api-server --ignore-scripts 2>/dev/null || true

EXPOSE 8080

CMD ["node", "--enable-source-maps", "/app/api-server/dist/index.mjs"]
