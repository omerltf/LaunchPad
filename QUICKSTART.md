# Quick Start Guide

Get up and running with LaunchPad in 5 minutes! 🚀

## Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose (optional)

## Step 1: Get the Template

```bash
# Option A: Fork on GitHub and clone
git clone https://github.com/YOUR_USERNAME/YOUR_PROJECT.git
cd YOUR_PROJECT

# Option B: Use as template
# Click "Use this template" on GitHub, then clone
```

## Step 2: Run Setup Script

```bash
./setup.sh
```

This will:

- Help customize your project name
- Create `.env` files with secure defaults
- Install all dependencies
- Verify your environment

**That's it!** Skip to Step 5 to run your app.

---

## Step 3: Manual Setup (Alternative)

If you prefer manual setup or the script doesn't work:

### 3.1 Create Environment Files

```bash
# Server
cd Server
cp .env.example .env
# Edit Server/.env and change JWT_SECRET to a random string

# Client  
cd ../Client
cp .env.example .env
```

### 3.2 Install Dependencies

```bash
# Server
cd Server
npm install

# Client
cd ../Client
npm install
```

## Step 4: Customize (Optional)

- Update `package.json` files (name, description)
- Update `Client/index.html` (title)
- Review `CONTRIBUTING.md` for more customization options

## Step 5: Run the Application

### Option A: Docker (Recommended)

```bash
docker-compose -f docker-compose.dev.yml up
```

### Option B: Local Development

**Terminal 1 - Server:**

```bash
cd Server
npm run dev
```

**Terminal 2 - Client:**

```bash
cd ../Client
npm run dev
```

## Step 6: Access Your App

- **Frontend:** <http://localhost:3000>
- **Backend API:** <http://localhost:3001>
- **Health Check:** <http://localhost:3001/health>

## Step 7: Test It Out

1. Open <http://localhost:3000>
2. Click "Register" and create an account
3. Login with your credentials
4. Access the protected Dashboard

## Next Steps

- [ ] Read [CONTRIBUTING.md](./CONTRIBUTING.md) for customization
- [ ] Explore the [Server README](./Server/README.md) for API details
- [ ] Check out [Client README](./Client/README.md) for frontend info
- [ ] Review [SECURITY_NOTICE.md](./SECURITY_NOTICE.md) for security info
- [ ] Start building your features!

## Common Issues

### Port Already in Use

```bash
# Change ports in:
# - Server/.env (PORT=3001)
# - Client/.env (VITE_API_URL=http://localhost:3001)
# Then restart
```

### Dependencies Won't Install

```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### JWT Token Errors

Make sure you:

1. Changed `JWT_SECRET` in `Server/.env`
2. Restarted the server after changes

## Need Help?

- 📖 Check the [full README](./README.md)
- 📝 Review [CONTRIBUTING.md](./CONTRIBUTING.md)
- 🐛 Open an issue on GitHub
- 📚 Read the detailed documentation in `Server/` and `Client/`

---

**Happy coding!** 🎉

Built with ❤️ using LaunchPad
