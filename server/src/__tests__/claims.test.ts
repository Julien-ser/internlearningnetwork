import request from 'supertest'
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { app } from '../index'
import { prisma, resetMocks } from './setup'
import { User, PostSkill, UserSkill, PointsLog } from '@prisma/client'

interface TransactionPrisma {
  postSkill: { findUnique: jest.Mock };
  userSkill: { findUnique: jest.Mock; create: jest.Mock };
  user: { update: jest.Mock };
  pointsLog: { create: jest.Mock };
  $transaction: jest.Mock;
}

const mockClaimerUser = {
  id: 1,
  email: 'claimer@example.com',
  username: 'claimer'
} as User

const mockAuthorUser = {
  id: 2,
  email: 'author@example.com',
  username: 'author'
} as User

const mockAuthToken = 'mock-jwt-token'

interface AuthenticatedRequest extends Request {
  user?: User
}

// Mock the authenticate middleware BEFORE app loads
jest.mock('../auth/auth.middleware', () => ({
  authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    req.user = mockClaimerUser
    next()
  }
}))

describe('Claims Controller', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('POST /api/claims/posts/:postId/skills/:skillId/claim', () => {
    it('should claim skill successfully and award author 5 points', async () => {
      const postSkill = {
        postId: 1,
        skillId: 1,
        post: {
          id: 1,
          title: 'Test Post',
          authorId: mockAuthorUser.id
        }
      }

      prisma.postSkill.findUnique.mockResolvedValue(postSkill as unknown as PostSkill)
      prisma.userSkill.findUnique.mockResolvedValue(null)
      prisma.userSkill.create.mockResolvedValue({} as unknown as UserSkill)
      prisma.user.update.mockResolvedValue({} as unknown as User)
      prisma.pointsLog.create.mockResolvedValue({} as unknown as PointsLog)
      prisma.$transaction.mockImplementation(async (callback: (prisma: TransactionPrisma) => Promise<unknown>) => {
        return await callback(prisma as TransactionPrisma);
      });

      const response = await request(app)
        .post('/api/claims/posts/1/skills/1/claim')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(201)

      expect(response.body.message).toBe('Skill claimed successfully! Author awarded 5 points.')
      expect(response.body.skillId).toBe(1)
      expect(response.body.postId).toBe(1)
    })

    it('should return 400 if claiming from own post', async () => {
      const postSkill = {
        postId: 1,
        skillId: 1,
        post: {
          id: 1,
          title: 'Test Post',
          authorId: mockClaimerUser.id // Same as claimer
        }
      }

      prisma.postSkill.findUnique.mockResolvedValue(postSkill as any)

      const response = await request(app)
        .post('/api/claims/posts/1/skills/1/claim')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(400)

      expect(response.body.error).toBe('Cannot claim skill from your own post')
    })

    it('should return 400 if user already has the skill', async () => {
      const postSkill = {
        postId: 1,
        skillId: 1,
        post: {
          id: 1,
          title: 'Test Post',
          authorId: mockAuthorUser.id
        }
      }

      prisma.postSkill.findUnique.mockResolvedValue(postSkill as any)
      prisma.userSkill.findUnique.mockResolvedValue({} as any) // User already has skill

      const response = await request(app)
        .post('/api/claims/posts/1/skills/1/claim')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(400)

      expect(response.body.error).toBe('You already have this skill')
    })

    it('should return 404 if skill not found on post', async () => {
      prisma.postSkill.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/claims/posts/999/skills/999/claim')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404)

      expect(response.body.error).toBe('Skill not found on this post')
    })

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/claims/posts/1/skills/1/claim')
        .expect(401)

      expect(response.body.error).toBe('No token provided')
    })
  })

  describe('GET /api/claims/user/skills', () => {
    it('should get user\'s claimed skills', async () => {
      const userSkills = [
        {
          userId: mockClaimerUser.id,
          skillId: 1,
          claimedAt: new Date(),
          skill: { id: 1, name: 'TypeScript' },
          sourcePost: { id: 1, title: 'Post 1' }
        }
      ]

      prisma.userSkill.findMany.mockResolvedValue(userSkills as any)

      const response = await request(app)
        .get('/api/claims/user/skills')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.userSkills).toHaveLength(1)
      expect(response.body.userSkills[0].skill.name).toBe('TypeScript')
    })

    it('should return empty array if user has no claimed skills', async () => {
      prisma.userSkill.findMany.mockResolvedValue([])

      const response = await request(app)
        .get('/api/claims/user/skills')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.userSkills).toEqual([])
    })

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/claims/user/skills')
        .expect(401)

      expect(response.body.error).toBe('No token provided')
    })
  })
})
