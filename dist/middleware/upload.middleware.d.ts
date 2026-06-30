import multer from 'multer';
export declare const uploadImage: multer.Multer;
export declare const uploadCertificate: multer.Multer;
export declare const uploadDocument: multer.Multer;
export declare const uploadChatFile: multer.Multer;
export declare function getFileUrl(filename: string): string;
