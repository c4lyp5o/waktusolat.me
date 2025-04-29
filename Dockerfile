# Stage 1: Build Stage (client build)
FROM node:lts-alpine AS builder

WORKDIR /app

# Install root dependencies (Express etc.)
COPY package*.json ./
RUN npm install

# Copy client separately and install client dependencies + build
COPY client ./client
WORKDIR /app/client
RUN npm install && npm run build

# Move built files to /app/public in the builder stage
RUN mkdir -p /app/public && mv ../public/* /app/public/

# Return to root app dir
WORKDIR /app

# Stage 2: Production Stage
FROM node:lts-alpine

# Install curl for health check
RUN apk update --no-cache && \
    apk add --no-cache curl

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code (everything except what's ignored)
COPY . .

# Copy built public files from builder
COPY --from=builder /app/public /app/public

# Expose your server port
EXPOSE 5000

# Add a health check to ensure the container is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start your app
CMD ["npm", "start"]