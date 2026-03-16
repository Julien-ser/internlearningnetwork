"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSkills = exports.claimSkill = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// POST claim a skill from a post
const claimSkill = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { postId, skillId } = req.params;
        const postIdNum = parseInt(postId);
        const skillIdNum = parseInt(skillId);
        // Validate that the post exists and has this skill
        const postSkill = await prisma.postSkill.findUnique({
            where: {
                postId_skillId: {
                    postId: postIdNum,
                    skillId: skillIdNum
                }
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        authorId: true
                    }
                }
            }
        });
        if (!postSkill) {
            return res.status(404).json({ error: 'Skill not found on this post' });
        }
        // Check if user is trying to claim from their own post
        if (postSkill.post.authorId === userId) {
            return res.status(400).json({ error: 'Cannot claim skill from your own post' });
        }
        // Check if user already has this skill (from any source)
        const existingUserSkill = await prisma.userSkill.findUnique({
            where: {
                userId_skillId: {
                    userId: userId,
                    skillId: skillIdNum
                }
            }
        });
        if (existingUserSkill) {
            return res.status(400).json({ error: 'You already have this skill' });
        }
        // Start a transaction to:
        // 1. Create UserSkill entry linking user to skill with sourcePostId
        // 2. Award +5 points to the post author
        // 3. Log the points transaction
        await prisma.$transaction(async (tx) => {
            // Create user skill
            await tx.userSkill.create({
                data: {
                    userId: userId,
                    skillId: skillIdNum,
                    sourcePostId: postIdNum
                }
            });
            // Award 5 points to post author
            const pointsAwarded = 5;
            await tx.user.update({
                where: { id: postSkill.post.authorId },
                data: {
                    totalPoints: {
                        increment: pointsAwarded
                    }
                }
            });
            // Log the points transaction
            await tx.pointsLog.create({
                data: {
                    userId: postSkill.post.authorId,
                    postId: postIdNum,
                    skillId: skillIdNum,
                    points: pointsAwarded,
                    reason: `Skill claimed by user ${userId} from post "${postSkill.post.title}"`
                }
            });
        });
        res.status(201).json({
            message: 'Skill claimed successfully! Author awarded 5 points.',
            skillId: skillIdNum,
            postId: postIdNum
        });
    }
    catch (error) {
        console.error('Claim skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.claimSkill = claimSkill;
// GET user's claimed skills
const getUserSkills = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userSkills = await prisma.userSkill.findMany({
            where: {
                userId: userId
            },
            include: {
                skill: true,
                sourcePost: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                claimedAt: 'desc'
            }
        });
        res.json({ userSkills });
    }
    catch (error) {
        console.error('Get user skills error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserSkills = getUserSkills;
