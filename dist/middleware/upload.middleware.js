"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadChatFile = exports.uploadDocument = exports.uploadCertificate = exports.uploadImage = void 0;
exports.getFileUrl = getFileUrl;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const upload_js_1 = require("../config/upload.js");
const AppError_js_1 = require("../utils/AppError.js");
if (!node_fs_1.default.existsSync(upload_js_1.uploadConfig.uploadDir)) {
    node_fs_1.default.mkdirSync(upload_js_1.uploadConfig.uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, upload_js_1.uploadConfig.uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = node_path_1.default.extname(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    },
});
function fileFilter(allowedTypes) {
    return (_req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new AppError_js_1.AppError('Invalid file type', 400));
    };
}
exports.uploadImage = (0, multer_1.default)({
    storage,
    limits: { fileSize: upload_js_1.uploadConfig.maxFileSize },
    fileFilter: fileFilter(upload_js_1.uploadConfig.allowedImageTypes),
});
function certificateFileFilter(_req, file, cb) {
    const allowedTypes = [
        ...upload_js_1.uploadConfig.allowedDocumentTypes,
        'image/webp',
        'application/octet-stream',
    ];
    const ext = node_path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
    }
    if (file.mimetype === 'application/octet-stream' && allowedExtensions.includes(ext)) {
        cb(null, true);
        return;
    }
    cb(new AppError_js_1.AppError('Invalid file type. Upload a PDF or image (JPG, PNG, WEBP).', 400));
}
exports.uploadCertificate = (0, multer_1.default)({
    storage,
    limits: { fileSize: upload_js_1.uploadConfig.maxFileSize },
    fileFilter: certificateFileFilter,
});
exports.uploadDocument = (0, multer_1.default)({
    storage,
    limits: { fileSize: upload_js_1.uploadConfig.maxFileSize },
    fileFilter: fileFilter(upload_js_1.uploadConfig.allowedDocumentTypes),
});
exports.uploadChatFile = (0, multer_1.default)({
    storage,
    limits: { fileSize: upload_js_1.uploadConfig.maxFileSize },
    fileFilter: fileFilter(upload_js_1.uploadConfig.allowedChatTypes),
});
function getFileUrl(filename) {
    return `/uploads/${filename}`;
}
//# sourceMappingURL=upload.middleware.js.map