import request from 'supertest'
import { app } from '../index'
import { prisma, resetMocks } from './setup'

// Mock auth user constant
const mockAuthUser = {
  id: 1,
  email: 'author@example.com',
  username: 'author'
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

describe('Posts Controller', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('GET /api/posts', () => {
    it('should get all posts with skills', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          authorId: 1,
          author: { id: 1, username: 'author' },
          createdAt: new Date(),
          updatedAt: new Date(),
          approved: false,
          postSkills: [
            { skill: { id: 1, name: 'TypeScript' } },
            { skill: { id: 2, name: 'React' } }
          ]
        }
      ]

      prisma.post.findMany.mockResolvedValue(mockPosts as any)

      const response = await request(app)
        .get('/api/posts')
        .expect(200)

      expect(response.body.posts).toHaveLength(1)
      expect(response.body.posts[0].skill_tags).toHaveLength(2)
    })

    it('should return empty array when no posts exist', async () => {
      prisma.post.findMany.mockResolvedValue([])

      const response = await request(app)
        .get('/api/posts')
        .expect(200)

      expect(response.body.posts).toEqual([])
    })
  })

  describe('GET /api/posts/:id', () => {
    it('should get a single post by ID', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        authorId: 1,
        author: { id: 1, username: 'author' },
        createdAt: new Date(),
        updatedAt: new Date(),
        approved: false,
        postSkills: [
          { skill: { id: 1, name: 'Node.js' } }
        ]
      }

      prisma.post.findUnique.mockResolvedValue(mockPost as any)

      const response = await request(app)
        .get('/api/posts/1')
        .expect(200)

      expect(response.body.post.id).toBe(1)
      expect(response.body.post.title).toBe('Test Post')
    })

    it('should return 404 if post not found', async () => {
      prisma.post.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/posts/999')
        .expect(404)

      expect(response.body.error).toBe('Post not found')
    })
  })

  describe('POST /api/posts', () => {
    it('should create a new post with skill tags', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New content',
        skill_tags: [1, 2]
      }

      const createdPost = {
        id: 1,
        title: newPost.title,
        content: newPost.content,
        authorId: mockAuthUser.id,
        author: { id: mockAuthUser.id, username: mockAuthUser.username },
        createdAt: new Date(),
        updatedAt: new Date(),
        approved: false,
        postSkills: [
          { skill: { id: 1, name: 'Skill1' } },
          { skill: { id: 2, name: 'Skill2' } }
        ]
      }

      prisma.post.create.mockResolvedValue(createdPost as any)
      prisma.post.findUnique.mockResolvedValue(createdPost as any)
      prisma.skill.findUnique.mockResolvedValue({ id: 1, name: 'Skill1' } as any)
      prisma.postSkill.upsert.mockResolvedValue({} as any)
      prisma.user.update.mockResolvedValue({} as any)
      prisma.pointsLog.create.mockResolvedValue({} as any)

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(newPost)
        .expect(201)

      expect(response.body.message).toBe('Post created successfully')
      expect(response.body.post.title).toBe(newPost.title)
    })

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ content: 'Content only' })
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })

    it('should return 400 if content is missing', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ title: 'Title only' })
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })

    it('should award 10 points for creating post', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New content',
      }

      const createdPost = {
        id: 1,
        title: newPost.title,
        content: newPost.content,
        authorId: mockAuthUser.id,
        author: { id: mockAuthUser.id, username: mockAuthUser.username },
        createdAt: new Date(),
        updatedAt: new Date(),
        approved: false,
        postSkills: []
      }

      prisma.post.create.mockResolvedValue(createdPost as any)
      prisma.post.findUnique.mockResolvedValue(createdPost as any)
      prisma.user.update.mockResolvedValue({} as any)
      prisma.pointsLog.create.mockResolvedValue({} as any)

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(newPost)

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { totalPoints: { increment: 10 } }
        })
      )
    })

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'Test', content: 'Content' })
        .expect(401)

      expect(response.body.error).toBe('No token provided')
    })
  })

  describe('PUT /api/posts/:id', () => {
    it('should update post successfully as author', async () => {
      const existingPost = {
        id: 1,
        title: 'Original Title',
        content: 'Original content',
        authorId: mockAuthUser.id,
        approved: false,
      }

      const updatedPost = {
        id: 1,
        title: 'Updated Title',
        content: 'Updated content',
        authorId: mockAuthUser.id,
        author: { id: mockAuthUser.id, username: mockAuthUser.username },
        createdAt: new Date(),
        updatedAt: new Date(),
        approved: false,
        postSkills: []
      }

      prisma.post.findUnique.mockResolvedValue(existingPost as any)
      prisma.post.update.mockResolvedValue(updatedPost as any)
      prisma.post.findUnique.mockResolvedValue(updatedPost as any)
      prisma.postSkill.deleteMany.mockResolvedValue({} as any)

      const response = await request(app)
        .put('/api/posts/1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ title: 'Updated Title', content: 'Updated content' })
        .expect(200)

      expect(response.body.message).toBe('Post updated successfully')
    })

    it('should return 400 for empty update body', async () => {
      const response = await request(app)
        .put('/api/posts/1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({})
        .expect(400)

      expect(response.body.error).toBe('No update data provided')
    })

    it('should return 400 if title exceeds max length', async () => {
      const response = await request(app)
        .put('/api/posts/1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ title: 'A'.repeat(201) })
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })

    it('should return 403 if user is not the author', async () => {
      const existingPost = {
        id: 1,
        title: 'Original Title',
        content: 'Original content',
        authorId: 999, // Different user
        approved: false,
      }

      prisma.post.findUnique.mockResolvedValue(existingPost as any)

      const response = await request(app)
        .put('/api/posts/1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send({ title: 'Updated Title' })
        .expect(403)

      expect(response.body.error).toBe('Not authorized to update this post')
    })
  })

  describe('DELETE /api/posts/:id', () => {
    it('should delete post successfully as author', async () => {
      const existingPost = {
        id: 1,
        title: 'To Delete',
        authorId: mockAuthUser.id,
      }

      prisma.post.findUnique.mockResolvedValue(existingPost as any)
      prisma.post.delete.mockResolvedValue({} as any)

      const response = await request(app)
        .delete('/api/posts/1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.message).toBe('Post deleted successfully')
    })

    it('should return 404 if post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/posts/999')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404)

      expect(response.body.error).toBe('Post not found')
    })
  })

  describe('PUT /api/posts/:id/approve', () => {
    it('should approve post and assign skills to author', async () => {
      const post = {
        id: 1,
        authorId: 2,
        approved: false,
        postSkills: [
          { skillId: 1, skill: { id: 1, name: 'Skill1' } }
        ]
      }

      prisma.post.findUnique.mockResolvedValue(post as any)
      prisma.post.update.mockResolvedValue({ id: 1, approved: true } as any)
      prisma.userSkill.findUnique.mockResolvedValue(null)
      prisma.userSkill.create.mockResolvedValue({} as any)
      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(prisma);
      });

      const response = await request(app)
        .put('/api/posts/1/approve')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200)

      expect(response.body.message).toContain('Post approved successfully')
    })

    it('should return 400 if post is already approved', async () => {
      const post = {
        id: 1,
        authorId: 2,
        approved: true,
        postSkills: []
      }

      prisma.post.findUnique.mockResolvedValue(post as any)

      const response = await request(app)
        .put('/api/posts/1/approve')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(400)

      expect(response.body.error).toBe('Post is already approved')
    })
  })
})
