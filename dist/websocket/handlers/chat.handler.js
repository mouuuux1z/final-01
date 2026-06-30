"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatHandlers = registerChatHandlers;
const events_js_1 = require("../events.js");
const rooms_js_1 = require("../rooms.js");
function registerChatHandlers(socket) {
    socket.on(events_js_1.SocketEvents.CHAT_TYPING, (payload) => {
        if (!payload?.doctorId || !payload?.patientId)
            return;
        socket.to((0, rooms_js_1.chatRoom)(payload.doctorId, payload.patientId)).emit(events_js_1.SocketEvents.CHAT_TYPING, {
            userId: socket.user?.userId,
            userType: socket.user?.userType,
        });
    });
    socket.on('chat:join', (payload) => {
        if (!payload?.doctorId || !payload?.patientId)
            return;
        socket.join((0, rooms_js_1.chatRoom)(payload.doctorId, payload.patientId));
    });
    socket.on('chat:leave', (payload) => {
        if (!payload?.doctorId || !payload?.patientId)
            return;
        socket.leave((0, rooms_js_1.chatRoom)(payload.doctorId, payload.patientId));
    });
}
//# sourceMappingURL=chat.handler.js.map