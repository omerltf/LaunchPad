const express = require('express');
const router = express.Router();

// Sample API routes
router.get('/', (req, res) => {
  res.json({
    message: 'API is working!',
    version: '1.0.0',
    endpoints: [
      'GET /api/',
      'GET /api/users',
      'POST /api/users'
    ]
  });
});

// Users routes
router.get('/users', (req, res) => {
  // Sample users data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  
  res.json({
    users,
    count: users.length
  });
});

router.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'email']
    });
  }
  
  // Simulate user creation
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});

module.exports = router;
