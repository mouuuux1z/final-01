export declare const SocketEvents: {
    readonly CONNECTED: "connected";
    readonly DISCONNECTED: "disconnected";
    readonly CHAT_MESSAGE: "chat:message";
    readonly CHAT_TYPING: "chat:typing";
    readonly CHAT_READ: "chat:read";
    readonly NOTIFICATION: "notification";
    readonly APPOINTMENT_NEW: "appointment:new";
    readonly APPOINTMENT_UPDATED: "appointment:updated";
    readonly PATIENT_PROFILE_UPDATED: "patient:profile:updated";
    readonly DOCTOR_ONLINE: "doctor:online";
    readonly DOCTOR_OFFLINE: "doctor:offline";
};
export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
