export const SocketEvents = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_READ: 'chat:read',
  NOTIFICATION: 'notification',
  APPOINTMENT_NEW: 'appointment:new',
  APPOINTMENT_UPDATED: 'appointment:updated',
  PATIENT_PROFILE_UPDATED: 'patient:profile:updated',
  DOCTOR_ONLINE: 'doctor:online',
  DOCTOR_OFFLINE: 'doctor:offline',
} as const;

export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
