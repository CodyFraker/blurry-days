FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG AUTH_SECRET=ci-placeholder-auth-secret-min-32-chars!!
ARG AUTH_URL=http://localhost:3000
ARG DISCORD_CLIENT_ID=123456789012345678
ARG DISCORD_CLIENT_SECRET=ci-placeholder-discord-secret
ARG DATABASE_URL=postgres://grainydays:grainydays_dev@localhost:5432/grainydays

ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_SECRET=$AUTH_SECRET
ENV AUTH_URL=$AUTH_URL
ENV DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
ENV DISCORD_CLIENT_SECRET=$DISCORD_CLIENT_SECRET
ENV DATABASE_URL=$DATABASE_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/drizzle ./drizzle
COPY --from=builder --chown=appuser:appgroup /app/productionStartup.js ./productionStartup.js
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
