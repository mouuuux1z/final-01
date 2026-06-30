"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_js_1 = require("./config/env.js");
const upload_js_1 = require("./config/upload.js");
const rateLimit_middleware_js_1 = require("./middleware/rateLimit.middleware.js");
const errorHandler_middleware_js_1 = require("./middleware/errorHandler.middleware.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: env_js_1.env.NODE_ENV === 'development' ? false : undefined,
    }));
    app.use((0, cors_1.default)({
        origin: env_js_1.env.NODE_ENV === 'development'
            ? (origin, callback) => {
                if (!origin ||
                    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin)) {
                    callback(null, true);
                    return;
                }
                callback(null, false);
            }
            : true,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(rateLimit_middleware_js_1.generalRateLimit);
    app.use('/uploads', express_1.default.static(upload_js_1.uploadConfig.uploadDir));
    app.get('/health', (_req, res) => {
        res.json({ success: true, message: 'MYDoc API is running' });
    });
    app.use('/api', index_js_1.default);
    app.use((_req, res) => {
        res.status(404).json({ success: false, message: 'Route not found' });
    });
    app.use(errorHandler_middleware_js_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map