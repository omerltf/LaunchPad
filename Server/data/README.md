# Data Directory

This directory contains runtime data files for the LaunchPad server.

## Files

### `maintenance-state.json` (Runtime - Gitignored)

**Purpose**: Stores the current maintenance mode state and history.

**Location**: This file is **not tracked** by git (see `.gitignore`)

**Generation**: Automatically created by the server on first run if it doesn't exist

**Structure**:

```json
{
  "enabled": false,
  "message": "Maintenance message",
  "lastModified": "ISO 8601 timestamp",
  "modifiedBy": "username",
  "history": []
}
```

**Why Gitignored?**

- Contains runtime state that varies per environment
- Test runs generate history entries
- Each deployment should start with clean state
- Prevents merge conflicts between environments

### `maintenance-state.json.template` (Tracked)

**Purpose**: Template showing the default structure for maintenance state.

**Location**: Tracked in git as a reference

**Usage**:

- Documents the expected JSON structure
- Can be copied to create a fresh state file
- Used by developers to understand the data format

## Usage

### Development

The server will automatically create `maintenance-state.json` on first run if it doesn't exist.

### Deployment

For production deployment:

1. **Option A (Recommended)**: Let the server create it automatically

   ```bash
   # For production, file will be created on first run
   npm start

   # For development, use:
   npm run dev
   ```

2. **Option B**: Create from template

   ```bash
   cp data/maintenance-state.json.template data/maintenance-state.json
   ```

### Testing

Tests will modify `maintenance-state.json` during execution. The file is gitignored to prevent test artifacts from being committed.

### Resetting State

To reset maintenance state to default:

```bash
# Copy from template
cp Server/data/maintenance-state.json.template Server/data/maintenance-state.json

# Or restart the server (it will clean up automatically)
npm run dev
```

## Future Database Migration

When migrating to database storage:

- The `MaintenanceManager` supports pluggable storage backends
- Change `storageType` from `'file'` to `'database'` in `src/app.js`
- This file structure remains as fallback/documentation
- See `src/utils/MaintenanceManager.js` for implementation details

## Security Note

This file is stored locally and **should not contain sensitive data**. If you need to store sensitive maintenance information, migrate to database storage with proper encryption.
