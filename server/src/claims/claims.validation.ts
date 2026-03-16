import { z } from 'zod'

// Schema for validating claim skill request
// The postId and skillId come from URL params, but we can validate them
export const claimSkillSchema = z.object({
  postId: z.string().transform(val => parseInt(val, 10)),
  skillId: z.string().transform(val => parseInt(val, 10))
})

// Type inference
export type ClaimSkillInput = z.infer<typeof claimSkillSchema>
