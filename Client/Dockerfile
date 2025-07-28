# PRODUCTION DOCKERFILE DISABLED FOR SECURITY
# This production Dockerfile has been commented out to prevent production deployments
# Use Dockerfile.dev for development environment only

# # Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine AS builder

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install all dependencies (including devDependencies for build)
# RUN npm ci && npm cache clean --force

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Stage 2: Production stage
# FROM nginx:alpine

# # Copy built application from builder stage
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy custom nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Create non-root user for security
# RUN addgroup -g 1001 -S nginxuser
# RUN adduser -S nginxuser -u 1001

# # Change ownership of nginx directories
# RUN chown -R nginxuser:nginxuser /usr/share/nginx/html
# RUN chown -R nginxuser:nginxuser /var/cache/nginx
# RUN chown -R nginxuser:nginxuser /var/log/nginx
# RUN chown -R nginxuser:nginxuser /etc/nginx/conf.d
# RUN touch /var/run/nginx.pid
# RUN chown -R nginxuser:nginxuser /var/run/nginx.pid

# # Switch to non-root user
# USER nginxuser

# # Expose port 80
# EXPOSE 80

# # Add health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]
