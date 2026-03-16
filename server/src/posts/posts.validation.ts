import { z } from 'zod'

// Schema for creating a post
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  skill_tags: z.array(z.number()).optional().default([]) // Array of skill IDs
})

// Schema for updating a post
export const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  skill_tags: z.array(z.number()).optional()
})

// Type inference
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
