"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSkillSchema = exports.createSkillSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a skill
exports.createSkillSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    description: zod_1.z.string().max(500, 'Description is too long').optional()
});
// Schema for updating a skill
exports.updateSkillSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
    description: zod_1.z.string().max(500, 'Description is too long').optional()
});
