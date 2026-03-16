"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const levels_controller_1 = require("./levels.controller");
const router = (0, express_1.Router)();
/**
 * @route GET /api/level
 * @desc  Get user's current level information
 * @access Public (userId query param required)
 */
router.get('/', levels_controller_1.getUserLevel);
/**
 * @route POST /api/level/calculate
 * @desc  Calculate level for given points
 * @access Public
 */
router.post('/calculate', levels_controller_1.calculateLevelEndpoint);
/**
 * @route POST /api/level/update
 * @desc  Update user's level based on current points
 * @access Public (userId query param required)
 */
router.post('/update', levels_controller_1.updateUserLevel);
exports.default = router;
