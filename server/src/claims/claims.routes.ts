import { Router } from 'express'
import { claimSkill, getUserSkills } from './claims.controller'
import { authenticate } from '../auth/auth.middleware'
import { validate } from '../middleware/validation'
import { claimSkillSchema } from './claims.validation'
import { claimRateLimiter } from '../middleware/rate-limit'

const router = Router()

// All claim routes require authentication
router.post('/posts/:postId/skills/:skillId/claim', authenticate, claimRateLimiter, validate(claimSkillSchema, { source: 'params' }), claimSkill)
router.get('/user/skills', authenticate, getUserSkills)

export default router
