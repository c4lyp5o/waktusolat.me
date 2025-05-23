# Stage 1: Build Stage (client build)
FROM oven/bun:1.2.14-alpine AS builder

# Accept NODE_ENV as a build argument, defaulting to "production"
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Install root dependencies (Express etc.)
COPY package*.json ./
RUN bun install

COPY client ./client
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
FROM oven/bun:1.2.14-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install curl for health check
RUN apk update --no-cache && \
    apk add --no-cache curl tzdata

# Set timezone data
ENV TZ=Asia/Kuala_Lumpur

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN bun install --omit=dev

# Copy backend source code (everything except what's ignored)
COPY . .

# Copy built public files from builder
COPY --from=builder /app/public /app/public

EXPOSE 5000

# Add a health check to ensure the container is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/healthcheck || exit 1

CMD ["bun", "start"]