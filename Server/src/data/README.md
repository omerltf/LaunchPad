# Data Access Layer Documentation

This directory contains a comprehensive data access layer (DAL) template that supports multiple database types and provides a unified interface for data operations.

## Overview

The data access layer follows a repository pattern with adapter-based database connectivity, allowing you to switch between different database types without changing your application logic.

## Architecture

```
src/data/
├── index.js                 # Main entry point
├── DatabaseFactory.js       # Factory for creating database adapters
├── adapters/                # Database adapters
│   ├── BaseDatabaseAdapter.js
│   ├── MemoryAdapter.js     # In-memory storage (ready to use)
│   ├── MongoDBAdapter.js    # MongoDB adapter (template)
│   ├── MySQLAdapter.js      # MySQL adapter (template)
│   ├── PostgreSQLAdapter.js # PostgreSQL adapter (template)
│   └── SQLiteAdapter.js     # SQLite adapter (template)
├── repositories/            # Repository classes
│   ├── BaseRepository.js    # Base repository with common operations
│   ├── UserRepository.js    # User-specific repository
│   └── RepositoryFactory.js # Factory for creating repositories
├── models/                  # Data model definitions
│   └── UserModel.js         # User model with validation
├── migrations/              # Database migrations
│   ├── MigrationManager.js  # Migration system
│   └── 2024_01_01_000001_create_users_table.js # Example migration
└── examples/                # Usage examples
    └── DataAccessLayerExample.js
```

## Supported Database Types

- **Memory** (✅ Ready): In-memory storage for development and testing
- **MongoDB** (📝 Template): NoSQL document database
- **MySQL** (📝 Template): Relational database
- **PostgreSQL** (📝 Template): Advanced relational database
- **SQLite** (📝 Template): Lightweight file-based database

## Quick Start

### 1. Basic Setup

```javascript
const { dataAccessLayer } = require('./data')

// Initialize with default configuration (memory adapter)
await dataAccessLayer.initialize()

// Initialize with specific configuration
await dataAccessLayer.initialize({
  type: 'memory', // or 'mongodb', 'mysql', 'postgresql', 'sqlite'
  database: 'myapp_dev'
})
```

### 2. Using Repositories

```javascript
const RepositoryFactory = require('./data/repositories/RepositoryFactory')

// Create repository factory
const repositoryFactory = new RepositoryFactory(dataAccessLayer.getDatabase())

// Get user repository
const userRepository = repositoryFactory.getUserRepository()

// Create a user
const user = await userRepository.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'hashedpassword123',
  firstName: 'John',
  lastName: 'Doe'
})

// Find user by email
const foundUser = await userRepository.findByEmail('john@example.com')

// Update user
const updatedUser = await userRepository.updateProfile(user.id, {
  firstName: 'Jonathan'
})
```

### 3. Running Migrations

```javascript
const MigrationManager = require('./data/migrations/MigrationManager')

const migrationManager = new MigrationManager(
  dataAccessLayer.getDatabase(),
  './data/migrations'
)

// Run pending migrations
await migrationManager.migrate()

// Check migration status
const status = await migrationManager.getStatus()
console.log(status)
```

## Configuration

Configure your database in your environment variables or config file:

```javascript
// Environment variables
DB_TYPE=memory              // Database type
DB_HOST=localhost          // Database host
DB_PORT=5432              // Database port
DB_NAME=myapp_dev         // Database name
DB_USER=username          // Database user
DB_PASSWORD=password      // Database password
DB_CONNECTION_STRING=...  // Full connection string (optional)
DB_FILENAME=./db.sqlite   // SQLite file path
DB_CONNECTION_LIMIT=10    // Connection pool limit
DB_SSL=false             // Use SSL connection
DB_TIMEOUT=30000         // Connection timeout
```

## Implementing Database Adapters

To implement a specific database adapter:

### 1. Install Required Package

```bash
# For MongoDB
npm install mongodb

# For MySQL
npm install mysql2

# For PostgreSQL
npm install pg

# For SQLite
npm install sqlite3
```

### 2. Complete Adapter Implementation

Each adapter template in the `adapters/` directory contains commented implementation examples. Uncomment and complete the implementation for your chosen database.

### 3. Update Factory

The `DatabaseFactory.js` will automatically use your completed adapter.

## Repository Pattern

### Base Repository

All repositories extend `BaseRepository` which provides:

- `create(data)` - Create new record
- `find(query, options)` - Find multiple records
- `findById(id)` - Find by ID
- `findOne(query)` - Find single record
- `update(query, update, options)` - Update records
- `updateById(id, update)` - Update by ID
- `delete(query)` - Delete records
- `deleteById(id)` - Delete by ID
- `count(query)` - Count records
- `exists(query)` - Check existence
- `paginate(query, page, limit, sort)` - Paginated results

### Custom Repositories

Create domain-specific repositories by extending `BaseRepository`:

```javascript
const BaseRepository = require('./BaseRepository')

class PostRepository extends BaseRepository {
  constructor(database) {
    super(database, 'posts')
  }

  async findPublished() {
    return this.find({ published: true })
  }

  async findByAuthor(authorId) {
    return this.find({ authorId })
  }
}
```

## Migration System

### Creating Migrations

Create migration files with the naming pattern: `YYYY_MM_DD_HHMMSS_description.js`

```javascript
// 2024_01_01_120000_create_posts_table.js
const { logger } = require('../../utils/logger')

async function up(database) {
  await database.createCollection('posts', {
    id: { type: 'integer', primary: true, autoIncrement: true },
    title: { type: 'string', required: true },
    content: { type: 'text' },
    published: { type: 'boolean', default: false },
    createdAt: { type: 'datetime', required: true },
    updatedAt: { type: 'datetime', required: true }
  })
  logger.info('Created posts table')
}

async function down(database) {
  await database.dropCollection('posts')
  logger.info('Dropped posts table')
}

module.exports = { up, down }
```

### Running Migrations

```javascript
const migrationManager = new MigrationManager(database, './migrations')

// Run all pending migrations
await migrationManager.migrate()

// Rollback last batch
await migrationManager.rollback()

// Get migration status
const status = await migrationManager.getStatus()
```

## Model Validation

Define models with validation rules:

```javascript
const UserModel = {
  validation: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },

  methods: {
    validate(userData) {
      // Validation logic
    },
    sanitize(userData) {
      // Remove sensitive data
    }
  }
}
```

## Transaction Support

For databases that support transactions:

```javascript
const database = dataAccessLayer.getDatabase()

const transaction = await database.beginTransaction()
try {
  // Perform multiple operations
  await userRepository.create(userData1)
  await userRepository.create(userData2)
  
  await database.commitTransaction(transaction)
} catch (error) {
  await database.rollbackTransaction(transaction)
  throw error
}
```

## Health Checks

Monitor database connectivity:

```javascript
// Check data access layer health
const isHealthy = await dataAccessLayer.healthCheck()

// Check specific database health
const database = dataAccessLayer.getDatabase()
const isDbHealthy = await database.healthCheck()
```

## Error Handling

The data access layer provides consistent error handling:

```javascript
try {
  const user = await userRepository.findById(123)
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle not found
  } else if (error.message.includes('connection')) {
    // Handle connection issues
  } else {
    // Handle other errors
  }
}
```

## Best Practices

1. **Always use repositories** instead of direct database access
2. **Validate data** before database operations
3. **Use transactions** for multi-step operations
4. **Handle errors gracefully** with proper logging
5. **Run migrations** in deployment pipelines
6. **Use connection pooling** for production databases
7. **Monitor database health** with regular health checks
8. **Sanitize output data** to remove sensitive information

## Example Integration

See `examples/DataAccessLayerExample.js` for a complete working example that demonstrates all features of the data access layer.

To run the example:

```javascript
const DataAccessLayerExample = require('./data/examples/DataAccessLayerExample')

const example = new DataAccessLayerExample()
await example.runAllExamples()
await example.cleanup()
```

## Production Considerations

1. **Security**: Never expose database credentials in code
2. **Performance**: Use appropriate indexes and query optimization
3. **Monitoring**: Implement database performance monitoring
4. **Backup**: Regular database backups and recovery procedures
5. **Scaling**: Consider read replicas and database sharding for large applications
6. **Connection Management**: Proper connection pooling and timeout handling
