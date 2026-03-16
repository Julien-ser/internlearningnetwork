"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Schema for user registration
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').min(1, 'Email is required'),
    username: zod_1.z.string().min(1, 'Username is required').max(50, 'Username is too long'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long')
});
// Schema for user login
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').min(1, 'Email is required'),
    password: zod_1.z.string().min(1, 'Password is required')
});
