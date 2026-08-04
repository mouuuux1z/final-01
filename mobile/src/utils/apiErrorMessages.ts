import i18n from '../i18n';
import { getApiBaseOrigin } from '../constants/config';

export const API_ERROR_MESSAGE_KEYS: Record<string, string> = {
  'Something went wrong': 'errors.api.generic',
  'Internal server error': 'errors.api.internalServer',
  'Validation failed': 'errors.api.validationFailed',
  'Invalid request body': 'errors.api.invalidRequestBody',
  'Authentication required': 'errors.api.authenticationRequired',
  'Session expired': 'errors.api.sessionExpired',
  'Invalid session': 'errors.api.invalidSession',
  'Invalid or expired token': 'errors.api.invalidToken',
  'Invalid or expired reset code': 'errors.api.invalidResetCode',
  'Email service is not configured': 'errors.api.emailServiceUnavailable',
  'Failed to send verification email': 'errors.api.emailSendFailed',
  'Resend testing mode only allows sending to your Resend account email': 'errors.api.resendTestingEmailOnly',
  'Invalid credentials': 'errors.api.invalidCredentials',
  'Incorrect password': 'errors.api.incorrectPassword',
  'Account deletion is not allowed': 'errors.api.accountDeletionNotAllowed',
  'Email already registered': 'errors.api.emailAlreadyRegistered',
  'User not found': 'errors.api.userNotFound',
  'Account not active': 'errors.api.accountNotActive',
  'Account suspended': 'errors.api.accountSuspended',
  'Account is inactive': 'errors.api.accountInactive',
  'Account disabled': 'errors.api.accountDisabled',
  'Your clinic account is pending admin approval': 'errors.api.clinicPendingApproval',
  'Patient not found': 'errors.api.patientNotFound',
  'Doctor not found': 'errors.api.doctorNotFound',
  'Doctor not available': 'errors.api.doctorUnavailable',
  'Doctor account is not active': 'errors.api.doctorNotActive',
  'Doctor not found in this clinic': 'errors.api.doctorNotFoundInClinic',
  'Doctor not found in clinic': 'errors.api.doctorNotFoundInClinic',
  'Doctor already belongs to another clinic': 'errors.api.doctorAlreadyInClinic',
  'Clinic not found': 'errors.api.clinicNotFound',
  'Clinic account is not active': 'errors.api.clinicNotActive',
  'Booking temporarily blocked': 'errors.api.bookingBlocked',
  'Commitment booking block active': 'errors.api.commitmentBookingBlocked',
  'Selected time slot is not available': 'errors.api.slotUnavailable',
  'Appointment not found': 'errors.api.appointmentNotFound',
  'Cannot cancel this appointment': 'errors.api.cannotCancelAppointment',
  'Failed to cancel appointment': 'errors.api.cancelFailed',
  'Cannot reschedule cancelled appointment': 'errors.api.cannotRescheduleCancelled',
  'Failed to reschedule appointment': 'errors.api.rescheduleFailed',
  'Appointment is not pending': 'errors.api.appointmentNotPending',
  'Attendance can only be marked for confirmed appointments': 'errors.api.attendanceConfirmedOnly',
  'Attendance has already been recorded': 'errors.api.attendanceAlreadyRecorded',
  'Cannot mark attendance before the appointment time': 'errors.api.attendanceTooEarly',
  'Attendance cannot be marked for private appointments': 'errors.api.attendancePrivateNotAllowed',
  'Patient name is required for private appointments': 'errors.api.privatePatientRequired',
  'Schedule already exists for this day': 'errors.api.scheduleExists',
  'Schedule not found': 'errors.api.scheduleNotFound',
  'Slot already exists': 'errors.api.slotExists',
  'Slot not found or already booked': 'errors.api.slotNotFoundOrBooked',
  'No slots could be generated with the provided settings': 'errors.api.noSlotsGenerated',
  'All generated slots overlap with existing appointments': 'errors.api.slotsOverlap',
  'Forbidden': 'errors.api.forbidden',
  'Notification not found': 'errors.api.notificationNotFound',
  'Doctor has not started this conversation yet': 'errors.api.chatNotStarted',
  'Only the doctor can start a conversation': 'errors.api.chatDoctorOnlyStart',
  'Doctor is not accepting replies': 'errors.api.chatRepliesDisabled',
  'File upload failed. Please upload a valid certificate file.': 'errors.api.fileUploadFailed',
  'Request timed out. Check your connection and try again.': 'errors.api.networkTimeout',
  'Cannot reach server. Make sure the backend is running on http://197.140.142.178':
    'errors.api.networkUnreachable',
  'Route not found': 'errors.api.routeNotFound',
  'Invalid uuid': 'errors.api.invalidUuid',
  'Time must be in HH:MM format': 'errors.api.invalidTimeFormat',
  'End time must be after start time': 'errors.api.endTimeBeforeStart',
  'يوجد موعد خاص آخر يتداخل مع هذا الوقت': 'doctor.privateConflict',
  'يوجد موعد محجوز لمريض في هذه الفترة الزمنية': 'doctor.regularConflict',
  'وقت النهاية يجب أن يكون بعد وقت البداية': 'errors.api.endTimeBeforeStart',
  'ليس لديك صلاحية للوصول إلى المواعيد الخاصة': 'doctor.privateForbidden',
};

export function translateApiMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return i18n.t('errors.api.generic');
  }

  const key = API_ERROR_MESSAGE_KEYS[trimmed];
  if (key) {
    if (key === 'errors.api.routeNotFound' || key === 'errors.api.networkUnreachable') {
      return i18n.t(key, { server: getApiBaseOrigin() });
    }
    return i18n.t(key);
  }

  return trimmed;
}

export function getLocalizedApiFallback(): string {
  return i18n.t('errors.api.generic');
}

export function getLocalizedNetworkTimeoutMessage(): string {
  return i18n.t('errors.api.networkTimeout');
}

export function getLocalizedNetworkUnreachableMessage(): string {
  return i18n.t('errors.api.networkUnreachable', { server: getApiBaseOrigin() });
}
