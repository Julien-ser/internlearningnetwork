"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkillById = exports.getAllSkills = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET all skills
const getAllSkills = async (req, res) => {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: {
                name: 'asc'
            },
            include: {
                _count: {
                    select: {
                        userSkills: true,
                        postSkills: true
                    }
                }
            }
        });
        res.json({ skills });
    }
    catch (error) {
        console.error('Get all skills error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllSkills = getAllSkills;
// GET single skill by ID
const getSkillById = async (req, res) => {
    try {
        const { id } = req.params;
        const skillId = parseInt(id);
        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
            include: {
                userSkills: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                },
                postSkills: {
                    include: {
                        post: {
                            select: {
                                id: true,
                                title: true,
                                author: {
                                    select: {
                                        username: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        userSkills: true,
                        postSkills: true
                    }
                }
            }
        });
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.json({ skill });
    }
    catch (error) {
        console.error('Get skill by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSkillById = getSkillById;
// POST create new skill (admin only in future, but for now anyone can create)
const createSkill = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Check if skill already exists
        const existingSkill = await prisma.skill.findUnique({
            where: { name }
        });
        if (existingSkill) {
            return res.status(400).json({ error: 'Skill with this name already exists' });
        }
        const skill = await prisma.skill.create({
            data: {
                name,
                description
            }
        });
        res.status(201).json({
            message: 'Skill created successfully',
            skill
        });
    }
    catch (error) {
        console.error('Create skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createSkill = createSkill;
// PUT update skill
const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const skillId = parseInt(id);
        const { name, description } = req.body;
        // Check if skill exists
        const existingSkill = await prisma.skill.findUnique({
            where: { id: skillId }
        });
        if (!existingSkill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        // If name is being changed, check for uniqueness
        if (name && name !== existingSkill.name) {
            const duplicateSkill = await prisma.skill.findUnique({
                where: { name }
            });
            if (duplicateSkill) {
                return res.status(400).json({ error: 'Skill with this name already exists' });
            }
        }
        const skill = await prisma.skill.update({
            where: { id: skillId },
            data: {
                ...(name && { name }),
                description
            }
        });
        res.json({
            message: 'Skill updated successfully',
            skill
        });
    }
    catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateSkill = updateSkill;
// DELETE skill
const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const skillId = parseInt(id);
        // Check if skill exists
        const existingSkill = await prisma.skill.findUnique({
            where: { id: skillId }
        });
        if (!existingSkill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        await prisma.skill.delete({
            where: { id: skillId }
        });
        res.json({ message: 'Skill deleted successfully' });
    }
    catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteSkill = deleteSkill;
