# Use Node 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# ✅ CRITICAL FIX: Create the logs directory explicitly
# Without this, the logger crashes the app on startup
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production
ENV APP_PORT=5000
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "src/server.js"]