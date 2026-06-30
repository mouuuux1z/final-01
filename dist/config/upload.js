"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadConfig = void 0;
const node_path_1 = __importDefault(require("node:path"));
const env_js_1 = require("./env.js");
exports.uploadConfig = {
    uploadDir: node_path_1.default.resolve(process.cwd(), env_js_1.env.UPLOAD_DIR),
    maxFileSize: env_js_1.env.MAX_FILE_SIZE,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedChatTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};
//# sourceMappingURL=upload.js.map