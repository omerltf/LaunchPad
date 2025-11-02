const request = require('supertest')
const app = require('../src/app')

describe('Maintenance Mode API', () => {
  describe('GET /maintenance', () => {
    it('should return current maintenance status', async () => {
      const response = await request(app).get('/maintenance')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('maintenanceMode')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('lastModified')
      expect(response.body).toHaveProperty('timestamp')
      expect(typeof response.body.maintenanceMode).toBe('boolean')
    })
  })

  describe('POST /maintenance/toggle', () => {
    it('should toggle maintenance mode on', async () => {
      const response = await request(app)
        .post('/maintenance/toggle')
        .send({
          message: 'Test maintenance message',
          modifiedBy: 'test-admin'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('maintenanceMode')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('actionMessage')
      expect(response.body).toHaveProperty('lastModified')
      expect(response.body).toHaveProperty('modifiedBy', 'test-admin')
      expect(response.body).toHaveProperty('timestamp')
    })

    it('should toggle maintenance mode off', async () => {
      // First enable it
      await request(app)
        .post('/maintenance/toggle')
        .send({ message: 'Enabling maintenance', modifiedBy: 'test-admin' })

      // Then disable it
      const response = await request(app)
        .post('/maintenance/toggle')
        .send({ modifiedBy: 'test-admin' })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('maintenanceMode')
      expect(response.body).toHaveProperty('actionMessage')
    })

    it('should work without optional parameters', async () => {
      const response = await request(app)
        .post('/maintenance/toggle')
        .send({})

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('maintenanceMode')
      expect(response.body).toHaveProperty('modifiedBy')
    })
  })

  describe('PUT /maintenance/message', () => {
    it('should update maintenance message', async () => {
      const newMessage = 'Updated maintenance message'
      const response = await request(app)
        .put('/maintenance/message')
        .send({
          message: newMessage,
          modifiedBy: 'test-admin'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', newMessage)
      expect(response.body).toHaveProperty('modifiedBy', 'test-admin')
      expect(response.body).toHaveProperty('lastModified')
    })

    it('should return error when message is missing', async () => {
      const response = await request(app)
        .put('/maintenance/message')
        .send({ modifiedBy: 'test-admin' })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Message is required')
      expect(response.body).toHaveProperty('code', 'MISSING_MESSAGE')
    })

    it('should return error for empty message', async () => {
      const response = await request(app)
        .put('/maintenance/message')
        .send({ message: '', modifiedBy: 'test-admin' })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Message is required')
    })
  })

  describe('GET /maintenance/history', () => {
    it('should return maintenance history', async () => {
      const response = await request(app).get('/maintenance/history')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('history')
      expect(response.body).toHaveProperty('count')
      expect(response.body).toHaveProperty('timestamp')
      expect(Array.isArray(response.body.history)).toBe(true)
    })

    it('should respect limit query parameter', async () => {
      const limit = 5
      const response = await request(app)
        .get('/maintenance/history')
        .query({ limit })

      expect(response.status).toBe(200)
      expect(response.body.history.length).toBeLessThanOrEqual(limit)
    })

    it('should use default limit when not specified', async () => {
      const response = await request(app).get('/maintenance/history')

      expect(response.status).toBe(200)
      expect(response.body.history.length).toBeLessThanOrEqual(10)
    })
  })
})
