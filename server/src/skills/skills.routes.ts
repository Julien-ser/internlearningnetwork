import { Router, Request, Response, NextFunction } from 'express'
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} from './skills.controller'
import { createSkillSchema, updateSkillSchema } from './skills.validation'
import { authenticate } from '../auth/auth.middleware'

const router = Router()

// Validation middleware using Zod
const validateCreateSkill = (req: Request, res: Response, next: NextFunction) => {
   try {
     createSkillSchema.parse(req.body)
     next()
   } catch (error: unknown) {
     if (error instanceof Error) {
       return res.status(400).json({
         error: 'Validation failed',
         details: error.message
       })
     }
     res.status(400).json({ error: 'Validation failed' })
   }
 }

const validateUpdateSkill = (req: Request, res: Response, next: NextFunction) => {
   try {
     // For updates, all fields are optional, so we need to check if body has any fields
     if (Object.keys(req.body).length === 0) {
       return res.status(400).json({ error: 'No update data provided' })
     }
     updateSkillSchema.parse(req.body)
     next()
   } catch (error: unknown) {
     if (error instanceof Error) {
       return res.status(400).json({
         error: 'Validation failed',
         details: error.message
       })
     }
     res.status(400).json({ error: 'Validation failed' })
   }
 }

// Public routes
router.get('/', getAllSkills)
router.get('/:id', getSkillById)

// Protected routes (require authentication - admin only in future)
router.post('/', authenticate, validateCreateSkill, createSkill)
router.put('/:id', authenticate, validateUpdateSkill, updateSkill)
router.delete('/:id', authenticate, deleteSkill)

export default router
