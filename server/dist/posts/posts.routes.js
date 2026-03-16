"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_controller_1 = require("./posts.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const posts_validation_1 = require("./posts.validation");
const rate_limit_1 = require("../middleware/rate-limit");
const router = (0, express_1.Router)();
// Validation middleware using Zod
const validateCreatePost = (req, res, next) => {
    try {
        posts_validation_1.createPostSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.message
            });
        }
        res.status(400).json({ error: 'Validation failed' });
    }
};
const validateUpdatePost = (req, res, next) => {
    try {
        // For updates, all fields are optional, so we need to check if body has any fields
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No update data provided' });
        }
        posts_validation_1.updatePostSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.message
            });
        }
        res.status(400).json({ error: 'Validation failed' });
    }
};
// Public routes (no authentication required for reading)
router.get('/', posts_controller_1.getAllPosts);
router.get('/:id', posts_controller_1.getPostById);
// Protected routes (require authentication)
router.post('/', auth_middleware_1.authenticate, rate_limit_1.postCreationRateLimiter, validateCreatePost, posts_controller_1.createPost);
router.put('/:id', auth_middleware_1.authenticate, validateUpdatePost, posts_controller_1.updatePost);
router.delete('/:id', auth_middleware_1.authenticate, posts_controller_1.deletePost);
// Approve post endpoint (assigns skills to author)
router.put('/:id/approve', auth_middleware_1.authenticate, posts_controller_1.approvePost);
exports.default = router;
