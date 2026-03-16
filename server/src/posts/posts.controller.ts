import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { CreatePostInput, UpdatePostInput } from './posts.validation'

const prisma = new PrismaClient()

// Extend Request to include user
export interface PostsRequest extends Request {
  user?: {
    id: number
    email: string
    username: string
  }
}

// GET all posts - with skill tags included
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
        postSkills: {
          include: {
            skill: true
          }
        }
      }
    })

    // Format the response to include skill_tags as array of skill objects
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      approved: post.approved,
      skill_tags: post.postSkills.map(ps => ps.skill)
    }))

    res.json({ posts: formattedPosts })
  } catch (error) {
    console.error('Get all posts error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const postId = parseInt(id)

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
        postSkills: {
          include: {
            skill: true
          }
        }
      }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      approved: post.approved,
      skill_tags: post.postSkills.map(ps => ps.skill)
    }

    res.json({ post: formattedPost })
  } catch (error) {
    console.error('Get post by ID error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST create new post
export const createPost = async (req: PostsRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const { title, content, skill_tags = [] }: CreatePostInput = req.body

    // Create post with authorId
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    // Award 10 points for creating a post
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: 10
        }
      }
    })

    // Log the points for post creation
    await prisma.pointsLog.create({
      data: {
        userId: userId,
        postId: post.id,
        points: 10,
        reason: 'Created post'
      }
    })

    // Handle skill tags - create PostSkill entries
    if (skill_tags.length > 0) {
      // Find or create skills and create post-skill relationships
      for (const skillId of skill_tags) {
        // Check if skill exists
        const skill = await prisma.skill.findUnique({
          where: { id: skillId }
        })
        
        if (skill) {
          // Create post-skill relationship
          await prisma.postSkill.upsert({
            where: {
              postId_skillId: {
                postId: post.id,
                skillId: skillId
              }
            },
            create: {
              postId: post.id,
              skillId: skillId
            },
            update: {}
          })
        }
      }
    }

    // Fetch updated post with skills and author
    const postWithSkills = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
        postSkills: {
          include: {
            skill: true
          }
        }
      }
    })

    const formattedPost = {
      id: postWithSkills!.id,
      title: postWithSkills!.title,
      content: postWithSkills!.content,
      authorId: postWithSkills!.authorId,
      author: postWithSkills!.author,
      createdAt: postWithSkills!.createdAt,
      updatedAt: postWithSkills!.updatedAt,
      approved: postWithSkills!.approved,
      skill_tags: postWithSkills!.postSkills.map(ps => ps.skill)
    }

    res.status(201).json({ 
      message: 'Post created successfully',
      post: formattedPost
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT update post
export const updatePost = async (req: PostsRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const { id } = req.params
    const postId = parseInt(id)
    const { title, content, skill_tags }: UpdatePostInput = req.body

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' })
    }

    // Update post fields
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title && { title }),
        ...(content && { content })
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    // Handle skill tags if provided
    if (skill_tags !== undefined) {
      // Delete all existing post-skill relationships
      await prisma.postSkill.deleteMany({
        where: { postId: postId }
      })

      // Create new post-skill relationships
      for (const skillId of skill_tags) {
        const skill = await prisma.skill.findUnique({
          where: { id: skillId }
        })
        
        if (skill) {
          await prisma.postSkill.upsert({
            where: {
              postId_skillId: {
                postId: postId,
                skillId: skillId
              }
            },
            create: {
              postId: postId,
              skillId: skillId
            },
            update: {}
          })
        }
      }
    }

     // Fetch updated post with skills and author
     const postWithSkills = await prisma.post.findUnique({
       where: { id: postId },
       include: {
         author: {
           select: {
             id: true,
             username: true
           }
         },
         postSkills: {
           include: {
             skill: true
           }
         }
       }
     })

    const formattedPost = {
      id: postWithSkills!.id,
      title: postWithSkills!.title,
      content: postWithSkills!.content,
      authorId: postWithSkills!.authorId,
      author: postWithSkills!.author,
      createdAt: postWithSkills!.createdAt,
      updatedAt: postWithSkills!.updatedAt,
      approved: postWithSkills!.approved,
      skill_tags: postWithSkills!.postSkills.map(ps => ps.skill)
    }

    res.json({ 
      message: 'Post updated successfully',
      post: formattedPost
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE post
export const deletePost = async (req: PostsRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const { id } = req.params
    const postId = parseInt(id)

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' })
    }

    // Delete post (cascades will handle postSkills)
    await prisma.post.delete({
      where: { id: postId }
    })

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT approve post (admin functionality - for now any authenticated user can approve)
export const approvePost = async (req: PostsRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const { id } = req.params
    const postId = parseInt(id)

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        postSkills: {
          include: {
            skill: true
          }
        }
      }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Check if already approved
    if (post.approved) {
      return res.status(400).json({ error: 'Post is already approved' })
    }

    // Approve the post
    const approvedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        approved: true
      }
    })

    // Assign skills to post author (if they don't already have them)
    // This grants the author the skills they've taught through this post
    if (post.postSkills.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const postSkill of post.postSkills) {
          const skillId = postSkill.skillId
          const authorId = post.authorId

          // Check if author already has this skill
          const existingUserSkill = await tx.userSkill.findUnique({
            where: {
              userId_skillId: {
                userId: authorId,
                skillId: skillId
              }
            }
          })

          // If author doesn't have this skill yet, assign it
          if (!existingUserSkill) {
            await tx.userSkill.create({
              data: {
                userId: authorId,
                skillId: skillId,
                sourcePostId: postId
              }
            })
          }
        }
      })
    }

    res.json({
      message: 'Post approved successfully and skills assigned to author',
      post: approvedPost
    })
  } catch (error) {
    console.error('Approve post error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

