"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimSkillSchema = void 0;
const zod_1 = require("zod");
// Schema for validating claim skill request
// The postId and skillId come from URL params, but we can validate them
exports.claimSkillSchema = zod_1.z.object({
    postId: zod_1.z.string().transform(val => parseInt(val, 10)),
    skillId: zod_1.z.string().transform(val => parseInt(val, 10))
});
