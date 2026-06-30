"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoom = userRoom;
exports.chatRoom = chatRoom;
exports.doctorRoom = doctorRoom;
exports.clinicRoom = clinicRoom;
exports.adminRoom = adminRoom;
function userRoom(userType, userId) {
    return `user:${userType}:${userId}`;
}
function chatRoom(doctorId, patientId) {
    return `chat:${doctorId}:${patientId}`;
}
function doctorRoom(doctorId) {
    return `doctor:${doctorId}`;
}
function clinicRoom(clinicId) {
    return `clinic:${clinicId}`;
}
function adminRoom() {
    return 'admin:all';
}
//# sourceMappingURL=rooms.js.map