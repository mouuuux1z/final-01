import type { UserType } from '@prisma/client';

export function userRoom(userType: UserType, userId: string): string {
  return `user:${userType}:${userId}`;
}

export function chatRoom(doctorId: string, patientId: string): string {
  return `chat:${doctorId}:${patientId}`;
}

export function doctorRoom(doctorId: string): string {
  return `doctor:${doctorId}`;
}

export function clinicRoom(clinicId: string): string {
  return `clinic:${clinicId}`;
}

export function adminRoom(): string {
  return 'admin:all';
}
