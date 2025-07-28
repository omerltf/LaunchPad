# Node.js Server Application

A robust and scalable Node.js server application built with Express.js, featuring comprehensive middleware, security, validation, and monitoring capabilities.

## 🚀 Features

- ✅ **Express.js** web framework with modern architecture
- ✅ **Security** middleware with Helmet and CORS
- ✅ **Rate Limiting** with configurable windows and limits
- ✅ **Input Validation** with custom validation schemas
- ✅ **Logging System** with multiple levels and file output
- ✅ **Error Handling** with detailed error responses
- ✅ **Environment Configuration** with validation
- ✅ **Testing Setup** with Jest and comprehensive coverage
- ✅ **Code Quality** with ESLint and standardized formatting
- ✅ **Request Monitoring** with timing and health checks

## 📁 Project Structure

```text
src/
├── app.js              # Main application entry point
├── config/             # Configuration management
│   └── index.js       # Environment configuration
├── middleware/         # Custom middleware functions
│   └── index.js       # Authentication, validation, rate limiting
├── routes/             # API route definitions
│   └── api.js         # User management routes
└── utils/             # Utility functions and helpers
    ├── helpers.js     # Response helpers and utilities
    └── logger.js      # Logging system

tests/                  # Test files and setup
├── server.test.js     # Main server tests
├── setup.js          # Test configuration
└── env-setup.js      # Environment setup for tests

logs/                  # Application logs (auto-generated)
└── app.log           # Application log file

coverage/              # Test coverage reports (auto-generated)
```

## 🛠 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1: Install dependencies:

```bash
npm install
```

2: Configure environment variables:

```bash
cp .env.example .env
```

3: Update the `.env` file with your configuration:

```bash
# Required for production
JWT_SECRET=your-super-secret-jwt-key

# Optional customizations
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### Running the Application

**Development mode with auto-reload:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:3001` by default.

### Docker Support

**Production Docker:**

```bash
# Build and run production container
docker build -t nodejs-server .
docker run -p 3001:3001 -e NODE_ENV=production nodejs-server

# Or use Docker Compose (recommended)
docker-compose up -d server
```

**Development Docker with hot reloading:**

```bash
# Build and run development container
docker build -f Dockerfile.dev -t nodejs-server-dev .
docker run -p 3001:3001 -v $(pwd)/src:/app/src nodejs-server-dev

# Or use Docker Compose development setup
docker-compose -f docker-compose.dev.yml up -d server-dev
```

For comprehensive Docker documentation, see [../DOCKER.md](../DOCKER.md)

## 📚 API Documentation

### Health Check

- **GET** `/health` - Server health status and metrics

```json
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "memory": { ... },
  "pid": 12345
}
```

### Server Information

- **GET** `/` - Basic server information

```json
{
  "message": "Server is running!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "node": "v18.0.0",
  "uptime": 123.456
}
```

### API Routes

#### Get API Information

- **GET** `/api/` - API information and available endpoints

```json
{
  "success": true,
  "message": "API information retrieved successfully",
  "data": {
    "name": "Node.js Template API",
    "version": "1.0.0",
    "endpoints": { ... },
    "features": [ ... ]
  }
}
```

#### User Management

##### Get Users (with pagination and filtering)

- **GET** `/api/users`

Query Parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in name and email
- `sort` (string): Sort field (name, email, createdAt, updatedAt)
- `order` (string): Sort order (asc, desc)
- `active` (boolean): Filter by active status

Example: `/api/users?page=1&limit=10&search=john&sort=name&order=asc&active=true`

##### Get Single User

- **GET** `/api/users/:id`

##### Create User

- **POST** `/api/users`

Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

Validation Rules:

- `name`: Required, 2-50 characters, letters and spaces only
- `email`: Required, valid email format, max 100 characters

##### Update User

- **PUT** `/api/users/:id`

Request Body (all fields optional):

```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "active": false
}
```

##### Delete User

- **DELETE** `/api/users/:id`

### Response Format

All API responses follow a standardized format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [ ... ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3001` | No |
| `HOST` | Server host | `localhost` | No |
| `CORS_ORIGIN` | CORS origin URL | `http://localhost:3000` | No |
| `JWT_SECRET` | JWT secret key | - | Yes (production) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `ENABLE_FILE_LOGGING` | Enable file logging | `false` | No |

### Rate Limiting

The application includes configurable rate limiting:

- **Global Rate Limit**: 100 requests per 15 minutes per IP
- **User Creation**: 10 requests per 15 minutes per IP
- **User Updates**: 20 requests per 15 minutes per IP
- **User Deletion**: 5 requests per 15 minutes per IP

### Logging System

The application features a comprehensive logging system with:

- **Multiple Levels**: error, warn, info, http, verbose, debug, silly
- **Colored Console Output**: Different colors for different levels
- **File Logging**: Optional file output to `logs/app.log`
- **Request Logging**: Automatic HTTP request logging
- **Error Tracking**: Detailed error logging with stack traces

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The test suite includes:

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Error Handling Tests**: Error scenario validation
- **Middleware Tests**: Custom middleware validation

Current coverage targets:

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## 🔍 Code Quality

### Linting

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### ESLint Configuration

The project uses ESLint with:

- **Standard JS** configuration
- **Node.js** environment settings
- **Jest** testing environment
- **Custom Rules** for consistency

## 🏗 Architecture

### Middleware Stack

1. **Trust Proxy**: For proper IP detection
2. **Security (Helmet)**: Security headers
3. **CORS**: Cross-origin resource sharing
4. **Compression**: Response compression
5. **Request Timer**: Response time tracking
6. **Logging**: Request/response logging
7. **Body Parser**: JSON/URL-encoded parsing
8. **Rate Limiting**: Request rate limiting
9. **Validation**: Input validation
10. **Routes**: Application routes
11. **Error Handler**: Global error handling

### Configuration Management

- **Environment Variables**: Centralized in `/src/config/index.js`
- **Validation**: Required variables checked on startup
- **Defaults**: Sensible defaults for development
- **Type Conversion**: Automatic string to number conversion

### Error Handling

- **Global Handler**: Catches all unhandled errors
- **Async Wrapper**: Automatically catches async errors
- **Standardized Responses**: Consistent error format
- **Development/Production**: Different detail levels

## 📈 Monitoring

### Health Checks

The `/health` endpoint provides:

- **Status**: Application status
- **Uptime**: Process uptime
- **Memory Usage**: Current memory consumption
- **Environment**: Current environment
- **Version**: Application version

### Request Monitoring

- **Response Times**: Added to response headers
- **Rate Limit Headers**: Current limit status
- **Request Logging**: All requests logged
- **Error Tracking**: Detailed error information

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `JWT_SECRET`
- [ ] Set appropriate `CORS_ORIGIN`
- [ ] Configure rate limiting
- [ ] Enable file logging
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL certificates
- [ ] Configure monitoring

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Use meaningful commit messages
- Keep functions small and focused

## 📝 License

MIT License - see the [LICENSE](../LICENSE) file for details.

---

For more information, see the [main project README](../README.md).
