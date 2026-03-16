import { Router } from 'express'
import { 
  getAllPosts, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost,
  approvePost
} from './posts.controller'
import { authenticate } from '../auth/auth.middleware'
import { createPostSchema, updatePostSchema } from './posts.validation'

const router = Router()

// Validation middleware using Zod
const validateCreatePost = (req: any, res: any, next: any) => {
  try {
    createPostSchema.parse(req.body)
    next()
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.message 
      })
    }
    res.status(400).json({ error: 'Validation failed' })
  }
}

const validateUpdatePost = (req: any, res: any, next: any) => {
  try {
    // For updates, all fields are optional, so we need to check if body has any fields
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No update data provided' })
    }
    updatePostSchema.parse(req.body)
    next()
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.message 
      })
    }
    res.status(400).json({ error: 'Validation failed' })
  }
}

// Public routes (no authentication required for reading)
router.get('/', getAllPosts)
router.get('/:id', getPostById)

// Protected routes (require authentication)
router.post('/', authenticate, validateCreatePost, createPost)
router.put('/:id', authenticate, validateUpdatePost, updatePost)
router.delete('/:id', authenticate, deletePost)

// Approve post endpoint (assigns skills to author)
router.put('/:id/approve', authenticate, approvePost)

export default router
