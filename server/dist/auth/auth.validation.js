"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Schema for user registration
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: 'Email, username, and password are required' }).email('Invalid email address'),
    username: zod_1.z.string({ required_error: 'Email, username, and password are required' }).min(1, 'Email, username, and password are required').max(50, 'Username is too long'),
    password: zod_1.z.string({ required_error: 'Email, username, and password are required' }).min(6, 'Password must be at least 6 characters long')
});
// Schema for user login
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: 'Email and password are required' }).email('Invalid email address'),
    password: zod_1.z.string({ required_error: 'Email and password are required' })
});
