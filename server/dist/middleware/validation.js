"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdate = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema, options) => {
    const source = options?.source || 'body';
    return (req, res, next) => {
        try {
            let data;
            if (source === 'params') {
                data = req.params;
            }
            else if (source === 'query') {
                data = req.query;
            }
            else {
                data = req.body;
            }
            schema.parse(data);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(400).json({ error: 'Validation failed' });
        }
    };
};
exports.validate = validate;
const validateUpdate = (schema) => {
    return (req, res, next) => {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json({ error: 'No update data provided' });
            }
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(400).json({ error: 'Validation failed' });
        }
    };
};
exports.validateUpdate = validateUpdate;
