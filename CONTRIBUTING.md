# Contributing to LaunchPad

Thank you for your interest in LaunchPad! This guide will help you get started whether you're contributing to the template itself or using it as a starting point for your own project.

## 🍴 Forking This Template

### Quick Start After Forking

1. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_PROJECT_NAME.git
   cd YOUR_PROJECT_NAME
   ```

2. **Rename the project**
   - Update `package.json` in both `Client/` and `Server/` directories
   - Change `name` field from `launchpad-*` to your project name
   - Update `description` fields
   - Update `keywords` arrays

3. **Set up environment files**

   ```bash
   # Server
   cd Server
   cp .env.example .env
   # Edit .env and change JWT_SECRET and other values
   
   # Client
   cd ../Client
   cp .env.example .env
   # Edit .env if needed (usually defaults are fine for dev)
   ```

4. **Install dependencies**

   ```bash
   # Server
   cd Server
   npm install
   
   # Client
   cd ../Client
   npm install
   ```

5. **Start development**

   ```bash
   # Option 1: Docker (recommended)
   docker-compose -f docker-compose.dev.yml up
   
   # Option 2: Local development
   # Terminal 1 - Server
   cd Server && npm run dev
   
   # Terminal 2 - Client
   cd Client && npm run dev
   ```

### Customizing the Template

#### Remove LaunchPad Branding

1. **Update README files**
   - `/README.md` - Replace with your project description
   - `/Client/README.md` - Customize for your frontend
   - `/Server/README.md` - Customize for your backend

2. **Update package.json files**
   - Change project names, descriptions, authors
   - Update repository URLs
   - Modify keywords for your project

3. **Update HTML title**
   - Edit `/Client/index.html` - Change `<title>` tag

4. **Remove/modify template docs** (optional)
   - Keep or remove `SECURITY_NOTICE.md` based on your needs
   - Modify `DOCKER.md` for your deployment strategy
   - Update `MAINTENANCE_MODE.md` if you use this feature

#### Enable Production Mode

⚠️ **The template is intentionally locked to development mode for security.**

To enable production:

1. **Server changes** (`Server/src/app.js`):

   ```javascript
   // Remove or comment out these lines:
   if (isProduction() || config.server.environment === 'production') {
     console.error('SECURITY ERROR: Production mode is disabled')
     process.exit(1)
   }
   ```

2. **Server package.json** (`Server/package.json`):

   ```json
   "scripts": {
     "start": "node src/app.js",  // Replace the disabled message
   }
   ```

3. **Client package.json** (`Client/package.json`):

   ```json
   "scripts": {
     "build": "vite build",    // Replace the disabled message
     "preview": "vite preview" // Replace the disabled message
   }
   ```

4. **Docker files**:
   - Uncomment `/docker-compose.yml`
   - Uncomment `/Server/Dockerfile`
   - Uncomment `/Client/Dockerfile`

5. **Review security settings**:
   - See `/Server/docs/DEPLOYMENT_CHECKLIST.md`
   - See `/Server/docs/SECURITY_BEST_PRACTICES.md`
   - Update CORS, JWT secrets, rate limits for production

## 🤝 Contributing to the Template

If you want to improve the LaunchPad template itself:

### Setting Up for Development

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Follow the Quick Start setup above

### Guidelines

#### Code Style

- **JavaScript/React**: Follow the existing ESLint configuration
- **Use modern ES6+ syntax**: async/await, destructuring, arrow functions
- **React**: Functional components with hooks (no class components)
- **Comments**: Add JSDoc comments for functions and complex logic
- **Naming**: Use camelCase for variables/functions, PascalCase for components

#### Commit Messages

Follow conventional commits format:

```text
type(scope): brief description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```text
feat(auth): add password reset functionality
fix(server): correct CORS configuration for production
docs(readme): update installation instructions
```

#### Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass**: `npm test` in Server directory
4. **Update README** if adding new features
5. **Update CHANGELOG.md** with your changes (if it exists)
6. **Ensure code passes linting**:

   ```bash
   # Server
   cd Server && npm run lint
   
   # Client
   cd Client && npm run lint
   ```

### What to Contribute

#### High Priority

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✅ Additional tests
- 🔒 Security enhancements
- ♿ Accessibility improvements

#### Welcome Additions

- 🎨 UI/UX improvements
- 🚀 Performance optimizations
- 🔧 New optional features (keep core simple)
- 📦 Database adapter examples
- 🌐 API documentation
- 🐳 Docker improvements

#### Please Discuss First

- 🏗️ Major architectural changes
- 💥 Breaking changes
- 📚 New dependencies (avoid bloat)
- 🔄 Changes to core template structure

## 🐛 Reporting Issues

### Before Submitting

1. Check existing issues to avoid duplicates
2. Use the latest version of the template
3. Test with a clean environment

### Issue Template

```markdown
**Description**
Clear description of the issue

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- Node version: 
- npm version: 
- OS: 
- Docker: Yes/No

**Additional Context**
Any other relevant information
```

## 📋 Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Explain the use case and benefit
3. Consider if it fits the template's philosophy (simple, flexible foundation)
4. Be open to discussion about implementation

## 🧪 Testing

### Running Tests

```bash
# Server tests
cd Server
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Writing Tests

- Place tests in `Server/tests/` directory
- Use descriptive test names
- Follow existing test patterns
- Aim for >80% code coverage for new features

## 📝 Documentation

Good documentation is crucial for a template:

- **README**: Keep clear and concise
- **Code comments**: Explain "why", not "what"
- **JSDoc**: Document public APIs
- **Examples**: Provide usage examples for new features

## 🎯 Philosophy

LaunchPad aims to be:

- **Simple**: Easy to understand and modify
- **Flexible**: Adaptable to various use cases
- **Modern**: Using current best practices
- **Secure**: Security-first approach
- **Documented**: Well-explained for learning

When contributing, keep these principles in mind.

## 💬 Questions?

- Check the documentation in `/Server/README.md` and `/Client/README.md`
- Review existing issues and discussions
- Open a new issue with the "question" label

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LaunchPad! 🚀
