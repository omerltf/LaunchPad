# Changelog

All notable changes to the LaunchPad template will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial template structure with React + Vite frontend
- Express.js backend with comprehensive middleware
- JWT authentication system with token management
- Protected routes and authentication context
- Maintenance mode feature with UI controls
- Docker development environment
- Comprehensive documentation
- Security features (Helmet, CORS, rate limiting)
- Input validation system
- Error handling middleware
- Logging system with file and console output
- Database abstraction layer (prepared for future use)
- Testing setup with Jest
- ESLint configuration for both client and server
- Tailwind CSS with custom design system
- React Router for navigation
- Environment configuration with validation
- Health check endpoints
- Request timing middleware
- User management API endpoints

### Security

- Development-only mode enforcement
- Localhost-only binding
- Production mode explicitly disabled
- Comprehensive security documentation
- Security headers with Helmet.js
- CORS protection
- Rate limiting
- JWT secret management
- Password hashing with bcrypt

## [1.0.0] - 2025-11-03

### Initial Release

First stable release of LaunchPad - a full-stack application template.

#### Frontend Features

- React 18 with modern hooks
- Vite for fast development and builds
- Tailwind CSS styling
- Authentication system with JWT
- Protected routes
- Responsive design
- Real-time server status
- Maintenance mode UI

#### Backend Features

- Express.js REST API
- JWT authentication
- User management
- Maintenance mode API
- Security middleware stack
- Input validation
- Error handling
- Logging system
- Health checks
- Database abstraction layer

#### Development Tools

- Docker development environment
- Hot reload for both client and server
- ESLint configuration
- Jest testing framework
- VS Code tasks configuration
- Comprehensive documentation

#### Documentation

- Main README with setup instructions
- Client-specific documentation
- Server-specific documentation
- Security notices and best practices
- Docker deployment guide
- Maintenance mode guide
- API documentation
- Contributing guidelines (added 2025-11-03)

---

## Template Versioning Guide

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes, major architectural updates
- **MINOR**: New features, non-breaking improvements
- **PATCH**: Bug fixes, documentation updates, minor tweaks

### What Constitutes a Breaking Change?

- Changes to file structure that require user updates
- Removal of features or APIs
- Changes to environment variable names
- Major dependency updates with breaking changes
- Changes to Docker configuration requiring rebuild

### Update Checklist

When updating the template:

1. Update this CHANGELOG.md
2. Update version in package.json files
3. Update documentation if needed
4. Tag the release in git
5. Update any version references in documentation

---

## Notes

- This template is intentionally locked to development mode for security
- Production deployment requires explicit configuration changes
- See CONTRIBUTING.md for customization instructions
- See SECURITY_NOTICE.md for security configuration details
