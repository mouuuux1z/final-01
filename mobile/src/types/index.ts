export type UserType = 'ADMIN' | 'CLINIC' | 'DOCTOR' | 'PATIENT';

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'DISABLED';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'REJECTED';

export type AttendanceStatus = 'PENDING' | 'ATTENDED' | 'ABSENT' | 'LATE';

export type DayOfWeek =
  | 'SATURDAY'
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY';

export type SenderType = 'DOCTOR' | 'PATIENT';

export type NotificationTargetType = 'ADMIN' | 'CLINIC' | 'DOCTOR' | 'PATIENT' | 'ALL';

export type NotificationType =
  | 'APPOINTMENT'
  | 'SYSTEM'
  | 'REMINDER'
  | 'CHAT'
  | 'COMPLAINT'
  | 'BOOKING';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt?: string;
}

export interface ClinicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  city?: string;
  specialization?: string;
  certificate?: string | null;
  status: EntityStatus;
  createdAt?: string;
}

export interface ClinicProfile extends ClinicUser {
  doctors?: DoctorUser[];
  _count?: { doctors: number };
}

export interface DoctorUser {
  id: string;
  serialNumber?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  city: string;
  location?: string | null;
  clinicInfo?: string | null;
  description?: string | null;
  image?: string | null;
  certificate?: string | null;
  rating?: number;
  ratingCount?: number;
  status: EntityStatus;
  isOnline?: boolean;
  clinicId?: string | null;
  createdAt?: string;
}

export interface PatientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: EntityStatus;
  attendancePoints?: number;
  bookingBlockedUntil?: string | null;
  createdAt?: string;
}

export type User = AdminUser | ClinicUser | DoctorUser | PatientUser;

export interface AuthSession {
  token: string;
  expiresAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  expiresAt?: string;
  pendingApproval?: boolean;
}

export interface RegisterResult {
  pendingApproval: boolean;
}

export interface Doctor extends DoctorUser {
  schedules?: DoctorSchedule[];
  clinic?: { id: string; name: string; location: string };
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface DoctorAvailabilitySlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId?: string | null;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  attendanceStatus: AttendanceStatus;
  createdAt: string;
  doctor?: Pick<Doctor, 'id' | 'name' | 'specialization' | 'phone' | 'city' | 'location' | 'image'>;
  patient?: Pick<PatientUser, 'id' | 'name' | 'email' | 'phone' | 'attendancePoints'>;
}

export interface Notification {
  id: string;
  targetType: NotificationTargetType;
  targetId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  doctorId: string;
  patientId: string;
  senderType: SenderType;
  message: string;
  fileUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface ChatAccess {
  initiated: boolean;
  repliesEnabled: boolean;
  canPatientReply: boolean;
}

export interface DoctorRating {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface DoctorRatingAggregate {
  rating: number;
  ratingCount: number;
}

export interface PatientRatingStatus {
  rating: DoctorRating | null;
  eligible: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
