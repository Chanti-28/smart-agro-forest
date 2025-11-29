# ========= 1. Build stage =========
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Only copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Build production bundle (Vite/React)
RUN npm run build

# ========= 2. Nginx serve stage =========
FROM nginx:1.27-alpine

# Remove default nginx site config and use our SPA config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 inside the container
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
