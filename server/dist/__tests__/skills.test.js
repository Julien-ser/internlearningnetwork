"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const setup_1 = require("./setup");
// Mock auth user
const mockAuthUser = {
    id: 1,
    email: 'user@example.com',
    username: 'testuser'
};
const mockAuthToken = 'mock-jwt-token';
// Mock the authenticate middleware to check for Authorization header
jest.mock('../auth/auth.middleware', () => ({
    authenticate: (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        // Accept any token for mocked auth
        req.user = mockAuthUser;
        next();
    }
}));
describe('Skills Controller', () => {
    beforeEach(() => {
        (0, setup_1.resetMocks)();
    });
    describe('GET /api/skills', () => {
        it('should get all skills', async () => {
            const mockSkills = [
                { id: 1, name: 'TypeScript', description: 'TypeScript language' },
                { id: 2, name: 'React', description: 'React framework' }
            ];
            setup_1.prisma.skill.findMany.mockResolvedValue(mockSkills);
            const response = await (0, supertest_1.default)(index_1.app)
                .get('/api/skills')
                .expect(200);
            expect(response.body.skills).toHaveLength(2);
        });
        it('should return empty array when no skills exist', async () => {
            setup_1.prisma.skill.findMany.mockResolvedValue([]);
            const response = await (0, supertest_1.default)(index_1.app)
                .get('/api/skills')
                .expect(200);
            expect(response.body.skills).toEqual([]);
        });
    });
    describe('GET /api/skills/:id', () => {
        it('should get a single skill by ID', async () => {
            const mockSkill = {
                id: 1,
                name: 'TypeScript',
                description: 'TypeScript language',
                postSkills: [
                    { post: { id: 1, title: 'Post 1', author: { username: 'user1' } } }
                ],
                userSkills: [
                    { user: { id: 2, username: 'user2' } }
                ]
            };
            setup_1.prisma.skill.findUnique.mockResolvedValue(mockSkill);
            const response = await (0, supertest_1.default)(index_1.app)
                .get('/api/skills/1')
                .expect(200);
            expect(response.body.skill.name).toBe('TypeScript');
        });
        it('should return 404 if skill not found', async () => {
            setup_1.prisma.skill.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(index_1.app)
                .get('/api/skills/999')
                .expect(404);
            expect(response.body.error).toBe('Skill not found');
        });
    });
    describe('POST /api/skills', () => {
        it('should create a new skill', async () => {
            const newSkill = {
                name: 'New Skill',
                description: 'A new skill'
            };
            const createdSkill = {
                id: 1,
                name: newSkill.name,
                description: newSkill.description
            };
            setup_1.prisma.skill.findUnique.mockResolvedValue(null);
            setup_1.prisma.skill.create.mockResolvedValue(createdSkill);
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/skills')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send(newSkill)
                .expect(201);
            expect(response.body.message).toBe('Skill created successfully');
            expect(response.body.skill.name).toBe(newSkill.name);
        });
        it('should return 400 if name is missing', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/skills')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({ description: 'No name' })
                .expect(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should return 400 if name exceeds max length', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/skills')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({ name: 'A'.repeat(101), description: 'Too long name' })
                .expect(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should return 400 if skill with same name exists', async () => {
            const existingSkill = { id: 1, name: 'Existing Skill' };
            setup_1.prisma.skill.findUnique.mockResolvedValue(existingSkill);
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/skills')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({ name: 'Existing Skill', description: 'Test' })
                .expect(400);
            expect(response.body.error).toBe('Skill with this name already exists');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/skills')
                .send({ name: 'Test Skill' })
                .expect(401);
            expect(response.body.error).toBe('No token provided');
        });
    });
    describe('PUT /api/skills/:id', () => {
        it('should update skill successfully', async () => {
            const existingSkill = {
                id: 1,
                name: 'Old Name',
                description: 'Old description'
            };
            setup_1.prisma.skill.findUnique.mockResolvedValueOnce(existingSkill);
            setup_1.prisma.skill.findUnique.mockResolvedValueOnce(null); // duplicate check by name
            setup_1.prisma.skill.update.mockResolvedValue({
                ...existingSkill,
                name: 'Updated Name',
                description: 'Updated description'
            });
            const response = await (0, supertest_1.default)(index_1.app)
                .put('/api/skills/1')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({ name: 'Updated Name', description: 'Updated description' })
                .expect(200);
            expect(response.body.message).toBe('Skill updated successfully');
        });
        it('should return 400 for empty update body', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .put('/api/skills/1')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({})
                .expect(400);
            expect(response.body.error).toBe('No update data provided');
        });
        it('should return 400 if name exceeds max length', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .put('/api/skills/1')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({ name: 'A'.repeat(101) })
                .expect(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should return 404 if skill not found', async () => {
            setup_1.prisma.skill.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(index_1.app)
                .put('/api/skills/999')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({ name: 'Test' })
                .expect(404);
            expect(response.body.error).toBe('Skill not found');
        });
    });
    describe('DELETE /api/skills/:id', () => {
        it('should delete skill successfully', async () => {
            const existingSkill = { id: 1, name: 'To Delete' };
            setup_1.prisma.skill.findUnique.mockResolvedValue(existingSkill);
            setup_1.prisma.skill.delete.mockResolvedValue({});
            const response = await (0, supertest_1.default)(index_1.app)
                .delete('/api/skills/1')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200);
            expect(response.body.message).toBe('Skill deleted successfully');
        });
        it('should return 404 if skill not found', async () => {
            setup_1.prisma.skill.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(index_1.app)
                .delete('/api/skills/999')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(404);
            expect(response.body.error).toBe('Skill not found');
        });
    });
});
