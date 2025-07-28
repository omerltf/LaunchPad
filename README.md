# LaunchPad 🚀

## Full-Stack Application Template

A modern, production-ready template for building scalable full-stack applications with Node.js (Express) backend and React (Vite) frontend. **LaunchPad** provides everything you need to launch your next project quickly and efficiently.

## ⚠️ IMPORTANT SECURITY NOTICE

**This template is configured to ONLY run in development mode for security purposes.**

- 🚫 **Production deployments are completely disabled**
- 🏠 **Localhost-only access (no external network access)**
- 🔒 **All production Docker configurations commented out**
- ⚠️ **Server will refuse to start in production mode**

👉 **See [SECURITY_NOTICE.md](./SECURITY_NOTICE.md) for complete security details**

## ✨ What's Included

### 🎯 Modern Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Styling**: Tailwind CSS with custom design system
- **Development**: Hot reload, auto-restart, modern tooling
- **Security**: Helmet.js, CORS, rate limiting, input validation
- **Testing**: Jest with comprehensive test coverage
- **Code Quality**: ESLint, modern JavaScript/React patterns

### 🛡️ Security Features

- ✅ **Security Headers** with Helmet.js
- ✅ **CORS Protection** with configurable origins
- ✅ **Rate Limiting** with configurable windows and limits
- ✅ **Input Validation** with custom validation schemas
- ✅ **Environment Configuration** with validation
- ✅ **Error Handling** with detailed error responses

### 🎨 Frontend Features

- ✅ **React 18** with modern hooks and best practices
- ✅ **Vite** for lightning-fast development and optimized builds
- ✅ **Tailwind CSS** with custom design system and components
- ✅ **Axios** for API communication with error handling
- ✅ **Responsive Design** with modern animations and transitions
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

## � Getting Started

### Option 1: Use as Template (Recommended)

1. **Click "Use this template"** on GitHub to create your own repository
2. **Clone your new repository**:

   ```bash
   git clone https://github.com/yourusername/your-project-name.git
   cd your-project-name
   ```

3. **Install dependencies**:

   ```bash
   # Install server dependencies
   cd Server && npm install
   
   # Install client dependencies  
   cd ../Client && npm install
   ```

4. **Start development**:

   ```bash
   # Terminal 1: Start backend server
   cd Server && npm run dev
   
   # Terminal 2: Start frontend client
   cd ../Client && npm run dev
   ```

### Option 2: Clone Directly

```bash
# Clone the repository
git clone <repo-url>
cd LaunchPad

# Install dependencies for both server and client
cd Server && npm install
cd ../Client && npm install
```

### 2. Configure Server Environment

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

## 🎨 Customizing Your Project

### 1. Update Project Information

**Package Names & Descriptions:**

- `Server/package.json` - Update name, description, author
- `Client/package.json` - Update name, description, author  
- `Client/index.html` - Update title and meta information

**Application Branding:**

- `Client/src/App.jsx` - Update app title and description
- `Client/public/` - Replace favicon and logos
- `README.md` - Update with your project details

### 2. Environment Configuration

```bash
# Server environment variables
cd Server
cp .env.example .env
# Edit .env with your database, JWT secrets, etc.
```

**Key Variables to Configure:**

- `JWT_SECRET` - For authentication (required)
- `DATABASE_URL` - If adding database integration
- `API_BASE_URL` - Update client API endpoint if needed

### 3. Customize Styling

**Tailwind Configuration:**

- `Client/tailwind.config.js` - Update colors, fonts, spacing
- `Client/src/index.css` - Modify component classes
- `Client/src/App.jsx` - Update UI components and layout

## 🐳 Docker Support

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
