import request from 'supertest'
import { app } from '../index'
import { prisma, resetMocks } from './setup'

describe('Skills Controller', () => {
  beforeEach(() => {
    resetMocks()
  })

  const mockAuthUser = {
    id: 1,
    email: 'user@example.com',
    username: 'testuser'
  }

  const mockAuthToken = 'mock-jwt-token'

  // Mock the authenticate middleware
  beforeAll(() => {
    const authMiddleware = require('../auth/auth.middleware')
    jest.spyOn(authMiddleware, 'authenticate').mockImplementation((req: any, res: any, next: any) => {
      req.user = mockAuthUser
      next()
    })
  })

  describe('GET /api/skills', () => {
    it('should get all skills', async () => {
      const mockSkills = [
        { id: 1, name: 'TypeScript', description: 'TypeScript language' },
        { id: 2, name: 'React', description: 'React framework' }
      ]

      prisma.skill.findMany.mockResolvedValue(mockSkills as any)

      const response = await request(app)
        .get('/api/skills')
        .expect(200)

      expect(response.body.skills).toHaveLength(2)
    })

    it('should return empty array when no skills exist', async () => {
      prisma.skill.findMany.mockResolvedValue([])

      const response = await request(app)
        .get('/api/skills')
        .expect(200)

      expect(response.body.skills).toEqual([])
    })
  })

  describe('GET /api/skills/:id', () => {
    it('should get a single skill by ID', async () => {
      const mockSkill = {
        id: 1,
        name: 'TypeScript',
        description: 'TypeScript language',
        postSkills: [
          { post: { id: 1, title: 'Post 1', author: { username: 'user1' } } }
        ],
        userSkills: [
          { user: { id: 2, username: 'user2' } }
        ]
      }

      prisma.skill.findUnique.mockResolvedValue(mockSkill as any)

      const response = await request(app)
        .get('/api/skills/1')
        .expect(200)

      expect(response.body.skill.name).toBe('TypeScript')
    })

    it('should return 404 if skill not found', async () => {
      prisma.skill.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/skills/999')
        .expect(404)

      expect(response.body.error).toBe('Skill not found')
    })
  })

  describe('POST /api/skills', () => {
    it('should create a new skill', async () => {
      const newSkill = {
        name: 'New Skill',
        description: 'A new skill'
      }

      const createdSkill = {
        id: 1,
        name: newSkill.name,
        description: newSkill.description
      }

      prisma.skill.findUnique.mockResolvedValue(null)
      prisma.skill.create.mockResolvedValue(createdSkill as any)

      const response = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(newSkill)
        .expect(201)

      expect(response.body.message).toBe('Skill created successfully')
      expect(response.body.skill.name).toBe(newSkill.name)
    })

    it('should return 400 if skill with same name exists', async () => {
      const existingSkill = { id: 1, name: 'Existing Skill' }
      prisma.skill.findUnique.mockResolvedValue(existingSkill as any)

      const response = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ name: 'Existing Skill', description: 'Test' })
        .expect(400)

      expect(response.body.error).toBe('Skill with this name already exists')
    })

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/skills')
        .send({ name: 'Test Skill' })
        .expect(401)

      expect(response.body.error).toBe('No token provided')
    })
  })

  describe('PUT /api/skills/:id', () => {
    it('should update skill successfully', async () => {
      const existingSkill = {
        id: 1,
        name: 'Old Name',
        description: 'Old description'
      }

      prisma.skill.findUnique.mockResolvedValue(existingSkill as any)
      prisma.skill.create.mockResolvedValue(null) // For duplicate check
      prisma.skill.update.mockResolvedValue({
        ...existingSkill,
        name: 'Updated Name',
        description: 'Updated description'
      } as any)

      const response = await request(app)
        .put('/api/skills/1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ name: 'Updated Name', description: 'Updated description' })
        .expect(200)

      expect(response.body.message).toBe('Skill updated successfully')
    })

    it('should return 404 if skill not found', async () => {
      prisma.skill.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .put('/api/skills/999')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ name: 'Test' })
        .expect(404)

      expect(response.body.error).toBe('Skill not found')
    })
  })

  describe('DELETE /api/skills/:id', () => {
    it('should delete skill successfully', async () => {
      const existingSkill = { id: 1, name: 'To Delete' }
      prisma.skill.findUnique.mockResolvedValue(existingSkill as any)
      prisma.skill.delete.mockResolvedValue({} as any)

      const response = await request(app)
        .delete('/api/skills/1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.message).toBe('Skill deleted successfully')
    })

    it('should return 404 if skill not found', async () => {
      prisma.skill.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/skills/999')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404)

      expect(response.body.error).toBe('Skill not found')
    })
  })
})
