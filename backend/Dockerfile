# Use Node 20 Alpine
FROM node:20-alpine

# Set working directory - V.5.0.1
WORKDIR /app

# Install system dependencies required for sharp, bcrypt, and ffmpeg
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg

# Copy package files first (Optimization: Docker caches this layer)
COPY package*.json ./

# Install ONLY production dependencies to keep image small
# npm ci is faster and more reliable than npm install for CI/CD
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV APP_PORT=5000
ENV PORT=5000

# Expose port 5000 (Matches your .env)
EXPOSE 5000

# 🚀 CLEAN START COMMAND (Start the server directly)
CMD ["node", "src/server.js"]