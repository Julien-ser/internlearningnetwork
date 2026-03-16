import { z } from 'zod'

// Schema for user registration
export const registerSchema = z.object({
  email: z.string({ required_error: 'Email, username, and password are required' }).email('Invalid email address'),
  username: z.string({ required_error: 'Email, username, and password are required' }).min(1, 'Email, username, and password are required').max(50, 'Username is too long'),
  password: z.string({ required_error: 'Email, username, and password are required' }).min(6, 'Password must be at least 6 characters long')
})

// Schema for user login
export const loginSchema = z.object({
  email: z.string({ required_error: 'Email and password are required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Email and password are required' })
})

// Type inference
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
