"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = void 0;
const xss_1 = __importDefault(require("xss"));
const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        return (0, xss_1.default)(value, {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
        });
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
    }
    if (typeof value === 'object' && value !== null) {
        const sanitized = {};
        for (const key in value) {
            sanitized[key] = sanitizeValue(value[key]);
        }
        return sanitized;
    }
    return value;
};
const sanitize = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    next();
};
exports.sanitize = sanitize;
