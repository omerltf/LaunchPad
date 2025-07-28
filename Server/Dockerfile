# PRODUCTION DOCKERFILE DISABLED FOR SECURITY
# This production Dockerfile has been commented out to prevent production deployments
# Use Dockerfile.dev for development environment only

# # Use Node.js official image as base
# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Copy package files first for better layer caching
# COPY package*.json ./

# # Install production dependencies
# RUN npm ci --only=production && npm cache clean --force

# # Copy application source code
# COPY src/ ./src/

# # Create logs directory
# RUN mkdir -p logs

# # Create non-root user for security
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nodeuser -u 1001

# # Change ownership of the app directory
# RUN chown -R nodeuser:nodejs /app

# # Switch to non-root user
# USER nodeuser

# # Expose the port the app runs on
# EXPOSE 3001

# # Add health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
#   CMD node -e "const http=require('http');const options={hostname:'localhost',port:3001,path:'/health',timeout:3000};const req=http.request(options,res=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));req.on('timeout',()=>process.exit(1));req.end();"

# # Start the application
# CMD ["npm", "start"]
