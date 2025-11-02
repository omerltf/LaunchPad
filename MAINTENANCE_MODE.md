# Maintenance Mode Documentation

## Overview

LaunchPad includes a comprehensive maintenance mode system that allows you to gracefully handle application downtime. The system features persistent state management, API request blocking, custom messaging, and a user-friendly UI.

## Architecture

### Components

1. **MaintenanceManager** (`Server/src/utils/MaintenanceManager.js`)
   - Core state management
   - Persistent storage (JSON file or database)
   - History tracking
   - Pluggable storage backends

2. **Maintenance Middleware** (`Server/src/middleware/maintenanceMode.js`)
   - Request interception
   - Automatic 503 responses during maintenance
   - Configurable endpoint whitelist

3. **Client UI** (`Client/src/App.jsx`)
   - Visual status indicators
   - Toggle controls
   - Custom message display
   - Automatic form disabling

4. **Storage** (`Server/data/maintenance-state.json`)
   - Persistent state file
   - Survives server restarts
   - Human-readable JSON format

## Features

### ✅ Persistent State Management

Maintenance mode state is stored in a JSON file and survives server restarts.

**Storage Location:** `Server/data/maintenance-state.json`

**State Structure:**

```json
{
  "enabled": false,
  "message": "We are currently performing scheduled maintenance. Please check back soon.",
  "lastModified": "2025-11-02T04:00:00.000Z",
  "modifiedBy": "admin",
  "history": [
    {
      "enabled": true,
      "message": "Database upgrade",
      "timestamp": "2025-11-02T03:00:00.000Z",
      "modifiedBy": "admin",
      "previousState": { "enabled": false, "message": "..." }
    }
  ]
}
```

### ✅ API Request Blocking

When maintenance mode is enabled, all API requests (except whitelisted endpoints) receive a 503 Service Unavailable response.

**Whitelisted Endpoints (Always Accessible):**

- `/health` - Health check
- `/maintenance` - Maintenance status
- `/` - Root endpoint

**503 Response Format:**

```json
{
  "error": "Service Unavailable",
  "message": "We are currently performing scheduled maintenance. Please check back soon.",
  "maintenanceMode": true,
  "retryAfter": "3600",
  "timestamp": "2025-11-02T04:00:00.000Z",
  "code": "MAINTENANCE_MODE"
}
```

### ✅ Custom Messages

Set custom maintenance messages to communicate with users:

```bash
curl -X PUT http://localhost:3001/maintenance/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Database migration in progress. Expected completion: 2 hours.",
    "modifiedBy": "admin"
  }'
```

### ✅ Change History

Track who changed what and when (stores last 50 changes):

```bash
curl http://localhost:3001/maintenance/history?limit=10
```

## API Reference

### Get Maintenance Status

```http
GET /maintenance
```

**Response:**

```json
{
  "maintenanceMode": false,
  "message": "Application is running normally",
  "lastModified": "2025-11-02T04:00:00.000Z",
  "modifiedBy": "admin",
  "timestamp": "2025-11-02T04:00:00.000Z"
}
```

### Toggle Maintenance Mode

```http
POST /maintenance/toggle
Content-Type: application/json

{
  "message": "Optional custom message",
  "modifiedBy": "admin"
}
```

**Response:**

```json
{
  "maintenanceMode": true,
  "message": "Optional custom message",
  "actionMessage": "Switched to maintenance mode",
  "lastModified": "2025-11-02T04:00:00.000Z",
  "modifiedBy": "admin",
  "timestamp": "2025-11-02T04:00:00.000Z"
}
```

### Update Message

```http
PUT /maintenance/message
Content-Type: application/json

{
  "message": "Updated maintenance message",
  "modifiedBy": "admin"
}
```

### Get History

```http
GET /maintenance/history?limit=10
```

**Response:**

```json
{
  "history": [
    {
      "enabled": true,
      "message": "System upgrade",
      "timestamp": "2025-11-02T04:00:00.000Z",
      "modifiedBy": "admin",
      "previousState": {
        "enabled": false,
        "message": "Application is running normally"
      }
    }
  ],
  "count": 1,
  "timestamp": "2025-11-02T04:00:00.000Z"
}
```

## Usage Examples

### Basic Usage

```javascript
// Server-side
const MaintenanceManager = require('./utils/MaintenanceManager')

// Initialize
const manager = new MaintenanceManager('file')
await manager.initialize()

// Enable maintenance mode
await manager.setStatus(true, 'Database upgrade in progress', 'admin')

// Check status
const isEnabled = await manager.isEnabled()

// Disable maintenance mode
await manager.setStatus(false, null, 'admin')
```

### Client-side Usage

```javascript
// Check maintenance status
const response = await axios.get('http://localhost:3001/maintenance')
console.log(response.data.maintenanceMode) // true or false

// Toggle maintenance mode
const toggleResponse = await axios.post('http://localhost:3001/maintenance/toggle', {
  message: 'Scheduled maintenance',
  modifiedBy: 'admin'
})
```

### Middleware Configuration

```javascript
const { createMaintenanceMiddleware } = require('./middleware/maintenanceMode')

// Basic usage
app.use(createMaintenanceMiddleware(maintenanceManager))

// Custom configuration
app.use(createMaintenanceMiddleware(maintenanceManager, {
  whitelist: ['/health', '/maintenance', '/api/status'],
  customResponse: (req, res, status) => {
    res.status(503).render('maintenance', { message: status.message })
  }
}))
```

## Storage Backends

### File Storage (Default)

Uses JSON file for persistence.

```javascript
const manager = new MaintenanceManager('file', {
  filePath: './data/maintenance-state.json' // optional custom path
})
```

**Pros:**

- Works immediately
- No database required
- Easy to inspect/edit
- Survives restarts

**Cons:**

- Not suitable for multi-instance deployments
- File I/O operations

### Database Storage (Future)

Ready for database integration when needed.

```javascript
const manager = new MaintenanceManager('database', {
  dbConnection: yourDatabaseConnection
})
```

**Migration Steps:**

1. Ensure database connection is available
2. Implement database save/load methods in MaintenanceManager
3. Update initialization code
4. Test thoroughly
5. Migrate existing state from JSON file

### Memory Storage (Development)

Temporary in-memory storage for testing.

```javascript
const manager = new MaintenanceManager('memory')
```

**Use Cases:**

- Unit testing
- Development without persistence
- Temporary deployments

## Client UI Features

### Maintenance Mode Control Panel

Visual control panel with:

- Current mode status (🔧 Maintenance / 🟢 Live)
- Custom message display
- Metadata (who modified, when)
- One-click toggle button

### Visual Indicators

When maintenance mode is active:

- **Overlay Banner**: Fixed position at top of screen
- **Backdrop Blur**: Subtle blur effect on background
- **Disabled Forms**: Visual feedback on unavailable features
- **Warning Messages**: Orange alerts on affected sections

### Automatic Behavior

- Forms automatically disabled during maintenance
- API calls show maintenance messages
- Real-time status updates
- Graceful error handling

## Testing

### Manual Testing

```bash
# Start server and client
cd Server && npm run dev
cd Client && npm run dev

# Open browser to http://localhost:3000
# Use the Maintenance Mode control panel
```

### Automated Testing Script

```bash
# Run the test script
bash test-maintenance.sh
```

The script tests:

1. Getting status
2. API access when live
3. Toggling to maintenance mode
4. API blocking during maintenance
5. Updating messages
6. Viewing history
7. Toggling back to live mode

### cURL Examples

```bash
# Get status
curl http://localhost:3001/maintenance | jq

# Enable maintenance
curl -X POST http://localhost:3001/maintenance/toggle \
  -H "Content-Type: application/json" \
  -d '{"modifiedBy":"admin"}' | jq

# Try accessing API (should get 503)
curl -w "\nStatus: %{http_code}\n" http://localhost:3001/api/users

# Update message
curl -X PUT http://localhost:3001/maintenance/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Back at 2pm","modifiedBy":"admin"}' | jq

# View history
curl http://localhost:3001/maintenance/history | jq

# Disable maintenance
curl -X POST http://localhost:3001/maintenance/toggle \
  -H "Content-Type: application/json" \
  -d '{"modifiedBy":"admin"}' | jq
```

## Best Practices

### 1. Set Descriptive Messages

```javascript
await manager.setStatus(true, 
  'Database migration in progress. Expected completion: 30 minutes. Contact support@example.com for urgent issues.',
  'admin'
)
```

### 2. Use Proper Identification

Always specify who made changes:

```javascript
await manager.toggle(message, req.user.username) // From authenticated user
```

### 3. Monitor History

Regularly check maintenance history for audit purposes:

```javascript
const history = await manager.getHistory(50)
// Review and archive as needed
```

### 4. Whitelist Critical Endpoints

Ensure monitoring and health check endpoints remain accessible:

```javascript
app.use(createMaintenanceMiddleware(maintenanceManager, {
  whitelist: [
    '/health',
    '/maintenance',
    '/metrics',
    '/monitoring'
  ]
}))
```

### 5. Plan Maintenance Windows

Schedule maintenance during low-traffic periods and communicate in advance.

### 6. Test Before Production

Always test maintenance mode in staging before using in production.

## Future Enhancements

### Planned Features

1. **Authentication Protection**
   - Require admin authentication for toggle endpoint
   - Role-based access control

2. **Scheduled Maintenance**
   - Set start/end times
   - Automatic toggling
   - Email notifications

3. **Full Maintenance Page**
   - Dedicated maintenance UI page
   - Branded design
   - Progress indicators

4. **Multi-instance Support**
   - Redis-backed state
   - Distributed locking
   - Synchronization across instances

5. **Advanced Notifications**
   - Email alerts on mode changes
   - Slack/Discord integrations
   - User announcements

## Troubleshooting

### State Not Persisting

**Problem:** Maintenance mode resets on server restart

**Solution:**

- Check that `data/` directory exists and is writable
- Verify `maintenance-state.json` file permissions
- Check server logs for file write errors

### API Still Accessible During Maintenance

**Problem:** API requests not being blocked

**Solution:**

- Ensure middleware is registered BEFORE route handlers
- Check whitelist configuration
- Verify MaintenanceManager is initialized

### Client Not Showing Status

**Problem:** UI not reflecting maintenance mode

**Solution:**

- Check browser console for errors
- Verify API endpoint is accessible
- Check CORS configuration
- Ensure client is making initial status request

## Support

For issues, questions, or contributions:

- Check the main README files
- Review server and client logs
- Test with the included test script
- Check maintenance state JSON file

## License

Same as LaunchPad project (MIT License)
