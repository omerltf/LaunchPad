# Node.js & React Full-Stack Application Template

A modern, production-ready template for building full-stack applications with Node.js (Express) backend and React (Vite) frontend.

## 🚀 Features

### Backend (Node.js + Express)

- ✅ **Modern Express.js** server with comprehensive middleware
- ✅ **Security** with Helmet.js and CORS configuration
- ✅ **Rate Limiting** with configurable windows and limits
- ✅ **Input Validation** with custom validation schemas
- ✅ **Logging System** with multiple levels and file output
- ✅ **Error Handling** with detailed error responses
- ✅ **Environment Configuration** with validation
- ✅ **Testing Setup** with Jest and comprehensive coverage
- ✅ **Code Quality** with ESLint and standard configuration
- ✅ **API Documentation** with detailed JSDoc comments

### Frontend (React + Vite)

- ✅ **React 18** with modern hooks and best practices
- ✅ **Vite** for lightning-fast development and optimized builds
- ✅ **Axios** for API communication with error handling
- ✅ **Responsive Design** with modern CSS and animations
- ✅ **Real-time Updates** and loading states
- ✅ **Environment Configuration** support

## 📁 Project Structure

```text
Project1/
├── Server/                 # Backend Node.js application
│   ├── src/
│   │   ├── app.js         # Main application entry point
│   │   ├── config/        # Configuration management
│   │   ├── middleware/    # Custom middleware functions
│   │   ├── routes/        # API route definitions
│   │   └── utils/         # Utility functions and helpers
│   ├── tests/             # Test files and setup
│   ├── logs/              # Application logs (auto-generated)
│   └── coverage/          # Test coverage reports
│
├── Client/                # Frontend React application
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── main.jsx       # Application entry point
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
│
└── README.md              # This file
```

## 🛠 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Project1

# Install dependencies for both server and client
cd Server && npm install
cd ../Client && npm install
```

### 2. Environment Configuration

```bash
# Setup server environment
cd Server
cp .env.example .env

# Edit .env file with your configuration
# Minimum required: Set JWT_SECRET for production
```

### 3. Start Development

```bash
# Terminal 1: Start the backend server
cd Server
npm run dev

# Terminal 2: Start the frontend client
cd Client
npm run dev
```

The application will be available at:

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:3001>

## � Docker Support

This project includes comprehensive Docker support for both development and production environments.

### Quick Docker Start

```bash
# Production environment
docker-compose up -d

# Development environment with hot reloading
docker-compose -f docker-compose.dev.yml up -d
```

### Docker Services

- **Production**: Client (Nginx) on port 80, Server (Node.js) on port 3001
- **Development**: Client (Vite) on port 3000, Server (Nodemon) on port 3001

For detailed Docker documentation, see [DOCKER.md](./DOCKER.md)

## �📚 Documentation

### Backend Documentation

See [Server/README.md](./Server/README.md) for detailed backend documentation including:

- API endpoints and usage
- Configuration options
- Middleware documentation
- Testing guidelines

### Frontend Documentation

See [Client/README.md](./Client/README.md) for detailed frontend documentation including:

- Component structure
- Styling guidelines
- Build and deployment

## 🧪 Testing

### Backend Tests

```bash
cd Server
npm test                    # Run tests
npm run test:coverage      # Run tests with coverage
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues
```

### Frontend Tests

```bash
cd Client
npm run lint               # Run ESLint
```

## 🏗 Building for Production

### Backend

```bash
cd Server
npm start                  # Production server
```

### Frontend

```bash
cd Client
npm run build             # Build for production
npm run preview           # Preview production build
```

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** protection with configurable origins
- **Rate limiting** to prevent abuse
- **Input validation** with comprehensive schemas
- **Error handling** without exposing sensitive information
- **Environment variable** validation

## 🎯 Use Cases

This template is perfect for:

- **Web Applications** with user management
- **API Services** with comprehensive validation
- **Prototypes** that need production-ready structure
- **Learning Projects** with best practices examples
- **Startups** needing a solid foundation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bug reports or feature requests
- Check the documentation in Server/README.md and Client/README.md
- Review the examples in the codebase

## 🎉 Acknowledgments

- **Express.js** for the robust web framework
- **React** for the powerful frontend library
- **Vite** for the amazing build tool
- **Node.js** community for excellent packages

---

**Happy Coding!** 🚀
