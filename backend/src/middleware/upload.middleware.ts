import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { uploadConfig } from '../config/upload.js';
import { AppError } from '../utils/AppError.js';

if (!fs.existsSync(uploadConfig.uploadDir)) {
  fs.mkdirSync(uploadConfig.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadConfig.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(allowedTypes: readonly string[]) {
  return (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new AppError('Invalid file type', 400));
  };
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: fileFilter(uploadConfig.allowedImageTypes),
});

function certificateFileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = [
    ...uploadConfig.allowedDocumentTypes,
    'image/webp',
    'application/octet-stream',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  if (file.mimetype === 'application/octet-stream' && allowedExtensions.includes(ext)) {
    cb(null, true);
    return;
  }

  cb(new AppError('Invalid file type. Upload a PDF or image (JPG, PNG, WEBP).', 400));
}

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: certificateFileFilter,
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: fileFilter(uploadConfig.allowedDocumentTypes),
});

export const uploadChatFile = multer({
  storage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: fileFilter(uploadConfig.allowedChatTypes),
});

export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
