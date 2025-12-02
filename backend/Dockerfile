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

# Install ALL dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV APP_PORT=5000
ENV PORT=5000

# Expose port 5000
EXPOSE 5000

# Run with full error output - redirect stderr to stdout
CMD ["sh", "-c", "node test-imports.js 2>&1 || (echo 'Import test failed, trying server anyway...' && node src/server.js 2>&1)"]