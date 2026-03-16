"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const rate_limit_1 = require("./middleware/rate-limit");
const sanitize_1 = require("./middleware/sanitize");
const logger_1 = require("./middleware/logger");
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const posts_routes_1 = __importDefault(require("./posts/posts.routes"));
const skills_routes_1 = __importDefault(require("./skills/skills.routes"));
const claims_routes_1 = __importDefault(require("./claims/claims.routes"));
const levels_routes_1 = __importDefault(require("./levels/levels.routes"));
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3001;
// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use(rate_limit_1.generalRateLimiter);
app.use(express_1.default.json());
app.use(sanitize_1.sanitize);
app.use(logger_1.logger);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/posts', posts_routes_1.default);
app.use('/api/skills', skills_routes_1.default);
app.use('/api/claims', claims_routes_1.default);
app.use('/api/level', levels_routes_1.default);
// Error handling middleware
app.use(logger_1.errorHandler);
// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on port ${PORT}`);
    });
}
