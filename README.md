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

## 📚 Documentation

### Getting Started

- **[Setup Script](./setup.sh)** - Automated setup for new projects
- **[Contributing Guide](./CONTRIBUTING.md)** - Fork and customization instructions
- **[README Template](./README.template.md)** - Template for your project's README

### Core Documentation

- **[Main README](./README.md)** - This file, project overview
- **[Server Documentation](./Server/README.md)** - Backend API and features
- **[Client Documentation](./Client/README.md)** - Frontend UI and components
- **[Changelog](./CHANGELOG.md)** - Version history and changes

### Features & Configuration

- **[Maintenance Mode Guide](./MAINTENANCE_MODE.md)** - Comprehensive maintenance mode documentation
- **[Security Notice](./SECURITY_NOTICE.md)** - Security configuration details
- **[Docker Guide](./DOCKER.md)** - Docker deployment instructions

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

### 🔧 Maintenance Mode Features

- ✅ **Persistent State Management** with JSON file storage
- ✅ **API Request Blocking** during maintenance
- ✅ **Custom Maintenance Messages** for user communication
- ✅ **Change History Tracking** with audit trail
- ✅ **Database-Ready Architecture** for easy migration
- ✅ **Configurable Whitelist** for critical endpoints
- ✅ **Client UI Toggle** with real-time status updates

### 🎨 Frontend Features

- ✅ **React 18** with modern hooks and best practices
- ✅ **Vite** for lightning-fast development and optimized builds
- ✅ **Tailwind CSS** with custom design system and components
- ✅ **Axios** for API communication with error handling
- ✅ **Responsive Design** with modern animations and transitions
- ✅ **Real-time Updates** and loading states
- ✅ **Maintenance Mode UI** with visual indicators
- ✅ **Environment Configuration** support

## 📁 Project Structure

```text
Project1/
├── Server/                 # Backend Node.js application
│   ├── src/
│   │   ├── app.js         # Main application entry point
│   │   ├── config/        # Configuration management
│   │   ├── data/          # Database abstraction layer
│   │   ├── middleware/    # Custom middleware functions
│   │   │   └── maintenanceMode.js  # Maintenance mode middleware
│   │   ├── routes/        # API route definitions
│   │   └── utils/         # Utility functions and helpers
│   │       ├── MaintenanceManager.js  # Maintenance mode manager
│   │       ├── logger.js  # Logging system
│   │       └── helpers.js # Helper functions
│   ├── data/              # Persistent storage
│   │   └── maintenance-state.json  # Maintenance mode state
│   ├── tests/             # Test files and setup
│   ├── logs/              # Application logs (auto-generated)
│   └── coverage/          # Test coverage reports
│
├── Client/                # Frontend React application
│   ├── src/
│   │   ├── App.jsx        # Main React component (with maintenance UI)
│   │   ├── index.css      # Global styles with maintenance mode styles
│   │   ├── main.jsx       # Application entry point
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
│
└── README.md              # This file
```

## 🚀 Getting Started

### Quick Setup (Recommended)

1. **Fork or clone this repository**:

   ```bash
   git clone https://github.com/yourusername/your-project-name.git
   cd your-project-name
   ```

2. **Run the setup script**:

   ```bash
   ./setup.sh
   ```

   The setup script will:
   - ✅ Guide you through project customization
   - ✅ Create environment files (.env)
   - ✅ Generate secure JWT secret
   - ✅ Install dependencies
   - ✅ Verify system requirements

### Manual Setup

If you prefer manual setup:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/your-project-name.git
   cd your-project-name
   ```

2. **Install dependencies**:

   ```bash
   # Install server dependencies
   cd Server && npm install
   
   # Install client dependencies  
   cd ../Client && npm install
   ```

3. **Configure environment files** (see detailed instructions below)

```text

## � Getting Started

### Option 1: Use as Template (Recommended)

1: **Click "Use this template"** on GitHub to create your own repository
2: **Clone your new repository**:

   ```bash
   git clone https://github.com/yourusername/your-project-name.git
   cd your-project-name
   ```

3: **Install dependencies**:

   ```bash
   # Install server dependencies
   cd Server && npm install
   
   # Install client dependencies  
   cd ../Client && npm install
   ```

4: **Start development**:

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

## � Getting Started

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

## 🔧 Maintenance Mode

LaunchPad includes a comprehensive maintenance mode system for gracefully handling downtime.

### Features

- **Persistent State**: Survives server restarts (JSON file storage)
- **API Blocking**: Automatically returns 503 during maintenance
- **Custom Messages**: Communicate expected downtime to users
- **History Tracking**: Audit trail of all maintenance changes
- **Database-Ready**: Easy migration to database storage

### Usage

**Toggle maintenance mode via API:**

```bash
# Enable maintenance mode
curl -X POST http://localhost:3001/maintenance/toggle \
  -H "Content-Type: application/json" \
  -d '{"modifiedBy":"admin"}'

# Update maintenance message
curl -X PUT http://localhost:3001/maintenance/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Scheduled upgrade - back at 2pm","modifiedBy":"admin"}'

# Check status
curl http://localhost:3001/maintenance

# View history
curl http://localhost:3001/maintenance/history
```

**Via Web UI:**

Navigate to `http://localhost:3000` and use the Maintenance Mode control panel.

### API Endpoints

- `GET /maintenance` - Get current maintenance status
- `POST /maintenance/toggle` - Toggle maintenance mode on/off
- `PUT /maintenance/message` - Update maintenance message
- `GET /maintenance/history` - Get maintenance change history

### Configuration

Maintenance state is stored in `Server/data/maintenance-state.json`. To migrate to database:

```javascript
// In Server/src/app.js
const maintenanceManager = new MaintenanceManager('database', {
  dbConnection: yourDatabaseConnection
})
```

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

### Maintenance Mode Testing

```bash
# Run the maintenance mode test script
bash test-maintenance.sh
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
- Check the documentation:
  - [Server README](./Server/README.md) - Backend documentation
  - [Client README](./Client/README.md) - Frontend documentation
  - [Maintenance Mode Guide](./MAINTENANCE_MODE.md) - Maintenance mode details
- Review the examples in the codebase

## 🎉 Acknowledgments

- **Express.js** for the robust web framework
- **React** for the powerful frontend library
- **Vite** for the amazing build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Node.js** community for excellent packages

## 📖 Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server (both client & server)

# Testing
npm test                 # Run tests
npm run lint            # Check code quality

# Database
npm run db:migrate      # Run migrations
npm run db:status       # Check migration status

# Maintenance Mode
curl -X POST http://localhost:3001/maintenance/toggle  # Toggle mode
curl http://localhost:3001/maintenance/history         # View history
```

### Key Files

- `Server/src/app.js` - Main server application
- `Server/src/utils/MaintenanceManager.js` - Maintenance mode manager
- `Server/data/maintenance-state.json` - Maintenance state storage
- `Client/src/App.jsx` - Main React component
- `.env` - Environment configuration

### Default Ports

- **Client**: <http://localhost:3000>
- **Server**: <http://localhost:3001>

---

**Happy Coding!** 🚀
