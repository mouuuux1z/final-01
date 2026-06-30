import type { Request, Response } from 'express';
export declare class ChatController {
    listConversations: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getConversation: (req: Request, res: Response, next: import("express").NextFunction) => void;
    sendMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getConversationReplies: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateConversationReplies: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAccess: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const chatController: ChatController;
