import { Router } from 'express'
import { register, login, getProfile } from './auth.controller'
import { authenticate } from './auth.middleware'
import { validate } from '../middleware/validation'
import { registerSchema, loginSchema } from './auth.validation'
import { authRateLimiter } from '../middleware/rate-limit'

const router = Router()

router.post('/register', authRateLimiter, validate(registerSchema), register)
router.post('/login', authRateLimiter, validate(loginSchema), login)
router.get('/me', authenticate, getProfile)

export default router