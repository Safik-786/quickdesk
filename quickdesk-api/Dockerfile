FROM node:24-slim

# Install OpenSSL for Prisma and other native dependencies if needed
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
