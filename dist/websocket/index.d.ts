import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
export declare function initSocketIO(httpServer: HttpServer): SocketIOServer;
