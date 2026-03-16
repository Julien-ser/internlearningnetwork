"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a post
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    content: zod_1.z.string().min(1, 'Content is required'),
    skill_tags: zod_1.z.array(zod_1.z.number()).optional().default([]) // Array of skill IDs
});
// Schema for updating a post
exports.updatePostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
    content: zod_1.z.string().min(1, 'Content is required').optional(),
    skill_tags: zod_1.z.array(zod_1.z.number()).optional()
});
