import { z } from 'zod'

// Schema for user registration
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  username: z.string().min(1, 'Username is required').max(50, 'Username is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

// Schema for user login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
})

// Type inference
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
