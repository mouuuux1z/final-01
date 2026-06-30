"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentsService = exports.AppointmentsService = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
const AppError_js_1 = require("../../utils/AppError.js");
const pagination_js_1 = require("../../utils/pagination.js");
const slotGenerator_js_1 = require("../../utils/slotGenerator.js");
const appointments_repository_js_1 = require("./appointments.repository.js");
const commitment_service_js_1 = require("../../services/commitment.service.js");
const emitter_js_1 = require("../../websocket/emitter.js");
const events_js_1 = require("../../websocket/events.js");
class AppointmentsService {
    async book(patientId, data) {
        const patient = await database_js_1.prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient)
            throw new AppError_js_1.AppError('Patient not found', 404);
        if (patient.status !== client_1.EntityStatus.ACTIVE)
            throw new AppError_js_1.AppError('Account not active', 403);
        await (0, commitment_service_js_1.assertPatientCanBook)(patientId);
        const doctor = await database_js_1.prisma.doctor.findFirst({
            where: { id: data.doctorId, status: client_1.EntityStatus.ACTIVE },
        });
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not available', 404);
        try {
            const appointment = await appointments_repository_js_1.appointmentsRepository.create({
                ...data,
                date: (0, slotGenerator_js_1.normalizeDateOnly)(data.date),
                patientId,
                patientName: data.patientName ?? patient.name,
                patientPhone: data.patientPhone ?? patient.phone,
            });
            await this.notifyDoctor(data.doctorId, appointment.id);
            (0, emitter_js_1.emitToUser)(client_1.UserType.DOCTOR, data.doctorId, events_js_1.SocketEvents.APPOINTMENT_NEW, appointment);
            return appointment;
        }
        catch (error) {
            if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
                throw new AppError_js_1.AppError('Selected time slot is not available', 409);
            }
            throw error;
        }
    }
    async getById(id, userId, userType) {
        const appointment = await appointments_repository_js_1.appointmentsRepository.findById(id);
        if (!appointment)
            throw new AppError_js_1.AppError('Appointment not found', 404);
        this.assertAccess(appointment, userId, userType);
        return appointment;
    }
    async listForUser(userId, userType, query) {
        const filters = {
            status: query.status,
            from: query.from,
            to: query.to,
        };
        if (userType === client_1.UserType.PATIENT)
            filters.patientId = userId;
        if (userType === client_1.UserType.DOCTOR)
            filters.doctorId = userId;
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await appointments_repository_js_1.appointmentsRepository.findMany(filters, pagination);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async cancel(id, userId, userType) {
        const appointment = await appointments_repository_js_1.appointmentsRepository.findById(id);
        if (!appointment)
            throw new AppError_js_1.AppError('Appointment not found', 404);
        this.assertAccess(appointment, userId, userType);
        if (appointment.status === client_1.AppointmentStatus.CANCELLED ||
            appointment.status === client_1.AppointmentStatus.COMPLETED) {
            throw new AppError_js_1.AppError('Cannot cancel this appointment', 400);
        }
        try {
            const result = await appointments_repository_js_1.appointmentsRepository.cancel(id);
            (0, emitter_js_1.emitToUser)(client_1.UserType.DOCTOR, appointment.doctorId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, result);
            (0, emitter_js_1.emitToUser)(client_1.UserType.PATIENT, appointment.patientId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, result);
            return result;
        }
        catch {
            throw new AppError_js_1.AppError('Failed to cancel appointment', 400);
        }
    }
    async reschedule(id, userId, userType, date, time) {
        const appointment = await appointments_repository_js_1.appointmentsRepository.findById(id);
        if (!appointment)
            throw new AppError_js_1.AppError('Appointment not found', 404);
        this.assertAccess(appointment, userId, userType);
        if (appointment.status === client_1.AppointmentStatus.CANCELLED) {
            throw new AppError_js_1.AppError('Cannot reschedule cancelled appointment', 400);
        }
        try {
            const result = await appointments_repository_js_1.appointmentsRepository.reschedule(id, (0, slotGenerator_js_1.normalizeDateOnly)(date), time);
            (0, emitter_js_1.emitToUser)(client_1.UserType.DOCTOR, appointment.doctorId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, result);
            if (appointment.patientId) {
                (0, emitter_js_1.emitToUser)(client_1.UserType.PATIENT, appointment.patientId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, result);
            }
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
                throw new AppError_js_1.AppError('Selected time slot is not available', 409);
            }
            throw new AppError_js_1.AppError('Failed to reschedule appointment', 400);
        }
    }
    async accept(id, doctorId) {
        const appointment = await appointments_repository_js_1.appointmentsRepository.findById(id);
        if (!appointment || appointment.doctorId !== doctorId) {
            throw new AppError_js_1.AppError('Appointment not found', 404);
        }
        if (appointment.status !== client_1.AppointmentStatus.PENDING) {
            throw new AppError_js_1.AppError('Appointment is not pending', 400);
        }
        const result = await appointments_repository_js_1.appointmentsRepository.updateStatus(id, client_1.AppointmentStatus.CONFIRMED);
        if (appointment.patientId) {
            await this.notifyPatient(appointment.patientId, 'Appointment confirmed', result.id);
            (0, emitter_js_1.emitToUser)(client_1.UserType.PATIENT, appointment.patientId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, result);
        }
        return result;
    }
    async reject(id, doctorId) {
        const appointment = await appointments_repository_js_1.appointmentsRepository.findById(id);
        if (!appointment || appointment.doctorId !== doctorId) {
            throw new AppError_js_1.AppError('Appointment not found', 404);
        }
        if (appointment.status !== client_1.AppointmentStatus.PENDING) {
            throw new AppError_js_1.AppError('Appointment is not pending', 400);
        }
        const result = await appointments_repository_js_1.appointmentsRepository.reject(id);
        if (appointment.patientId) {
            await this.notifyPatient(appointment.patientId, 'Appointment rejected', result.id);
            (0, emitter_js_1.emitToUser)(client_1.UserType.PATIENT, appointment.patientId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, result);
        }
        return result;
    }
    async doctorManualBook(doctorId, data) {
        const doctor = await database_js_1.prisma.doctor.findFirst({
            where: { id: doctorId, status: client_1.EntityStatus.ACTIVE },
        });
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not available', 404);
        try {
            const appointment = await appointments_repository_js_1.appointmentsRepository.createDoctorManual({
                ...data,
                doctorId,
                date: (0, slotGenerator_js_1.normalizeDateOnly)(data.date),
            });
            (0, emitter_js_1.emitToUser)(client_1.UserType.DOCTOR, doctorId, events_js_1.SocketEvents.APPOINTMENT_NEW, appointment);
            return appointment;
        }
        catch (error) {
            if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
                throw new AppError_js_1.AppError('Selected time slot is not available', 409);
            }
            throw error;
        }
    }
    async markAttendance(id, doctorId, attendanceStatus) {
        const appointment = await appointments_repository_js_1.appointmentsRepository.findById(id);
        if (!appointment || appointment.doctorId !== doctorId) {
            throw new AppError_js_1.AppError('Appointment not found', 404);
        }
        if (appointment.status !== client_1.AppointmentStatus.CONFIRMED &&
            appointment.status !== client_1.AppointmentStatus.COMPLETED &&
            appointment.status !== client_1.AppointmentStatus.PENDING &&
            appointment.status !== client_1.AppointmentStatus.NO_SHOW) {
            throw new AppError_js_1.AppError('Attendance can only be marked for confirmed appointments', 400);
        }
        if (appointment.attendanceStatus !== client_1.AttendanceStatus.PENDING &&
            appointment.attendanceStatus !== client_1.AttendanceStatus.LATE &&
            appointment.attendanceStatus !== client_1.AttendanceStatus.ABSENT) {
            throw new AppError_js_1.AppError('Attendance has already been recorded', 400);
        }
        const appointmentAt = (0, slotGenerator_js_1.getAppointmentDateTime)(new Date(appointment.date), appointment.time);
        const graceMs = 15 * 60 * 1000;
        if (appointmentAt.getTime() - graceMs > Date.now()) {
            throw new AppError_js_1.AppError('Cannot mark attendance before the appointment time', 400);
        }
        const status = attendanceStatus === client_1.AttendanceStatus.ATTENDED
            ? client_1.AppointmentStatus.COMPLETED
            : attendanceStatus === client_1.AttendanceStatus.ABSENT
                ? client_1.AppointmentStatus.NO_SHOW
                : appointment.status;
        const result = await appointments_repository_js_1.appointmentsRepository.updateAttendance(id, attendanceStatus, status);
        if (attendanceStatus === client_1.AttendanceStatus.ABSENT && appointment.patientId) {
            const wasAbsent = appointment.attendanceStatus === client_1.AttendanceStatus.ABSENT;
            if (!wasAbsent) {
                await (0, commitment_service_js_1.applyNoShowPenalty)(appointment.patientId);
            }
        }
        const refreshed = await appointments_repository_js_1.appointmentsRepository.findById(id);
        if (appointment.patientId) {
            (0, emitter_js_1.emitToUser)(client_1.UserType.PATIENT, appointment.patientId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, refreshed ?? result);
            const patientProfile = await (0, commitment_service_js_1.syncPatientCommitmentState)(appointment.patientId);
            if (patientProfile) {
                (0, emitter_js_1.emitToUser)(client_1.UserType.PATIENT, appointment.patientId, events_js_1.SocketEvents.PATIENT_PROFILE_UPDATED, patientProfile);
            }
        }
        (0, emitter_js_1.emitToUser)(client_1.UserType.DOCTOR, doctorId, events_js_1.SocketEvents.APPOINTMENT_UPDATED, refreshed ?? result);
        return refreshed ?? result;
    }
    assertAccess(appointment, userId, userType) {
        if (userType === client_1.UserType.ADMIN)
            return;
        if (userType === client_1.UserType.PATIENT && appointment.patientId !== userId) {
            throw new AppError_js_1.AppError('Forbidden', 403);
        }
        if (userType === client_1.UserType.DOCTOR && appointment.doctorId !== userId) {
            throw new AppError_js_1.AppError('Forbidden', 403);
        }
    }
    async notifyDoctor(doctorId, appointmentId) {
        await database_js_1.prisma.notification.create({
            data: {
                targetType: client_1.NotificationTargetType.DOCTOR,
                targetId: doctorId,
                title: 'New appointment request',
                message: `You have a new appointment request (#${appointmentId.slice(0, 8)})`,
                type: client_1.NotificationType.BOOKING,
            },
        });
    }
    async notifyPatient(patientId, title, appointmentId) {
        await database_js_1.prisma.notification.create({
            data: {
                targetType: client_1.NotificationTargetType.PATIENT,
                targetId: patientId,
                title,
                message: `Your appointment (#${appointmentId.slice(0, 8)}) has been updated`,
                type: client_1.NotificationType.APPOINTMENT,
            },
        });
    }
}
exports.AppointmentsService = AppointmentsService;
exports.appointmentsService = new AppointmentsService();
//# sourceMappingURL=appointments.service.js.map