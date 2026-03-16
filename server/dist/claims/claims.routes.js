"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const claims_controller_1 = require("./claims.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const validation_1 = require("../middleware/validation");
const claims_validation_1 = require("./claims.validation");
const rate_limit_1 = require("../middleware/rate-limit");
const router = (0, express_1.Router)();
// All claim routes require authentication
router.post('/posts/:postId/skills/:skillId/claim', auth_middleware_1.authenticate, rate_limit_1.claimRateLimiter, (0, validation_1.validate)(claims_validation_1.claimSkillSchema, { source: 'params' }), claims_controller_1.claimSkill);
router.get('/user/skills', auth_middleware_1.authenticate, claims_controller_1.getUserSkills);
exports.default = router;
