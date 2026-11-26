# Stage 1: Build Stage (client build)
FROM oven/bun:1.4.5-alpine AS builder

# Accept NODE_ENV as a build argument, defaulting to "production"
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Install root dependencies (Express etc.)
COPY package*.json ./
RUN bun install

COPY client ./client
# The client imports the server's zone registry (vite alias @zones).
COPY controllers/zones.js ./controllers/zones.js
# ...and the shared tema registry (shared/temas.js), used by both sides.
COPY shared ./shared
WORKDIR /app/client
RUN bun install && \
    if [ "$NODE_ENV" = "staging" ]; then \
        bun run build-staging; \
    else \
        bun run build; \
    fi

# Move built files to /app/public in the builder stage
RUN mkdir -p /app/public && mv ../public/* /app/public/

WORKDIR /app

# Stage 2: Production Stage
FROM oven/bun:1.4.5-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install curl for health check
RUN apk update --no-cache && \
    apk add --no-cache curl tzdata

# Set timezone data
ENV TZ=Asia/Kuala_Lumpur

WORKDIR /app

# Install only production dependencies, as bun (uid 1000) so nothing in the
# image is owned by root.
COPY --chown=bun:bun package*.json ./
RUN bun install --frozen-lockfile --omit=dev

# Copy backend source code (everything except what .dockerignore excludes)
COPY --chown=bun:bun . .

# Copy built public files from builder
COPY --from=builder --chown=bun:bun /app/public /app/public

# Runtime state lives in volumes; create the mountpoints owned by bun so a
# named volume inherits the right ownership on first use.
RUN mkdir -p storage data/times db-data

EXPOSE 5000

# Add a health check to ensure the container is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/healthcheck || exit 1

USER bun

CMD ["bun", "start"]