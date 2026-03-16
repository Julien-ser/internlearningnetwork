import request from 'supertest'
import { jwt } from './setup'

// Mock auth middleware before importing app
const mockAuthUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser'
}

jest.mock('../auth/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.slice(7)
    if (token === 'invalidtoken') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.user = mockAuthUser
    next()
  }
}))

import { app } from '../index'
import { prisma, resetMocks } from './setup'

describe('Auth Controller', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }

      const mockUser = {
        id: 1,
        email: newUser.email,
        username: newUser.username,
        createdAt: new Date(),
        totalPoints: 0,
      }

      prisma.user.findFirst.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue(mockUser as any)

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201)

      expect(response.body.message).toBe('User registered successfully')
      expect(response.body.user).toMatchObject({
        id: 1,
        email: newUser.email,
        username: newUser.username,
      })
      expect(response.body.token).toBeDefined()
    })

    it('should return 400 if email, username, or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(response.body.error).toBe('Email, username, and password are required')
    })

    it('should return 400 if password is less than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: '12345'
        })
        .expect(400)

      expect(response.body.error).toBe('Password must be at least 6 characters long')
    })

    it('should return 409 if user with email already exists', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        username: 'existinguser',
      }

      prisma.user.findFirst.mockResolvedValue(existingUser as any)

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'newuser',
          password: 'password123'
        })
        .expect(409)

      expect(response.body.error).toBe('User with this email or username already exists')
    })
  })

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr...' // Mock bcrypt hash
      const user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        createdAt: new Date(),
      }

      prisma.user.findUnique.mockResolvedValue(user as any)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)

      expect(response.body.message).toBe('Login successful')
      expect(response.body.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      })
      expect(response.body.token).toBeDefined()
    })

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(response.body.error).toBe('Email and password are required')
    })

    it('should return 401 if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401)

      expect(response.body.error).toBe('Invalid credentials')
    })
  })

  describe('GET /auth/me', () => {
    it('should get user profile with valid token', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })

      const token = loginResponse.body.token

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        totalPoints: 100,
        level: {
          levelNumber: 2,
          name: 'Level 2'
        },
        userSkills: [],
        pointsLog: []
      }

      prisma.user.findUnique.mockResolvedValue(mockUser as any)

       const response = await request(app)
         .get('/api/auth/me')
         .set('Authorization', `Bearer ${token}`)
         .expect(200)

      expect(response.body.user).toBeDefined()
      expect(response.body.user.id).toBe(1)
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body.error).toBe('No token provided')
    })

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)

      expect(response.body.error).toBe('Invalid token')
    })
  })
})
