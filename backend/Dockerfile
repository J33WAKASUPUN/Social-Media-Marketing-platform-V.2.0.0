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

# Install ALL dependencies (including devDependencies that might be needed)
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV APP_PORT=5000
ENV PORT=5000

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]