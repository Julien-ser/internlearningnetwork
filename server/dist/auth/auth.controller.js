"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({
                error: 'Email, username, and password are required'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            return res.status(409).json({
                error: 'User with this email or username already exists'
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET || 'default-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET || 'default-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                totalPoints: true,
                level: {
                    select: {
                        levelNumber: true,
                        name: true
                    }
                },
                userSkills: {
                    include: {
                        skill: true
                    },
                    orderBy: {
                        claimedAt: 'desc'
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
