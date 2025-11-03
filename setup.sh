#!/bin/bash

# LaunchPad Setup Script
# This script helps you set up the template after forking

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Header
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   LaunchPad Template Setup Script     ║"
echo "╔════════════════════════════════════════╗"
echo ""

# Check if we're in the right directory
if [[ ! -f "README.md" ]] || [[ ! -d "Client" ]] || [[ ! -d "Server" ]]; then
    print_error "This script must be run from the LaunchPad root directory"
    exit 1
fi

# Function to prompt user for input
prompt_user() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " result
        result="${result:-$default}"
    else
        read -p "$prompt: " result
    fi
    
    echo "$result"
}

# Ask if user wants to customize
echo "This script will help you set up your LaunchPad project."
echo ""
read -p "Do you want to customize the project settings? (y/n) [y]: " CUSTOMIZE
CUSTOMIZE="${CUSTOMIZE:-y}"

if [[ "$CUSTOMIZE" =~ ^[Yy]$ ]]; then
    # Get project details
    echo ""
    print_info "Project Configuration"
    echo "────────────────────────────────────────"
    
    PROJECT_NAME=$(prompt_user "Enter your project name (lowercase, no spaces)" "my-project")
    PROJECT_DESCRIPTION=$(prompt_user "Enter project description" "A full-stack application built with LaunchPad")
    AUTHOR_NAME=$(prompt_user "Enter author name" "")
    
    print_info "Updating project configuration..."
    
    # Update Server package.json
    if [[ -f "Server/package.json" ]]; then
        if command -v jq &> /dev/null; then
            jq --arg name "$PROJECT_NAME-server" \
               --arg desc "$PROJECT_DESCRIPTION - Backend Server" \
               --arg author "$AUTHOR_NAME" \
               '.name = $name | .description = $desc | .author = $author' \
               Server/package.json > Server/package.json.tmp && \
               mv Server/package.json.tmp Server/package.json
            print_success "Updated Server/package.json"
        else
            print_warning "jq not installed, skipping package.json updates (you can do this manually)"
        fi
    fi
    
    # Update Client package.json
    if [[ -f "Client/package.json" ]]; then
        if command -v jq &> /dev/null; then
            jq --arg name "$PROJECT_NAME-client" \
               --arg desc "$PROJECT_DESCRIPTION - Frontend Client" \
               '.name = $name | .description = $desc' \
               Client/package.json > Client/package.json.tmp && \
               mv Client/package.json.tmp Client/package.json
            print_success "Updated Client/package.json"
        fi
    fi
    
    # Update HTML title
    if [[ -f "Client/index.html" ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/<title>.*<\/title>/<title>${PROJECT_NAME}<\/title>/" Client/index.html
        else
            # Linux
            sed -i "s/<title>.*<\/title>/<title>${PROJECT_NAME}<\/title>/" Client/index.html
        fi
        print_success "Updated Client/index.html title"
    fi
fi

# Setup environment files
echo ""
print_info "Setting up environment files..."
echo "────────────────────────────────────────"

# Server .env
if [[ ! -f "Server/.env" ]]; then
    cp Server/.env.example Server/.env
    print_success "Created Server/.env from template"
    
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-super-secret-jwt-key-change-this-in-production/${JWT_SECRET}/" Server/.env
    else
        sed -i "s/your-super-secret-jwt-key-change-this-in-production/${JWT_SECRET}/" Server/.env
    fi
    print_success "Generated random JWT_SECRET"
else
    print_info "Server/.env already exists, skipping"
fi

# Client .env
if [[ ! -f "Client/.env" ]]; then
    cp Client/.env.example Client/.env
    print_success "Created Client/.env from template"
else
    print_info "Client/.env already exists, skipping"
fi

# Check for Node.js and npm
echo ""
print_info "Checking system requirements..."
echo "────────────────────────────────────────"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION found"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm $NPM_VERSION found"

# Ask about dependency installation
echo ""
read -p "Do you want to install dependencies now? (y/n) [y]: " INSTALL_DEPS
INSTALL_DEPS="${INSTALL_DEPS:-y}"

if [[ "$INSTALL_DEPS" =~ ^[Yy]$ ]]; then
    print_info "Installing dependencies..."
    echo "────────────────────────────────────────"
    
    # Install server dependencies
    echo ""
    print_info "Installing server dependencies..."
    cd Server
    npm install
    if [ $? -eq 0 ]; then
        print_success "Server dependencies installed"
    else
        print_error "Failed to install server dependencies"
        exit 1
    fi
    cd ..
    
    # Install client dependencies
    echo ""
    print_info "Installing client dependencies..."
    cd Client
    npm install
    if [ $? -eq 0 ]; then
        print_success "Client dependencies installed"
    else
        print_error "Failed to install client dependencies"
        exit 1
    fi
    cd ..
fi

# Check for Docker (optional)
echo ""
print_info "Checking for Docker (optional)..."
echo "────────────────────────────────────────"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker found: $DOCKER_VERSION"
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose found: $COMPOSE_VERSION"
    else
        print_warning "Docker Compose not found (optional)"
    fi
else
    print_warning "Docker not found (optional, but recommended)"
fi

# Final instructions
echo ""
echo "╔════════════════════════════════════════╗"
echo "║          Setup Complete! 🚀            ║"
echo "╚════════════════════════════════════════╝"
echo ""

print_success "Your LaunchPad project is ready!"
echo ""
print_info "Next steps:"
echo ""
echo "  1. Review and update environment files:"
echo "     • Server/.env (especially JWT_SECRET)"
echo "     • Client/.env (if needed)"
echo ""
echo "  2. Start development:"
echo ""
echo "     Option A - Docker (recommended):"
echo "     $ docker-compose -f docker-compose.dev.yml up"
echo ""
echo "     Option B - Local development:"
echo "     Terminal 1: $ cd Server && npm run dev"
echo "     Terminal 2: $ cd Client && npm run dev"
echo ""
echo "  3. Access your application:"
echo "     • Frontend: http://localhost:3000"
echo "     • Backend:  http://localhost:3001"
echo ""
echo "  4. Read the documentation:"
echo "     • README.md          - Project overview"
echo "     • CONTRIBUTING.md    - Customization guide"
echo "     • Client/README.md   - Frontend docs"
echo "     • Server/README.md   - Backend docs"
echo ""
print_warning "Remember: This template is locked to development mode."
print_warning "See CONTRIBUTING.md for enabling production mode."
echo ""
print_success "Happy coding! 🎉"
echo ""
