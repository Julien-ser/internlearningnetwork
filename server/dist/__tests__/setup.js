"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetMocks = exports.jwt = exports.bcrypt = exports.prisma = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwt = jsonwebtoken_1.default;
// Mock bcrypt
const bcryptMock = {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
};
// Mock Prisma client
const prismaMock = {
    user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    post: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    skill: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    postSkill: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
    },
    userSkill: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
    },
    level: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    pointsLog: {
        create: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
};
// Mock modules
jest.mock('bcrypt', () => bcryptMock);
jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn().mockImplementation(() => prismaMock),
    };
});
jest.mock('../middleware/rate-limit', () => ({
    generalRateLimiter: (req, res, next) => next(),
    authRateLimiter: (req, res, next) => next(),
    claimRateLimiter: (req, res, next) => next(),
    postCreationRateLimiter: (req, res, next) => next(),
}));
// Export mocks
exports.prisma = prismaMock;
exports.bcrypt = bcryptMock;
// Helper to reset all mocks
const resetMocks = () => {
    jest.clearAllMocks();
};
exports.resetMocks = resetMocks;
describe('setup', () => {
    it('should load setup file', () => {
        expect(true).toBe(true);
    });
});
