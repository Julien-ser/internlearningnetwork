import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Calculate level based on total points using exponential thresholds
 * Levels 1-10 with formula: base * (multiplier ^ (level - 1))
 * Base: 100, Multiplier: 1.5
 * L1: 0-99, L2: 100-149, L3: 150-224, L4: 225-336, L5: 337-505,
 * L6: 506-758, L7: 759-1138, L8: 1139-1707, L9: 1708-2561, L10: 2562+
 */
const calculateLevel = (points: number): number => {
  if (points < 0) return 1

  const base = 100
  const multiplier = 1.5

  for (let level = 1; level <= 10; level++) {
    const minPoints = level === 1 ? 0 : Math.floor(base * Math.pow(multiplier, level - 2))
    const maxPoints = level === 10 ? Infinity : Math.floor(base * Math.pow(multiplier, level - 1)) - 1

    if (points >= minPoints && points <= maxPoints) {
      return level
    }
  }

  return 10 // Cap at level 10 for now
}

/**
 * GET /api/level
 * Get the user's current level information based on their total points
 * Requires authentication
 */
export const getUserLevel = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        totalPoints: true,
        level: {
          select: {
            levelNumber: true,
            name: true,
            minPoints: true,
            maxPoints: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const calculatedLevel = calculateLevel(user.totalPoints)

    // Check if user's assigned level matches calculation
    const levelInfo = user.level || {
      levelNumber: calculatedLevel,
      name: `Level ${calculatedLevel}`,
      minPoints: calculatedLevel === 1 ? 0 : Math.floor(100 * Math.pow(1.5, calculatedLevel - 2)),
      maxPoints: calculatedLevel === 10 ? null : Math.floor(100 * Math.pow(1.5, calculatedLevel - 1)) - 1
    }

    res.json({
      userId,
      totalPoints: user.totalPoints,
      currentLevel: levelInfo.levelNumber,
      levelName: levelInfo.name,
      minPoints: levelInfo.minPoints,
      maxPoints: levelInfo.maxPoints,
      pointsToNextLevel: levelInfo.maxPoints ? levelInfo.maxPoints - user.totalPoints + 1 : null
    })
  } catch (error) {
    console.error('Get user level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * POST /api/level/calculate
 * Calculate what level a given point total would be
 */
export const calculateLevelEndpoint = async (req: Request, res: Response) => {
  try {
    const { points } = req.body

    if (points === undefined) {
      return res.status(400).json({ error: 'points is required' })
    }

    const level = calculateLevel(points)

    const minPoints = level === 1 ? 0 : Math.floor(100 * Math.pow(1.5, level - 2))
    const maxPoints = level === 10 ? null : Math.floor(100 * Math.pow(1.5, level - 1)) - 1

    res.json({
      points,
      level,
      levelName: `Level ${level}`,
      minPoints,
      maxPoints,
      pointsToNextLevel: maxPoints ? maxPoints - points + 1 : null
    })
  } catch (error) {
    console.error('Calculate level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Update user's level based on their current totalPoints
 * Called after point allocations to keep level in sync
 */
export const updateUserLevel = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        totalPoints: true,
        levelId: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const calculatedLevel = calculateLevel(user.totalPoints)

    // Only update if level has changed
    if (user.levelId !== calculatedLevel) {
      // Find or create the Level record
      const levelRecord = await prisma.level.findUnique({
        where: { levelNumber: calculatedLevel }
      })

      if (!levelRecord) {
        // Create the level with calculated thresholds
        const minPoints = calculatedLevel === 1 ? 0 : Math.floor(100 * Math.pow(1.5, calculatedLevel - 2))
        const maxPoints = calculatedLevel === 10 ? null : Math.floor(100 * Math.pow(1.5, calculatedLevel - 1)) - 1

        const newLevel = await prisma.level.create({
          data: {
            levelNumber: calculatedLevel,
            minPoints,
            maxPoints,
            name: `Level ${calculatedLevel}`
          }
        })

        await prisma.user.update({
          where: { id: Number(userId) },
          data: { levelId: newLevel.id }
        })
      } else {
        await prisma.user.update({
          where: { id: Number(userId) },
          data: { levelId: levelRecord.id }
        })
      }
    }

    // Return updated level info
    const updatedUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        totalPoints: true,
        level: {
          select: {
            levelNumber: true,
            name: true,
            minPoints: true,
            maxPoints: true
          }
        }
      }
    })

    res.json({
      userId,
      totalPoints: updatedUser?.totalPoints,
      currentLevel: updatedUser?.level.levelNumber,
      levelName: updatedUser?.level.name,
      message: 'Level updated successfully'
    })
  } catch (error) {
    console.error('Update user level error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
