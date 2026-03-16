import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Use SQLite in-memory database for tests
const prisma = new PrismaClient()

beforeAll(async () => {
  // For testing, we'll use a different approach - we'll mock the database
  // Actually, let's use a simpler approach with test doubles
})

afterAll(async () => {
  await prisma.$disconnect()
})

export { prisma, jwt }
