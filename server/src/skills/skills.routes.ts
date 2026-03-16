import { Router } from 'express'
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} from './skills.controller'
import { updateSkillSchema } from './skills.validation'

const router = Router()

// Validation middleware using Zod
const validateCreateSkill = (req: any, res: any, next: any) => {
  try {
    createSkillSchema.parse(req.body)
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

const validateUpdateSkill = (req: any, res: any, next: any) => {
  try {
    // For updates, all fields are optional, so we need to check if body has any fields
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No update data provided' })
    }
    updateSkillSchema.parse(req.body)
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

// Public routes
router.get('/', getAllSkills)
router.get('/:id', getSkillById)

// Protected routes (require authentication - admin only in future)
router.post('/', createSkill) // Could add authenticate middleware later
router.put('/:id', validateUpdateSkill, updateSkill)
router.delete('/:id', deleteSkill)

export default router
