# Use Ubuntu as base image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update and install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22.x
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy backend package.json and install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]