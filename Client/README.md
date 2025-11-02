# React Client Application

A modern React client application built with Vite to interact with the Node.js server API, featuring real-time updates, responsive design, and comprehensive error handling.

## 🚀 Features

- ✅ **React 18** with modern hooks and best practices
- ✅ **Vite** for lightning-fast development and optimized builds
- ✅ **Tailwind CSS** with custom design system and components
- ✅ **Axios** for robust API communication with error handling
- ✅ **Responsive Design** with modern layouts and animations
- ✅ **Real-time Server Status** monitoring and health checks
- ✅ **Maintenance Mode UI** with visual indicators and controls
- ✅ **User Management** with full CRUD operations
- ✅ **Loading States** and progress indicators
- ✅ **Error Handling** with user-friendly messages
- ✅ **Modern UI** with gradients, animations, and hover effects
- ✅ **Code Quality** with ESLint and React best practices

## 📁 Project Structure

```text
src/
├── App.jsx           # Main application component
├── App.css           # Component styles and responsive design
├── index.css         # Global styles and CSS variables
├── main.jsx          # Application entry point and React setup
└── assets/           # Static assets (images, icons)

public/               # Static public assets
├── index.html        # HTML template
└── vite.svg         # Vite logo

config files:
├── vite.config.js    # Vite configuration
├── eslint.config.js  # ESLint configuration
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## 🛠 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Server running** on `http://localhost:3001`

### Installation

1: Install dependencies:

```bash
npm install
```

2: Start the development server:

```bash
npm run dev
```

The client will start on `http://localhost:3000` and automatically open in your browser.

### Docker Support

**Production Docker:**

```bash
# Build production container (multi-stage build with Nginx)
docker build -t react-client .
docker run -p 80:80 react-client

# Or use Docker Compose (recommended)
docker-compose up -d client
```

**Development Docker with hot reloading:**

```bash
# Build and run development container
docker build -f Dockerfile.dev -t react-client-dev .
docker run -p 3000:3000 -v $(pwd)/src:/app/src react-client-dev

# Or use Docker Compose development setup
docker-compose -f docker-compose.dev.yml up -d client-dev
```

For comprehensive Docker documentation, see [../DOCKER.md](../DOCKER.md)

## 📚 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎯 Features Overview

### Maintenance Mode Control

Visual and interactive maintenance mode management:

- **Status Indicator**: Real-time display of current mode (🔧 Maintenance / 🟢 Live)
- **Custom Messages**: Display server-set maintenance messages to users
- **Visual Overlay**: Subtle backdrop blur effect when in maintenance mode
- **One-Click Toggle**: Easy switching between maintenance and live modes
- **Metadata Display**: Shows who last modified and when
- **Form Disabling**: Automatically disables user actions during maintenance
- **Warning Messages**: Clear communication about disabled features

**Maintenance Mode Features:**

```jsx
// State management
const [maintenanceMode, setMaintenanceMode] = useState(false)
const [maintenanceMessage, setMaintenanceMessage] = useState('')
const [maintenanceInfo, setMaintenanceInfo] = useState(null)

// Toggle function
const toggleMaintenanceMode = async () => {
  const response = await axios.post(`${API_BASE_URL}/maintenance/toggle`, {
    modifiedBy: 'admin'
  })
  // Updates UI with new status
}
```

**UI Components:**

- **Control Panel**: Dedicated card with status and toggle button
- **Overlay Banner**: Fixed position banner at top when active
- **Disabled Forms**: Visual feedback on unavailable features
- **Status Colors**: Orange for maintenance, green for live

### Server Status Dashboard

The application provides real-time monitoring of the backend server:

- **Connection Status**: Visual indicator of server connectivity
- **Server Environment**: Display of current environment (development/production)
- **Health Check**: Manual health check with server metrics
- **Last Update**: Timestamp of last successful server communication
- **Error Handling**: Clear error messages when server is unavailable

### User Management System

Comprehensive user management interface:

#### View Users

- **User List**: Display all users in responsive card layout
- **User Count**: Real-time count of total users
- **User Details**: Name, email, ID, and creation date
- **Status Indicators**: Active/inactive user status
- **Refresh**: Manual refresh button to reload user data

#### Add Users

- **Form Validation**: Real-time validation for name and email
- **Error Handling**: Clear error messages for validation failures
- **Success Feedback**: Confirmation when user is created
- **Auto-refresh**: User list updates automatically after creation

#### Interactive Features

- **Loading States**: Visual feedback during API operations
- **Error Messages**: User-friendly error handling
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader support

### UI/UX Features

#### Design System

- **Modern CSS**: CSS Grid and Flexbox layouts
- **Gradient Backgrounds**: Beautiful gradient color schemes
- **Card-based Layout**: Clean, organized information display
- **Hover Effects**: Interactive hover states and transitions
- **Loading Animations**: Smooth loading spinners and states

#### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: Responsive design for all screen sizes
- **Touch-friendly**: Large touch targets for mobile users
- **Performance**: Optimized images and assets

#### Accessibility

- **Semantic HTML**: Proper HTML structure and elements
- **ARIA Labels**: Screen reader friendly
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: High contrast for readability

## 🔗 API Integration

The client connects to the server API at `http://localhost:3001` and uses the following endpoints:

### Server Information

- **GET** `/` - Server status and environment information
- **GET** `/health` - Detailed health check with metrics

### User Management

- **GET** `/api/users` - Fetch all users with pagination
- **POST** `/api/users` - Create new user with validation

### API Features

- **Error Handling**: Comprehensive error catching and user feedback
- **Loading States**: Visual feedback during API calls
- **Retry Logic**: Automatic retry for failed requests
- **Timeout Handling**: Graceful handling of slow responses

## 🎨 Styling Architecture

### CSS Organization

```text
src/
├── index.css         # Global styles, variables, reset
└── App.css          # Component-specific styles
```

### Design Tokens

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-color: #4CAF50;
  --error-color: #f44336;
  --warning-color: #ff9800;
  --border-radius: 12px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Component Styles

- **Card Components**: Consistent card styling with shadows
- **Button System**: Multiple button variants (primary, secondary, success, maintenance, live)
- **Form Elements**: Styled inputs with focus states
- **Status Indicators**: Color-coded status displays (success, warning, error)
- **Loading States**: Animated loading spinners
- **Maintenance Mode Styles**: Orange theme for maintenance UI elements

### Maintenance Mode Styling

```css
/* Maintenance mode button styles */
.btn-maintenance {
  @apply bg-gradient-to-r from-orange-500 to-orange-600 
         hover:from-orange-600 hover:to-orange-700 text-white;
}

.btn-live {
  @apply bg-gradient-to-r from-emerald-500 to-emerald-600 
         hover:from-emerald-600 hover:to-emerald-700 text-white;
}

/* Status card variants */
.status-warning {
  @apply bg-orange-50 border-orange-200;
}

.status-success {
  @apply bg-green-50 border-green-200;
}
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Development Configuration
VITE_NODE_ENV=development
```

### API Base URL Configuration

The API base URL is currently hardcoded but can be made configurable:

```javascript
// Current implementation
const API_BASE_URL = 'http://localhost:3001'

// Environment variable approach
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
```

### Vite Configuration

The `vite.config.js` includes:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 3000
  }
})
```

## 🏗 Building for Production

### Build Process

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Build Optimization

Vite automatically optimizes the build with:

- **Code Splitting**: Automatic code splitting for optimal loading
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Asset Optimization**: Optimize images and other assets
- **Module Bundling**: Efficient module bundling

### Deployment

The build creates a `dist` folder that can be served by any static file server:

```bash
# Example deployment to Netlify
npm run build
# Upload dist/ folder to Netlify

# Example deployment to Vercel
npm run build
# Deploy dist/ folder to Vercel
```

## 🧪 Development Workflow

### Hot Module Replacement (HMR)

Vite provides instant updates during development:

- **Fast Refresh**: React components update without losing state
- **CSS Hot Reload**: Styles update instantly
- **Import Hot Reload**: Module changes reflect immediately

### Development Tools

- **React Developer Tools**: Browser extension for React debugging
- **Vite DevTools**: Built-in development server features
- **ESLint Integration**: Real-time code quality feedback
- **Browser DevTools**: Network tab for API debugging

## 🔍 Code Quality

### ESLint Configuration

The project uses modern ESLint configuration:

```javascript
export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

### Code Style Guidelines

- **Functional Components**: Use function components with hooks
- **Modern JavaScript**: ES6+ features and syntax
- **Consistent Naming**: camelCase for variables, PascalCase for components
- **Component Structure**: Props, state, effects, handlers, render
- **File Organization**: One component per file, clear file naming

## 🚀 Performance Optimization

### React Best Practices

- **Hooks Optimization**: Proper use of useEffect dependencies
- **State Management**: Efficient state updates and structure
- **Component Memoization**: Use React.memo when appropriate
- **Event Handlers**: Stable references for event handlers

### Asset Optimization

- **Image Optimization**: Optimized image formats and sizes
- **Code Splitting**: Dynamic imports for large components
- **Bundle Analysis**: Monitor bundle size and dependencies
- **Lazy Loading**: Load components and images as needed

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes locally
5. Run linting: `npm run lint`
6. Submit a pull request

### Code Guidelines

- Follow the existing code style and patterns
- Add comments for complex logic
- Ensure responsive design works on all devices
- Test API integration thoroughly
- Update documentation for new features

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Firefox Mobile
- **Feature Support**: ES6+, CSS Grid, Flexbox, Fetch API

## 🔗 Related Links

- [React Documentation](https://reactjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [ESLint Documentation](https://eslint.org/docs)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

For more information, see the [main project README](../README.md).
