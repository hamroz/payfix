# Production image: next build (standalone output) served by node.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system payfix && useradd --system --gid payfix payfix && mkdir -p .data && chown payfix:payfix .data
COPY --from=build --chown=payfix:payfix /app/.next/standalone ./
COPY --from=build --chown=payfix:payfix /app/.next/static ./.next/static
COPY --from=build --chown=payfix:payfix /app/public ./public
COPY --from=build --chown=payfix:payfix /app/drizzle ./drizzle
USER payfix
EXPOSE 3000
CMD ["node", "server.js"]
