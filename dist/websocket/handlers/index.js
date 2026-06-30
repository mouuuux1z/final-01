"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const connection_handler_js_1 = require("./connection.handler.js");
const chat_handler_js_1 = require("./chat.handler.js");
function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        const authSocket = socket;
        (0, connection_handler_js_1.handleConnection)(authSocket);
        (0, chat_handler_js_1.registerChatHandlers)(authSocket);
    });
}
//# sourceMappingURL=index.js.map