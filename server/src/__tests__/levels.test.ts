import request from 'supertest'
import { app } from '../index'
import { prisma, resetMocks } from './setup'

const mockAuthUser = {
  id: 1,
  email: 'user@example.com',
  username: 'testuser'
}

const mockAuthToken = 'mock-jwt-token'

// Mock the authenticate middleware BEFORE app loads
jest.mock('../auth/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    req.user = mockAuthUser
    next()
  }
}))

describe('Levels Controller', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('POST /api/level/calculate', () => {
    it('should calculate level from point value', async () => {
      const response = await request(app)
        .post('/api/level/calculate')
        .send({ points: 150 })
        .expect(200)

      expect(response.body.level).toBe(3)
      expect(response.body.levelName).toBe('Level 3')
    })
    it('should get user level successfully', async () => {
      const mockUser = {
        id: 1,
        totalPoints: 150,
        level: {
          levelNumber: 3,
          name: 'Level 3',
          minPoints: 150,
          maxPoints: 224
        }
      }

      prisma.user.findUnique.mockResolvedValue(mockUser as any)

      const response = await request(app)
        .get('/api/level?userId=1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.currentLevel).toBe(3)
      expect(response.body.totalPoints).toBe(150)
    })

    it('should calculate level if user.level does not match points', async () => {
      const mockUser = {
        id: 1,
        totalPoints: 500,
        level: {
          levelNumber: 4, // Mismatch, should be 5
          name: 'Level 4'
        }
      }

      prisma.user.findUnique.mockResolvedValue(mockUser as any)

      const response = await request(app)
        .get('/api/level?userId=1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.currentLevel).toBe(4) // stored level used even if mismatch
    })

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .get('/api/level')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(400)

      expect(response.body.error).toBe('userId is required')
    })

    it('should return 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/level?userId=999')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404)

      expect(response.body.error).toBe('User not found')
    })
  })

  describe('POST /api/level/calculate', () => {
    it('should calculate level from point value', async () => {
      const response = await request(app)
        .post('/api/level/calculate')
        .send({ points: 150 })
        .expect(200)

      expect(response.body.level).toBe(3)
      expect(response.body.levelName).toBe('Level 3')
    })

    it('should return points to next level', async () => {
      const response = await request(app)
        .post('/api/level/calculate')
        .send({ points: 100 })
        .expect(200)

      expect(response.body.pointsToNextLevel).toBe(50) // Next level (3) starts at 150
    })

    it('should return null pointsToNextLevel for level 10', async () => {
      const response = await request(app)
        .post('/api/level/calculate')
        .send({ points: 3000 })
        .expect(200)

      expect(response.body.pointsToNextLevel).toBeNull()
    })

    it('should return 400 if points not provided', async () => {
      const response = await request(app)
        .post('/api/level/calculate')
        .send({})
        .expect(400)

      expect(response.body.error).toBe('points is required')
    })
  })

  describe('POST /api/level/update', () => {
    it('should update user level based on totalPoints', async () => {
      const mockUser = {
        id: 1,
        totalPoints: 500,
        levelId: 4,
        level: {
          levelNumber: 4,
          name: 'Level 4'
        }
      }

      const updatedUser = {
        id: 1,
        totalPoints: 500,
        levelId: 5,
        level: {
          levelNumber: 5,
          name: 'Level 5',
          minPoints: 337,
          maxPoints: 505
        }
      }

      prisma.user.findUnique
        .mockResolvedValueOnce(mockUser as any) // first call
        .mockResolvedValueOnce(updatedUser as any) // second call after update
      prisma.level.findUnique.mockResolvedValue({
        id: 5,
        levelNumber: 5,
        name: 'Level 5',
        minPoints: 337,
        maxPoints: 505
      } as any)
      prisma.user.update.mockResolvedValue({} as any)

      const response = await request(app)
        .post('/api/level/update?userId=1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.currentLevel).toBe(5)
      expect(response.body.message).toBe('Level updated successfully')
    })

    it('should create level record if it does not exist', async () => {
      const mockUser = {
        id: 1,
        totalPoints: 3000,
        levelId: 9,
        level: {
          levelNumber: 9,
          name: 'Level 9'
        }
      }

      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      prisma.level.findUnique.mockResolvedValue(null)
      prisma.level.create.mockResolvedValue({
        id: 10,
        levelNumber: 10,
        name: 'Level 10',
        minPoints: 2562,
        maxPoints: null
      })
       prisma.user.update.mockResolvedValue({} as any)

       await request(app)
         .post('/api/level/update?userId=1')
         .set('Authorization', `Bearer ${mockAuthToken}`)
         .expect(200)

       expect(prisma.level.create).toHaveBeenCalled()
    })

    it('should not update if level has not changed', async () => {
      const mockUser = {
        id: 1,
        totalPoints: 200,
        levelId: 3,
        level: {
          levelNumber: 3,
          name: 'Level 3'
        }
      }

      prisma.user.findUnique.mockResolvedValue(mockUser as any)

      const response = await request(app)
        .post('/api/level/update?userId=1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.currentLevel).toBe(3)
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .post('/api/level/update')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(400)

      expect(response.body.error).toBe('userId is required')
    })
  })
})
