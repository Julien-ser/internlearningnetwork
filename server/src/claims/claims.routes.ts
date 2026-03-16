import { Router } from 'express'
import { claimSkill, getUserSkills } from './claims.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router()

// All claim routes require authentication
router.post('/posts/:postId/skills/:skillId/claim', authenticate, claimSkill)
router.get('/user/skills', authenticate, getUserSkills)

export default router
