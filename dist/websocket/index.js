"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = initSocketIO;
const socket_io_1 = require("socket.io");
const env_js_1 = require("../config/env.js");
const io_instance_js_1 = require("./io.instance.js");
const auth_middleware_js_1 = require("./middleware/auth.middleware.js");
const index_js_1 = require("./handlers/index.js");
function initSocketIO(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_js_1.env.NODE_ENV === 'production' ? false : '*',
            methods: ['GET', 'POST'],
        },
        path: '/socket.io',
    });
    io.use((socket, next) => {
        (0, auth_middleware_js_1.socketAuthMiddleware)(socket, next);
    });
    (0, index_js_1.registerSocketHandlers)(io);
    (0, io_instance_js_1.setIO)(io);
    return io;
}
//# sourceMappingURL=index.js.map