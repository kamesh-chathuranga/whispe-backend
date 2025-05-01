# Use Node.js LTS as the base image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Install all dependencies (dev + prod)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build the app and prune dev dependencies
FROM deps AS builder
COPY . .
RUN npm run build
# Remove dev dependencies to slim the final image
RUN npm prune --production

# Production image, copy only necessary files
FROM node:22-alpine AS runner

# Set environment variables
ENV NODE_ENV=production
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy production-ready files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 7000

# Run the app
CMD ["npm", "start"]