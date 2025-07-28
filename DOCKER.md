# 🐳 Docker Setup Guide

This project includes comprehensive Docker support for both development and production environments.

## 📁 Docker Files Overview

```
Project1/
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── Server/
│   ├── Dockerfile             # Production server image
│   ├── Dockerfile.dev         # Development server image
│   └── .dockerignore          # Server Docker ignore rules
└── Client/
    ├── Dockerfile             # Production client image (Nginx)
    ├── Dockerfile.dev         # Development client image
    ├── nginx.conf             # Nginx configuration
    └── .dockerignore          # Client Docker ignore rules
```

## 🚀 Quick Start

### Production Environment

```bash
# Build and run both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Environment

```bash
# Build and run development environment with hot reloading
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## 🏗 Build Individual Services

### Server Only

```bash
# Production build
cd Server
docker build -t nodejs-server .

# Development build
docker build -f Dockerfile.dev -t nodejs-server-dev .

# Run production server
docker run -p 3001:3001 -e NODE_ENV=production nodejs-server

# Run development server with volume mounting
docker run -p 3001:3001 -v $(pwd)/src:/app/src nodejs-server-dev
```

### Client Only

```bash
# Production build
cd Client
docker build -t react-client .

# Development build
docker build -f Dockerfile.dev -t react-client-dev .

# Run production client
docker run -p 80:80 react-client

# Run development client with volume mounting
docker run -p 3000:3000 -v $(pwd)/src:/app/src react-client-dev
```

## 🌍 Environment Configuration

### Production Environment Variables

The production setup uses these environment variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Client Configuration
# (No environment variables needed for production build)
```

### Development Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug
ENABLE_FILE_LOGGING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Client Configuration
VITE_API_URL=http://localhost:3001
```

## 🔍 Service Details

### Production Architecture

- **Server**: Node.js application running on Alpine Linux
- **Client**: Static React build served by Nginx
- **Networking**: Internal Docker network for service communication
- **Storage**: Persistent volumes for server logs
- **Security**: Non-root users, security headers, health checks

### Development Architecture

- **Server**: Node.js with nodemon for hot reloading
- **Client**: Vite development server with HMR
- **Volumes**: Source code mounted for real-time changes
- **Networking**: Services can communicate internally

## 🏃‍♂️ Accessing Services

### Production
- **Client (Frontend)**: http://localhost
- **Server (API)**: http://localhost:3001
- **Health Checks**: 
  - Client: http://localhost/health
  - Server: http://localhost:3001/health

### Development
- **Client (Frontend)**: http://localhost:3000
- **Server (API)**: http://localhost:3001
- **Hot Reloading**: Enabled for both services

## 🔧 Docker Commands Reference

### Useful Docker Compose Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build server
docker-compose build client

# View service logs
docker-compose logs server
docker-compose logs client

# Execute commands in running containers
docker-compose exec server npm test
docker-compose exec client npm run lint

# Remove everything (containers, networks, volumes)
docker-compose down -v --rmi all

# View service status
docker-compose ps

# Restart specific service
docker-compose restart server
```

### Docker System Management

```bash
# Remove unused containers, networks, images
docker system prune

# Remove volumes as well
docker system prune -a --volumes

# View Docker resource usage
docker system df

# Monitor resource usage
docker stats
```

## 🛡 Security Features

### Container Security

- **Non-root users**: All containers run as non-privileged users
- **Minimal attack surface**: Alpine Linux base images
- **Security headers**: Nginx configured with security headers
- **Health checks**: Automated health monitoring
- **Network isolation**: Services communicate via internal network

### Image Optimization

- **Multi-stage builds**: Client uses multi-stage build for smaller image
- **Layer caching**: Package.json copied first for better caching
- **Minimal dependencies**: Production images only include necessary packages
- **Cache cleaning**: npm cache cleaned after installs

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml if needed
2. **Permission errors**: Ensure Docker daemon is running with proper permissions
3. **Build failures**: Check .dockerignore files and build context
4. **Network issues**: Verify services are on the same Docker network

### Debug Commands

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs --tail=50 server

# Enter container shell
docker-compose exec server sh
docker-compose exec client sh

# Check network connectivity
docker-compose exec server ping client
docker-compose exec client ping server
```

### Health Check Status

```bash
# Check health status
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' container_name
```

## 📈 Production Deployment

### Environment Preparation

1. **Environment Variables**: Set production environment variables
2. **SSL/TLS**: Configure reverse proxy (nginx/traefik) for HTTPS
3. **Monitoring**: Set up log aggregation and monitoring
4. **Backups**: Configure volume backups for persistent data

### Scaling Considerations

```bash
# Scale services
docker-compose up -d --scale server=3

# Load balancing setup (requires additional configuration)
# Use external load balancer or Docker Swarm
```

## 🎯 Best Practices

1. **Use specific image tags**: Avoid `latest` in production
2. **Environment variables**: Use `.env` files for configuration
3. **Health checks**: Monitor service health
4. **Resource limits**: Set memory and CPU limits
5. **Log rotation**: Configure log rotation for persistent logs
6. **Security scanning**: Regularly scan images for vulnerabilities

This Docker setup provides a complete containerization solution for development, testing, and production deployment of your Node.js + React application.
