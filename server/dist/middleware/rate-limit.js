"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCreationRateLimiter = exports.claimRateLimiter = exports.authRateLimiter = exports.generalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API rate limiter: 100 requests per 15 minutes
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Stricter rate limiter for auth routes: 5 attempts per 15 minutes
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiter for skill claiming: 20 claims per hour to prevent abuse
exports.claimRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each user to 20 claims per hour
    message: {
        error: 'Too many skill claims, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiter for post creation: 10 posts per hour
exports.postCreationRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 posts per hour
    message: {
        error: 'Too many post creations, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
