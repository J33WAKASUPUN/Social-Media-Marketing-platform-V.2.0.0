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

# Debug: Verify all files are present
RUN echo "=== Verifying file structure ===" && \
    test -f src/server.js && echo "✓ src/server.js exists" || echo "✗ src/server.js MISSING" && \
    test -f src/workers.js && echo "✓ src/workers.js exists" || echo "✗ src/workers.js MISSING" && \
    test -f src/jobs/publishPostJob.js && echo "✓ src/jobs/publishPostJob.js exists" || echo "✗ src/jobs/publishPostJob.js MISSING" && \
    test -f src/jobs/checkDueSchedules.js && echo "✓ src/jobs/checkDueSchedules.js exists" || echo "✗ src/jobs/checkDueSchedules.js MISSING" && \
    test -f src/queues/queueManager.js && echo "✓ src/queues/queueManager.js exists" || echo "✗ src/queues/queueManager.js MISSING"

# Set environment variables
ENV NODE_ENV=production
ENV APP_PORT=5000
ENV PORT=5000

# Expose port 5000
EXPOSE 5000

# Run with better error messages
CMD ["node", "--trace-warnings", "--enable-source-maps", "src/server.js"]