# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Client Application

A modern React client application built with Vite to interact with the Node.js server API.

## Features

- ✅ **React 18** with modern hooks
- ✅ **Vite** for fast development and building
- ✅ **Axios** for API communication
- ✅ **Responsive Design** with CSS Grid and Flexbox
- ✅ **Real-time Server Status** monitoring
- ✅ **User Management** (Create and view users)
- ✅ **Error Handling** and loading states
- ✅ **Modern UI** with gradients and animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Server running on `http://localhost:3001`

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

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Features Overview

### Server Status Dashboard

- Real-time connection status with the backend API
- Server environment information
- Health check functionality
- Last update timestamp

### User Management

- **View Users**: Display all users from the API
- **Add Users**: Create new users with name and email validation
- **Refresh**: Reload users list from server
- **Responsive Cards**: User information displayed in responsive grid

### UI/UX Features

- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Design**: Gradient backgrounds, hover effects, and smooth animations

## API Integration

The client connects to the server API at `http://localhost:3001` and uses the following endpoints:

- `GET /` - Server status information
- `GET /health` - Health check
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create new user

## Project Structure

```text
src/
├── App.jsx           # Main application component
├── App.css           # Component styles
├── index.css         # Global styles
├── main.jsx          # Application entry point
└── assets/           # Static assets

public/               # Static assets
├── index.html        # HTML template
└── vite.svg         # Vite logo

config files:
├── vite.config.js    # Vite configuration
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Development

### Styling

The application uses custom CSS with modern features like CSS Grid, Flexbox, and CSS custom properties. The design features:

- Gradient backgrounds
- Smooth transitions and hover effects
- Responsive design
- Clean, modern interface

### API Communication

All API calls are made using Axios with proper error handling and loading states.

### State Management

Uses React's built-in `useState` and `useEffect` hooks for state management.

## Building for Production

```bash
npm run build
```

This creates a `dist` folder with the production build that can be served by any static file server.

## Environment Configuration

The API base URL is currently hardcoded to `http://localhost:3001`. For production, you can:

1. Create environment variables in `.env` files
2. Update the `API_BASE_URL` constant in `App.jsx`

Example `.env.local`:

```text
VITE_API_BASE_URL=http://your-production-api-url.com
```

Then update in code:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
```

## License

MIT License
