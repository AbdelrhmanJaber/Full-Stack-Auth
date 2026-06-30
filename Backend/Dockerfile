# ==============================================================================
# Stage 1: Build the NestJS application
# ==============================================================================
FROM node:20-alpine AS builder

# Install build dependencies if needed (e.g., node-gyp for bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for compilation)
RUN npm ci

# Copy source code and config files
COPY . .

# Build the NestJS project (compiles TypeScript to JavaScript in ./dist)
# Note: This assumes package.json has a "build" script (e.g., "nest build")
RUN npm run build

# ==============================================================================
# Stage 2: Install production-only dependencies
# ==============================================================================
FROM node:20-alpine AS prod-deps

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies and clean cache to minimize layer size
RUN npm ci --omit=dev && npm cache clean --force

# ==============================================================================
# Stage 3: Final production runtime image
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Use the default non-root 'node' user provided by Node alpine image for security
USER node

# Copy build output and production dependencies
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

# Expose the port (NestJS default is 3000)
EXPOSE 3000

# Start the application using node directly on the transpiled main file
CMD ["node", "dist/main.js"]
