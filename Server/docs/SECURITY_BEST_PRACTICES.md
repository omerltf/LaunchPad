# Security Best Practices Guide

## 🎯 Purpose

This document provides practical security guidelines for developers working on the LaunchPad application. For comprehensive security documentation, see [../SECURITY.md](../SECURITY.md).

---

## 🔐 Authentication & Authorization

### JWT Token Handling

**✅ DO:**

```javascript
// Always verify token type
const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);

// Use authenticate middleware on protected routes
router.get('/profile', authenticate, handler);

// Check authorization for role-based endpoints
router.delete('/user/:id', authenticate, authorize('admin'), handler);

// Sanitize user data before returning
return sanitizeUser(user);
```

**❌ DON'T:**

```javascript
// Never use refresh tokens as access tokens
const decoded = jwt.verify(token); // Missing type check

// Never skip authentication on sensitive endpoints
router.delete('/user/:id', handler); // No auth!

// Never return raw user objects with passwords
return user; // Contains password field!

// Never log sensitive data
logger.info(`Password: ${password}`); // Security leak!
```

### Password Security

**✅ DO:**

```javascript
// Always hash passwords with bcrypt
const hashedPassword = await hashPassword(password);

// Always validate password strength
const validation = validatePasswordStrength(password);
if (!validation.isValid) {
  throw new AppError(validation.errors.join(', '), 400);
}

// Always use constant-time comparison
const isValid = await comparePassword(plaintext, hashed);
```

**❌ DON'T:**

```javascript
// Never store passwords in plaintext
user.password = password; // Disaster!

// Never use weak hashing
const hash = crypto.createHash('md5').update(password); // Too weak!

// Never compare passwords with ===
if (user.password === inputPassword) // Timing attack!
```

---

## 🛡️ Input Validation

### Validation Middleware

**✅ DO:**

```javascript
// Always validate input with express-validator
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('username').matches(/^[a-zA-Z0-9_]+$/)
  ],
  validateInput,
  handler
);

// Always sanitize and validate at service layer too
async register(userData) {
  const { email, password } = userData;
  
  // Validate email format
  if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new AppError('Invalid email format', 400);
  }
  
  // Validate password strength
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join(', '), 400);
  }
}
```

**❌ DON'T:**

```javascript
// Never trust user input without validation
const user = await db.create(req.body); // SQL injection risk!

// Never use weak validation
if (email.includes('@')) // Too permissive!

// Never skip sanitization
const query = `SELECT * FROM users WHERE id = ${req.params.id}`; // SQL injection!
```

### Field Whitelisting

**✅ DO:**

```javascript
// Whitelist allowed fields for updates
async updateProfile(userId, updateData) {
  const allowedFields = ['firstName', 'lastName', 'username'];
  const filteredData = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }
  
  return this.repository.update(userId, filteredData);
}
```

**❌ DON'T:**

```javascript
// Never blindly accept all fields
async updateProfile(userId, updateData) {
  // User can set role: 'admin' or isActive: false!
  return this.repository.update(userId, updateData);
}
```

---

## 🚦 Rate Limiting

### Applying Rate Limits

**✅ DO:**

```javascript
// Apply stricter limits to sensitive endpoints
router.post('/login',
  rateLimit({ max: 10, windowMs: 15 * 60 * 1000 }),
  handler
);

router.post('/register',
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),
  handler
);

// Apply moderate limits to general API endpoints
router.get('/api/data',
  rateLimit({ max: 100, windowMs: 15 * 60 * 1000 }),
  handler
);
```

**❌ DON'T:**

```javascript
// Never expose authentication endpoints without rate limiting
router.post('/login', handler); // Brute force attack!

// Never use same limits for all endpoints
app.use(rateLimit({ max: 1000 })); // Too permissive for sensitive endpoints!
```

---

## 🔒 Authorization Patterns

### Ownership Checking

**✅ DO:**

```javascript
// Check ownership before allowing operations
async updateProfile(userId, updateData) {
  const user = await this.repository.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // User can only update their own profile
  if (req.user.userId !== userId && req.user.role !== 'admin') {
    throw new AppError('Insufficient permissions', 403);
  }
  
  return this.repository.update(userId, updateData);
}

// Or use checkOwnership middleware
router.put('/user/:id',
  authenticate,
  checkOwnership('id'),
  handler
);
```

**❌ DON'T:**

```javascript
// Never assume authenticated = authorized
router.put('/user/:id', authenticate, async (req, res) => {
  // Anyone can update anyone's profile!
  await userService.update(req.params.id, req.body);
});
```

### Admin Protection

**✅ DO:**

```javascript
// Prevent admins from dangerous self-operations
async deleteUser(userId, requesterId) {
  if (userId === requesterId) {
    throw new AppError('Cannot delete your own account', 400);
  }
  
  return this.repository.delete(userId);
}

async deactivateUser(userId, requesterId, role) {
  if (role === 'admin' && userId === requesterId) {
    throw new AppError('Admins cannot deactivate their own account', 400);
  }
  
  return this.repository.deactivate(userId);
}
```

**❌ DON'T:**

```javascript
// Never allow admins to lock themselves out
async deleteUser(userId) {
  return this.repository.delete(userId); // Can delete themselves!
}
```

---

## 📊 Data Sanitization

### Removing Sensitive Fields

**✅ DO:**

```javascript
// Always sanitize before returning user data
const { sanitizeUser } = require('../utils/auth');

async getProfile(userId) {
  const user = await this.repository.findById(userId);
  return sanitizeUser(user); // Removes password, tokens, etc.
}

async getAllUsers() {
  const users = await this.repository.findAll();
  return users.map(user => sanitizeUser(user));
}
```

**❌ DON'T:**

```javascript
// Never return raw database records
async getProfile(userId) {
  return this.repository.findById(userId); // Contains password!
}

// Never log sensitive data
logger.info('User data:', user); // Logs password!
```

### Response Data

**✅ DO:**

```javascript
// Return minimal necessary data
res.json({
  user: {
    id: user.id,
    email: user.email,
    role: user.role
  }
});

// Use sanitization utilities
res.json({
  user: sanitizeUser(user)
});
```

**❌ DON'T:**

```javascript
// Never return internal identifiers
res.json(user); // Exposes everything!

// Never include error details in production
catch (err) {
  res.json({ error: err.stack }); // Information disclosure!
}
```

---

## 🐛 Error Handling

### Security-Conscious Errors

**✅ DO:**

```javascript
// Use generic messages for authentication failures
async login(credentials) {
  const user = await this.repository.findByEmail(email);
  
  if (!user || !await comparePassword(password, user.password)) {
    // Generic message prevents user enumeration
    throw new AppError('Invalid credentials', 401);
  }
}

// Log details internally, show generic message to user
catch (error) {
  logger.error('Database error:', error);
  throw new AppError('An error occurred', 500);
}
```

**❌ DON'T:**

```javascript
// Never expose internal details
async login(credentials) {
  const user = await this.repository.findByEmail(email);
  
  if (!user) {
    throw new AppError('Email not found', 404); // User enumeration!
  }
  
  if (!await comparePassword(password, user.password)) {
    throw new AppError('Password incorrect', 401); // User enumeration!
  }
}

// Never expose stack traces
catch (error) {
  res.status(500).json({ error: error.stack }); // Information disclosure!
}
```

---

## 🔍 Logging

### Security Event Logging

**✅ DO:**

```javascript
// Log authentication events
logger.info(`User logged in: ${user.id} - ${user.email}`);
logger.warn(`Failed login attempt for user: ${email}`);

// Log authorization failures
logger.warn(`Authorization failed for user ${userId}. Required: ${roles}`);

// Log sensitive operations
logger.info(`User deleted: ${userId} by ${requesterId}`);
logger.info(`Password changed for user: ${userId}`);
```

**❌ DON'T:**

```javascript
// Never log credentials
logger.info(`Login attempt: ${email} / ${password}`); // Security breach!

// Never log tokens
logger.info(`Generated token: ${jwt}`); // Can be stolen!

// Never log personal data unnecessarily
logger.info(`User search: ${JSON.stringify(user)}`); // Privacy issue!
```

---

## 🗄️ Database Queries

### Preventing Injection Attacks

**✅ DO:**

```javascript
// Use parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Use ORM/repository pattern
const user = await this.repository.findById(userId);

// Validate and sanitize input
const safeId = parseInt(userId, 10);
if (isNaN(safeId)) {
  throw new AppError('Invalid user ID', 400);
}
```

**❌ DON'T:**

```javascript
// Never concatenate user input into queries
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
const user = await db.query(query); // SQL injection!

// Never trust user input for column names
const orderBy = req.query.sort; // Can be "id; DROP TABLE users--"
const query = `SELECT * FROM users ORDER BY ${orderBy}`;
```

### Query Performance & DoS

**✅ DO:**

```javascript
// Always paginate large result sets
async getAllUsers({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const users = await this.repository.find({}, {
    limit: Math.min(limit, 100), // Cap at 100
    skip
  });
  
  return { users, page, limit };
}

// Use database-level search with indexes
async searchUsers(query) {
  // Assumes database has indexes on searchable fields
  return this.repository.search(query, { limit: 50 });
}
```

**❌ DON'T:**

```javascript
// Never load all records without pagination
async getAllUsers() {
  return this.repository.find({}); // Can OOM with many users!
}

// Never search in-memory
async searchUsers(query) {
  const allUsers = await this.repository.find({}); // Loads everything!
  return allUsers.filter(u => u.email.includes(query));
}
```

---

## 🌐 API Security

### CORS Configuration

**✅ DO:**

```javascript
// Whitelist specific origins
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**❌ DON'T:**

```javascript
// Never allow all origins with credentials
app.use(cors({
  origin: '*',
  credentials: true // Security risk!
}));
```

### Security Headers

**✅ DO:**

```javascript
// Use Helmet with proper CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'https:']
    }
  }
}));
```

---

## 🔧 Configuration Management

### Environment Variables

**✅ DO:**

```javascript
// Validate required environment variables
const requiredVars = ['JWT_SECRET', 'DB_CONNECTION_STRING'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required env var: ${varName}`);
  }
}

// Use strong defaults
const config = {
  jwtSecret: process.env.JWT_SECRET, // No default!
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  saltRounds: process.env.NODE_ENV === 'test' ? 1 : 10
};
```

**❌ DON'T:**

```javascript
// Never use weak defaults for secrets
const jwtSecret = process.env.JWT_SECRET || 'default-secret'; // Disaster!

// Never commit .env files
// Make sure .env is in .gitignore!

// Never log environment variables
console.log(process.env); // Exposes secrets!
```

---

## 📋 Security Checklist for PRs

Before submitting a PR with security-related code, verify:

- [ ] All user input is validated and sanitized
- [ ] Passwords are hashed with bcrypt (never plaintext)
- [ ] User data is sanitized before returning (no passwords/tokens)
- [ ] Authentication is required on protected endpoints
- [ ] Authorization checks resource ownership
- [ ] Rate limiting applied to sensitive endpoints
- [ ] Error messages don't disclose sensitive information
- [ ] No credentials or secrets in code
- [ ] Security events are logged appropriately
- [ ] Database queries use parameterization
- [ ] No personal data logged unnecessarily
- [ ] Tests cover security edge cases

---

## 📚 Additional Resources

- [Main Security Documentation](../SECURITY.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)

---

**Last Updated**: 2025-11-02  
**Maintained By**: Security Team
