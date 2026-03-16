"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const skills_controller_1 = require("./skills.controller");
const skills_validation_1 = require("./skills.validation");
const router = (0, express_1.Router)();
// Validation middleware using Zod
const validateCreateSkill = (req, res, next) => {
    try {
        skills_validation_1.createSkillSchema.parse(req.body);
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
const validateUpdateSkill = (req, res, next) => {
    try {
        // For updates, all fields are optional, so we need to check if body has any fields
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No update data provided' });
        }
        skills_validation_1.updateSkillSchema.parse(req.body);
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
// Public routes
router.get('/', skills_controller_1.getAllSkills);
router.get('/:id', skills_controller_1.getSkillById);
// Protected routes (require authentication - admin only in future)
router.post('/', skills_controller_1.createSkill); // Could add authenticate middleware later
router.put('/:id', validateUpdateSkill, skills_controller_1.updateSkill);
router.delete('/:id', skills_controller_1.deleteSkill);
exports.default = router;
