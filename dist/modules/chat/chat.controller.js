"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = exports.ChatController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const upload_middleware_js_1 = require("../../middleware/upload.middleware.js");
const chat_service_js_1 = require("./chat.service.js");
class ChatController {
    listConversations = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await chat_service_js_1.chatService.listConversations(req.user.id, req.user.userType, req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    getConversation = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await chat_service_js_1.chatService.getConversation(req.query.doctorId, req.query.patientId, req.user.id, req.user.userType, req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    sendMessage = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const file = req.file;
        const fileUrl = file?.filename ? (0, upload_middleware_js_1.getFileUrl)(file.filename) : undefined;
        const message = await chat_service_js_1.chatService.sendMessage(req.body, req.user.id, req.user.userType, fileUrl);
        (0, apiResponse_js_1.sendSuccess)(res, message, 'Message sent', 201);
    });
    markAsRead = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await chat_service_js_1.chatService.markAsRead(req.body.doctorId, req.body.patientId, req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Messages marked as read');
    });
    getConversationReplies = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const settings = await chat_service_js_1.chatService.getConversationReplies(req.query.doctorId, req.query.patientId, req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, settings);
    });
    updateConversationReplies = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const settings = await chat_service_js_1.chatService.updateConversationReplies(req.body.doctorId, req.body.patientId, req.body.repliesEnabled, req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, settings, 'Conversation replies updated');
    });
    getAccess = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const access = await chat_service_js_1.chatService.getChatAccess(req.query.doctorId, req.query.patientId, req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, access);
    });
}
exports.ChatController = ChatController;
exports.chatController = new ChatController();
//# sourceMappingURL=chat.controller.js.map