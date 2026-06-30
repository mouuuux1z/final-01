"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = emitToUser;
exports.emitToChat = emitToChat;
exports.emitToRoom = emitToRoom;
const io_instance_js_1 = require("./io.instance.js");
const rooms_js_1 = require("./rooms.js");
function emitToUser(userType, userId, event, data) {
    try {
        (0, io_instance_js_1.getIO)().to((0, rooms_js_1.userRoom)(userType, userId)).emit(event, data);
    }
    catch {
        // Socket.IO may not be initialized during tests
    }
}
function emitToChat(doctorId, patientId, event, data) {
    try {
        (0, io_instance_js_1.getIO)().to((0, rooms_js_1.chatRoom)(doctorId, patientId)).emit(event, data);
    }
    catch {
        // Socket.IO may not be initialized during tests
    }
}
function emitToRoom(room, event, data) {
    try {
        (0, io_instance_js_1.getIO)().to(room).emit(event, data);
    }
    catch {
        // Socket.IO may not be initialized during tests
    }
}
//# sourceMappingURL=emitter.js.map