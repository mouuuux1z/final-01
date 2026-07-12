import path from 'node:path';
import { env } from './env.js';

export const uploadConfig = {
  uploadDir: path.resolve(process.cwd(), env.UPLOAD_DIR),
  maxFileSize: env.MAX_FILE_SIZE,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  allowedChatTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
} as const;
