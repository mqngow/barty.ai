FROM node:24-alpine AS base
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

RUN pnpm run typecheck:libs

RUN pnpm --filter @workspace/api-spec run codegen

RUN pnpm --filter @workspace/api-server run build

RUN pnpm --filter @workspace/bartys-saloon run build

FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/artifacts/api-server/dist ./api-server/dist
COPY --from=builder /app/artifacts/bartys-saloon/dist ./frontend/dist

COPY package.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/

RUN pnpm install --prod --filter @workspace/api-server --ignore-scripts 2>/dev/null || true

RUN npm install -g serve

EXPOSE 8080 3000

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
