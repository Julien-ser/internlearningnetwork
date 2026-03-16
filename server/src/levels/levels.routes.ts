import { Router } from 'express'
import { getUserLevel, calculateLevelEndpoint, updateUserLevel } from './levels.controller'

const router = Router()

/**
 * @route GET /api/level
 * @desc  Get user's current level information
 * @access Public (userId query param required)
 */
router.get('/', getUserLevel)

/**
 * @route POST /api/level/calculate
 * @desc  Calculate level for given points
 * @access Public
 */
router.post('/calculate', calculateLevelEndpoint)

/**
 * @route POST /api/level/update
 * @desc  Update user's level based on current points
 * @access Public (userId query param required)
 */
router.post('/update', updateUserLevel)

export default router
