import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

// Mock bcrypt
const bcryptMock = {
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}

// Mock Prisma client
const prismaMock = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  skill: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  postSkill: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  userSkill: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  level: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  pointsLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
}

// Mock modules
jest.mock('bcrypt', () => bcryptMock)

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  }
})

jest.mock('../middleware/rate-limit', () => ({
  generalRateLimiter: (req: Request, res: Response, next: NextFunction) => next(),
  authRateLimiter: (req: Request, res: Response, next: NextFunction) => next(),
  claimRateLimiter: (req: Request, res: Response, next: NextFunction) => next(),
  postCreationRateLimiter: (req: Request, res: Response, next: NextFunction) => next(),
}))

// Export mocks
export const prisma = prismaMock
export const bcrypt = bcryptMock
export { jwt }

// Helper to reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks()
}

describe('setup', () => {
  it('should load setup file', () => {
    expect(true).toBe(true)
  })
})
