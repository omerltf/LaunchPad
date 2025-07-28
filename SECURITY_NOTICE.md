# 🔒 SECURITY NOTICE - DEVELOPMENT MODE ONLY

## ⚠️ IMPORTANT SECURITY CONFIGURATION

This project has been configured to **ONLY RUN IN DEVELOPMENT MODE** for maximum security.

### 🚫 DISABLED FEATURES

- ❌ **Production Docker Compose** (`docker-compose.yml`) - Completely commented out
- ❌ **Production Dockerfiles** - Both Server and Client production Dockerfiles disabled
- ❌ **Production npm scripts** - `npm start`, `npm run build`, `npm run preview` disabled
- ❌ **Production Environment** - Server will refuse to start in production mode
- ❌ **External Network Access** - Only localhost/127.0.0.1 binding allowed

### ✅ ALLOWED OPERATIONS

- ✅ **Development Mode Only** - `NODE_ENV=development` or `NODE_ENV=test`
- ✅ **Localhost Only** - Server binds only to localhost/127.0.0.1
- ✅ **Development Scripts** - `npm run dev` for both client and server
- ✅ **Development Docker** - `docker-compose.dev.yml` only
- ✅ **Testing** - `npm test` allowed

### 🛡️ SECURITY MEASURES IMPLEMENTED

1. **Environment Validation**: Server validates environment on startup and exits if production mode is detected
2. **Host Binding Restriction**: Only localhost, 127.0.0.1, or 0.0.0.0 (for Docker) allowed
3. **CORS Restriction**: CORS origin forced to localhost only
4. **Script Disabling**: Production npm scripts replaced with security warnings
5. **Docker Disabling**: Production Dockerfiles commented out completely
6. **Configuration Enforcement**: `isProduction()` always returns false

### 🚀 HOW TO RUN (DEVELOPMENT ONLY)

#### Option 1: Docker Development Environment
```bash
# Use development docker-compose only
docker-compose -f docker-compose.dev.yml up

# Or with build
docker-compose -f docker-compose.dev.yml up --build
```

#### Option 2: Local Development
```bash
# Server (in Server directory)
npm install
npm run dev

# Client (in Client directory, separate terminal)
npm install
npm run dev
```

#### Option 3: VS Code Task
```bash
# Use the configured VS Code task
# Run: Start Server (development mode)
```

### 🔍 VERIFICATION

The following endpoints will show security status:

- `http://localhost:3001/` - Shows "DEVELOPMENT MODE ONLY" message
- `http://localhost:3001/health` - Includes security notice in response

### ⚠️ ATTEMPTING PRODUCTION MODE

Any attempt to run in production mode will result in:

- **Server**: Immediate shutdown with security error
- **npm start**: Error message and exit
- **npm run build**: Error message and exit
- **Production Docker**: Files are commented out and won't work

### 📝 NOTES

- This configuration ensures the application can only be accessed via localhost
- No external network access is possible
- All production deployment paths are blocked
- Development tools and debugging remain fully functional

**Last Updated**: July 28, 2025
