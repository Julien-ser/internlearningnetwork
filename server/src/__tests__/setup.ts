import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Mock bcrypt
const bcryptMock = {
  hash: jest.fn().mockResolvedValue('hashed_password' as any),
  compare: jest.fn().mockResolvedValue(true as any),
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

// Export mocks
export const prisma = prismaMock as any
export const bcrypt = bcryptMock
export { jwt }

// Helper to reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks()
}
