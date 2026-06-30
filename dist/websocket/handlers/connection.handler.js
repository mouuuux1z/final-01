"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
exports.joinChatRoom = joinChatRoom;
const rooms_js_1 = require("../rooms.js");
const events_js_1 = require("../events.js");
function handleConnection(socket) {
    const user = socket.user;
    if (!user)
        return;
    socket.join((0, rooms_js_1.userRoom)(user.userType, user.userId));
    socket.emit(events_js_1.SocketEvents.CONNECTED, { userId: user.userId, userType: user.userType });
    socket.on('disconnect', () => {
        socket.emit(events_js_1.SocketEvents.DISCONNECTED, { userId: user.userId });
    });
}
function joinChatRoom(socket, doctorId, patientId) {
    socket.join((0, rooms_js_1.chatRoom)(doctorId, patientId));
}
//# sourceMappingURL=connection.handler.js.map