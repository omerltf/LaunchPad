const request = require('supertest')
const app = require('../src/app')

describe('Server API', () => {
  describe('GET /', () => {
    it('should return server status', async () => {
      const response = await request(app).get('/')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Server is running in DEVELOPMENT MODE ONLY!')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('environment')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('node')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('GET /health', () => {
    it('should return health check', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('environment')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('memory')
      expect(response.body).toHaveProperty('pid')
    })
  })

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/api')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('message', 'API information retrieved successfully')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('name')
      expect(response.body.data).toHaveProperty('version')
      expect(response.body.data).toHaveProperty('versions')
      expect(response.body.data.versions).toHaveProperty('v1')
      expect(response.body.data.versions).toHaveProperty('demo')
    })
  })

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const response = await request(app).get('/api/users')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('users')
      expect(response.body.data).toHaveProperty('pagination')
      expect(Array.isArray(response.body.data.users)).toBe(true)
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      }

      const response = await request(app)
        .post('/api/users')
        .send(userData)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('message', 'User created successfully')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user).toHaveProperty('name', userData.name)
      expect(response.body.data.user).toHaveProperty('email', userData.email)
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user).toHaveProperty('active', true)
    })

    it('should return error for missing data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Validation failed')
      expect(response.body).toHaveProperty('details')
      expect(Array.isArray(response.body.details)).toBe(true)
    })

    it('should return error for invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email'
      }

      const response = await request(app)
        .post('/api/users')
        .send(userData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Cannot GET /non-existent-route')
      expect(response.body).toHaveProperty('code', 'ROUTE_NOT_FOUND')
    })
  })
})
