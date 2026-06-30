"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const env_js_1 = require("./config/env.js");
const database_js_1 = require("./config/database.js");
const app_js_1 = require("./app.js");
const index_js_1 = require("./websocket/index.js");
function ensureDatabaseUrl() {
    if (!process.env.DATABASE_URL?.trim()) {
        console.error('FATAL: DATABASE_URL is not defined. Set DATABASE_URL in your environment (e.g. Render dashboard) before starting the server.');
        process.exit(1);
    }
}
async function bootstrap() {
    ensureDatabaseUrl();
    await (0, database_js_1.connectDatabase)();
    const app = (0, app_js_1.createApp)();
    const httpServer = node_http_1.default.createServer(app);
    (0, index_js_1.initSocketIO)(httpServer);
    httpServer.listen(env_js_1.env.PORT, () => {
        console.log(`MYDoc API running on port ${env_js_1.env.PORT} [${env_js_1.env.NODE_ENV}]`);
    });
    const shutdown = async (signal) => {
        console.log(`${signal} received, shutting down...`);
        httpServer.close(async () => {
            await (0, database_js_1.disconnectDatabase)();
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
}
bootstrap().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map