"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicsService = exports.ClinicsService = void 0;
const client_1 = require("@prisma/client");
const AppError_js_1 = require("../../utils/AppError.js");
const activityLog_js_1 = require("../../utils/activityLog.js");
const password_js_1 = require("../../utils/password.js");
const pagination_js_1 = require("../../utils/pagination.js");
const appointments_repository_js_1 = require("../appointments/appointments.repository.js");
const appointments_service_js_1 = require("../appointments/appointments.service.js");
const doctors_service_js_1 = require("../doctors/doctors.service.js");
const chat_service_js_1 = require("../chat/chat.service.js");
const clinics_repository_js_1 = require("./clinics.repository.js");
const client_2 = require("@prisma/client");
class ClinicsService {
    async getProfile(clinicId) {
        const clinic = await clinics_repository_js_1.clinicsRepository.findById(clinicId);
        if (!clinic)
            throw new AppError_js_1.AppError('Clinic not found', 404);
        return clinic;
    }
    async updateProfile(clinicId, data) {
        return clinics_repository_js_1.clinicsRepository.update(clinicId, data);
    }
    async createDoctor(clinicId, input) {
        const clinic = await clinics_repository_js_1.clinicsRepository.findById(clinicId);
        if (!clinic)
            throw new AppError_js_1.AppError('Clinic not found', 404);
        if (clinic.status !== client_1.EntityStatus.ACTIVE) {
            throw new AppError_js_1.AppError('Clinic account is not active', 403);
        }
        const emailTaken = await clinics_repository_js_1.clinicsRepository.emailExists(input.email);
        if (emailTaken) {
            throw new AppError_js_1.AppError('Email already registered', 409);
        }
        const serialNumber = await clinics_repository_js_1.clinicsRepository.getNextDoctorSerialNumber();
        const passwordHash = await (0, password_js_1.hashPassword)(input.password);
        return clinics_repository_js_1.clinicsRepository.createDoctor({
            serialNumber,
            name: input.name,
            email: input.email,
            password: passwordHash,
            phone: input.phone,
            specialization: input.specialization,
            city: input.city,
            location: input.location,
            clinicInfo: input.clinicInfo,
            description: input.description,
            certificate: input.certificate,
            clinicId,
        }).then(async (doctor) => {
            await doctors_service_js_1.doctorsService.bootstrapDefaultAvailability(doctor.id);
            return clinics_repository_js_1.clinicsRepository.getDoctorInClinic(clinicId, doctor.id);
        });
    }
    async assignDoctor(clinicId, doctorId) {
        const clinic = await clinics_repository_js_1.clinicsRepository.findById(clinicId);
        if (!clinic)
            throw new AppError_js_1.AppError('Clinic not found', 404);
        if (clinic.status !== client_1.EntityStatus.ACTIVE) {
            throw new AppError_js_1.AppError('Clinic account is not active', 403);
        }
        const doctor = await clinics_repository_js_1.clinicsRepository.findDoctorById(doctorId);
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        if (doctor.clinicId && doctor.clinicId !== clinicId) {
            throw new AppError_js_1.AppError('Doctor already belongs to another clinic', 409);
        }
        return clinics_repository_js_1.clinicsRepository.assignDoctor(clinicId, doctorId);
    }
    async updateDoctorStatus(clinicId, doctorId, input) {
        const doctor = await clinics_repository_js_1.clinicsRepository.findDoctorById(doctorId);
        if (!doctor || doctor.clinicId !== clinicId) {
            throw new AppError_js_1.AppError('Doctor not found in this clinic', 404);
        }
        const result = await clinics_repository_js_1.clinicsRepository.updateDoctorStatus(clinicId, doctorId, input.status, input.disableReason);
        if (result.count === 0) {
            throw new AppError_js_1.AppError('Doctor not found in this clinic', 404);
        }
        const updated = await clinics_repository_js_1.clinicsRepository.getDoctorInClinic(clinicId, doctorId);
        return updated;
    }
    async assertDoctorInClinic(clinicId, doctorId) {
        const doctor = await clinics_repository_js_1.clinicsRepository.getDoctorInClinic(clinicId, doctorId);
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found in this clinic', 404);
        return doctor;
    }
    async getDoctorAppointments(clinicId, doctorId, query) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        await appointments_service_js_1.appointmentsService.processPastUnmarkedAppointments({ doctorId });
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await appointments_repository_js_1.appointmentsRepository.findMany({
            doctorId,
            status: query.status,
            from: query.from,
            to: query.to,
        }, pagination);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async getDoctorAvailability(clinicId, doctorId, query) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return doctors_service_js_1.doctorsService.getMyAvailability(doctorId, {
            date: query.date,
            from: query.from,
            to: query.to,
            availableOnly: query.availableOnly === 'true' || query.availableOnly === true,
        });
    }
    async getDoctorSchedules(clinicId, doctorId) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return doctors_service_js_1.doctorsService.getSchedules(doctorId);
    }
    async generateDoctorRecurringAvailability(clinicId, doctorId, input) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return doctors_service_js_1.doctorsService.generateRecurringAvailability(doctorId, input);
    }
    async generateDoctorAvailability(clinicId, doctorId, input) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return doctors_service_js_1.doctorsService.generateAvailability(doctorId, input);
    }
    async createDoctorAvailabilitySlot(clinicId, doctorId, date, time) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return doctors_service_js_1.doctorsService.createAvailabilitySlot(doctorId, date, time);
    }
    async deleteDoctorAvailabilitySlot(clinicId, doctorId, slotId) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return doctors_service_js_1.doctorsService.deleteAvailabilitySlot(slotId, doctorId);
    }
    async manualBookForDoctor(clinicId, doctorId, data) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return appointments_service_js_1.appointmentsService.doctorManualBook(doctorId, data);
    }
    async acceptDoctorAppointment(clinicId, doctorId, appointmentId) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return appointments_service_js_1.appointmentsService.accept(appointmentId, doctorId);
    }
    async rejectDoctorAppointment(clinicId, doctorId, appointmentId) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return appointments_service_js_1.appointmentsService.reject(appointmentId, doctorId);
    }
    async markDoctorAppointmentAttendance(clinicId, doctorId, appointmentId, attendanceStatus) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return appointments_service_js_1.appointmentsService.markAttendance(appointmentId, doctorId, attendanceStatus);
    }
    async getDoctorChatMessages(clinicId, doctorId, patientId, query) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return chat_service_js_1.chatService.getConversation(doctorId, patientId, doctorId, client_2.UserType.DOCTOR, query);
    }
    async sendDoctorChatMessage(clinicId, doctorId, patientId, message) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return chat_service_js_1.chatService.sendMessage({ doctorId, patientId, message }, doctorId, client_2.UserType.DOCTOR);
    }
    async markDoctorChatAsRead(clinicId, doctorId, patientId) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return chat_service_js_1.chatService.markAsRead(doctorId, patientId, doctorId, client_2.UserType.DOCTOR);
    }
    async getDoctorChatConversationReplies(clinicId, doctorId, patientId) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return chat_service_js_1.chatService.getConversationReplies(doctorId, patientId, doctorId, client_2.UserType.DOCTOR);
    }
    async updateDoctorChatConversationReplies(clinicId, doctorId, patientId, repliesEnabled) {
        await this.assertDoctorInClinic(clinicId, doctorId);
        return chat_service_js_1.chatService.updateConversationReplies(doctorId, patientId, repliesEnabled, doctorId, client_2.UserType.DOCTOR);
    }
    async setDoctorOnlineStatus(clinicId, doctorId, isOnline) {
        const doctor = await this.assertDoctorInClinic(clinicId, doctorId);
        if (doctor.status !== client_1.EntityStatus.ACTIVE) {
            throw new AppError_js_1.AppError('Doctor account is not active', 403);
        }
        await doctors_service_js_1.doctorsService.setOnlineStatus(doctorId, isOnline);
        return clinics_repository_js_1.clinicsRepository.getDoctorInClinic(clinicId, doctorId);
    }
    async removeDoctor(clinicId, doctorId) {
        const result = await clinics_repository_js_1.clinicsRepository.removeDoctor(clinicId, doctorId);
        if (result.count === 0)
            throw new AppError_js_1.AppError('Doctor not found in clinic', 404);
    }
    async listAll(query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const status = query.status;
        const { items, total } = await clinics_repository_js_1.clinicsRepository.findMany(pagination, status);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async listPending(query) {
        return this.listAll({ ...query, status: client_1.EntityStatus.PENDING });
    }
    async adminUpdate(id, data, adminName) {
        const clinic = await clinics_repository_js_1.clinicsRepository.findById(id);
        if (!clinic)
            throw new AppError_js_1.AppError('Clinic not found', 404);
        const updated = await clinics_repository_js_1.clinicsRepository.update(id, data);
        if (data.status && adminName) {
            await (0, activityLog_js_1.logActivity)('VERIFY_CLINIC', adminName, `Clinic ${id} -> ${String(data.status)}`);
        }
        return updated;
    }
}
exports.ClinicsService = ClinicsService;
exports.clinicsService = new ClinicsService();
//# sourceMappingURL=clinics.service.js.map