const request = require('supertest');
const app = require('../src/app');

describe('Server API', () => {
  describe('GET /', () => {
    it('should return server status', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Server is running!');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /health', () => {
    it('should return health check', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/api');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'API is working!');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should return error for missing data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
