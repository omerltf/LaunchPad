# Server Application

A modern Node.js server application built with Express.js.

## Features

- ✅ Express.js web framework
- ✅ Security middleware (Helmet)
- ✅ CORS support
- ✅ Request logging (Morgan)
- ✅ Compression middleware
- ✅ Environment configuration
- ✅ Error handling
- ✅ API routes structure
- ✅ Testing setup (Jest)
- ✅ Code linting (ESLint)
- ✅ Development tools (Nodemon)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1: Install dependencies:

```bash
npm install
```

2: Copy environment variables:

```bash
cp .env.example .env
```

3: Update the `.env` file with your configuration

### Running the Application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Main Routes

- `GET /` - Server status information

### API Routes

- `GET /api/` - API information
- `GET /api/users` - Get users list
- `POST /api/users` - Create a new user

## Project Structure

```text
src/
├── app.js              # Main application file
├── routes/             # Route definitions
│   └── api.js         # API routes
├── middleware/         # Custom middleware
│   └── index.js       # Middleware exports
└── utils/             # Utility functions
    └── helpers.js     # Helper functions

tests/                 # Test files
├── server.test.js     # Server tests
└── setup.js          # Test setup

```

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `HOST` | Server host | `localhost` |
| `CORS_ORIGIN` | CORS origin URL | `http://localhost:3000` |

## Testing

Run the test suite:

```bash
npm test
```

## Development

The application uses:

- **Express.js** for the web framework
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for request logging
- **Compression** for response compression
- **Jest** for testing
- **ESLint** for code linting
- **Nodemon** for development auto-reload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
