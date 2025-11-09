# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and lock file
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the Vite app
RUN npx vite build

# Stage 2: Serve static files using nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config if you have custom settings
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
