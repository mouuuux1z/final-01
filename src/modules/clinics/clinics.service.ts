import { AppointmentStatus, AttendanceStatus, EntityStatus } from '@prisma/client';

import { AppError } from '../../utils/AppError.js';

import { logActivity } from '../../utils/activityLog.js';

import { hashPassword } from '../../utils/password.js';

import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';

import { appointmentsRepository } from '../appointments/appointments.repository.js';

import { appointmentsService } from '../appointments/appointments.service.js';

import { doctorsService } from '../doctors/doctors.service.js';

import { chatService } from '../chat/chat.service.js';

import { clinicsRepository } from './clinics.repository.js';

import { UserType } from '@prisma/client';

import type { z } from 'zod';

import type { createClinicDoctorSchema, clinicDoctorStatusSchema } from './clinics.schema.js';



type CreateClinicDoctorInput = z.infer<typeof createClinicDoctorSchema> & { certificate: string };

type ClinicDoctorStatusInput = z.infer<typeof clinicDoctorStatusSchema>;



export class ClinicsService {

  async getProfile(clinicId: string) {

    const clinic = await clinicsRepository.findById(clinicId);

    if (!clinic) throw new AppError('Clinic not found', 404);

    return clinic;

  }



  async updateProfile(
    clinicId: string,
    data: { name?: string; location?: string; phone?: string; city?: string; specialization?: string },
  ) {
    return clinicsRepository.update(clinicId, data);
  }



  async createDoctor(clinicId: string, input: CreateClinicDoctorInput) {

    const clinic = await clinicsRepository.findById(clinicId);

    if (!clinic) throw new AppError('Clinic not found', 404);

    if (clinic.status !== EntityStatus.ACTIVE) {

      throw new AppError('Clinic account is not active', 403);

    }



    const emailTaken = await clinicsRepository.emailExists(input.email);

    if (emailTaken) {

      throw new AppError('Email already registered', 409);

    }



    const serialNumber = await clinicsRepository.getNextDoctorSerialNumber();

    const passwordHash = await hashPassword(input.password);



    return clinicsRepository.createDoctor({
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
      await doctorsService.bootstrapDefaultAvailability(doctor.id);
      return clinicsRepository.getDoctorInClinic(clinicId, doctor.id);
    });

  }



  async assignDoctor(clinicId: string, doctorId: string) {

    const clinic = await clinicsRepository.findById(clinicId);

    if (!clinic) throw new AppError('Clinic not found', 404);

    if (clinic.status !== EntityStatus.ACTIVE) {

      throw new AppError('Clinic account is not active', 403);

    }



    const doctor = await clinicsRepository.findDoctorById(doctorId);

    if (!doctor) throw new AppError('Doctor not found', 404);

    if (doctor.clinicId && doctor.clinicId !== clinicId) {

      throw new AppError('Doctor already belongs to another clinic', 409);

    }



    return clinicsRepository.assignDoctor(clinicId, doctorId);

  }



  async updateDoctorStatus(clinicId: string, doctorId: string, input: ClinicDoctorStatusInput) {

    const doctor = await clinicsRepository.findDoctorById(doctorId);

    if (!doctor || doctor.clinicId !== clinicId) {

      throw new AppError('Doctor not found in this clinic', 404);

    }



    const result = await clinicsRepository.updateDoctorStatus(

      clinicId,

      doctorId,

      input.status,

      input.disableReason,

    );



    if (result.count === 0) {

      throw new AppError('Doctor not found in this clinic', 404);

    }



    const updated = await clinicsRepository.getDoctorInClinic(clinicId, doctorId);

    return updated;

  }

  private async assertDoctorInClinic(clinicId: string, doctorId: string) {
    const doctor = await clinicsRepository.getDoctorInClinic(clinicId, doctorId);
    if (!doctor) throw new AppError('Doctor not found in this clinic', 404);
    return doctor;
  }

  async getDoctorAppointments(clinicId: string, doctorId: string, query: Record<string, unknown>) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    await appointmentsService.processPastUnmarkedAppointments({ doctorId });
    const pagination = parsePagination(query);
    const { items, total } = await appointmentsRepository.findMany(
      {
        doctorId,
        status: query.status as AppointmentStatus | undefined,
        from: query.from as Date | undefined,
        to: query.to as Date | undefined,
      },
      pagination,
    );
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async getDoctorAvailability(clinicId: string, doctorId: string, query: Record<string, unknown>) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return doctorsService.getMyAvailability(doctorId, {
      date: query.date as Date | undefined,
      from: query.from as Date | undefined,
      to: query.to as Date | undefined,
      availableOnly: query.availableOnly === 'true' || query.availableOnly === true,
    });
  }

  async getDoctorSchedules(clinicId: string, doctorId: string) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return doctorsService.getSchedules(doctorId);
  }

  async generateDoctorRecurringAvailability(
    clinicId: string,
    doctorId: string,
    input: Parameters<typeof doctorsService.generateRecurringAvailability>[1],
  ) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return doctorsService.generateRecurringAvailability(doctorId, input);
  }

  async generateDoctorAvailability(
    clinicId: string,
    doctorId: string,
    input: Parameters<typeof doctorsService.generateAvailability>[1],
  ) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return doctorsService.generateAvailability(doctorId, input);
  }

  async createDoctorAvailabilitySlot(clinicId: string, doctorId: string, date: Date, time: string) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return doctorsService.createAvailabilitySlot(doctorId, date, time);
  }

  async deleteDoctorAvailabilitySlot(clinicId: string, doctorId: string, slotId: string) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return doctorsService.deleteAvailabilitySlot(slotId, doctorId);
  }

  async manualBookForDoctor(
    clinicId: string,
    doctorId: string,
    data: Parameters<typeof appointmentsService.doctorManualBook>[1],
  ) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return appointmentsService.doctorManualBook(doctorId, data);
  }

  async acceptDoctorAppointment(clinicId: string, doctorId: string, appointmentId: string) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return appointmentsService.accept(appointmentId, doctorId);
  }

  async rejectDoctorAppointment(clinicId: string, doctorId: string, appointmentId: string) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return appointmentsService.reject(appointmentId, doctorId);
  }

  async markDoctorAppointmentAttendance(
    clinicId: string,
    doctorId: string,
    appointmentId: string,
    attendanceStatus: AttendanceStatus,
  ) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return appointmentsService.markAttendance(appointmentId, doctorId, attendanceStatus);
  }

  async getDoctorChatMessages(
    clinicId: string,
    doctorId: string,
    patientId: string,
    query: Record<string, unknown>,
  ) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return chatService.getConversation(doctorId, patientId, doctorId, UserType.DOCTOR, query);
  }

  async sendDoctorChatMessage(
    clinicId: string,
    doctorId: string,
    patientId: string,
    message: string,
  ) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return chatService.sendMessage(
      { doctorId, patientId, message },
      doctorId,
      UserType.DOCTOR,
    );
  }

  async markDoctorChatAsRead(clinicId: string, doctorId: string, patientId: string) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return chatService.markAsRead(doctorId, patientId, doctorId, UserType.DOCTOR);
  }

  async getDoctorChatConversationReplies(clinicId: string, doctorId: string, patientId: string) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return chatService.getConversationReplies(doctorId, patientId, doctorId, UserType.DOCTOR);
  }

  async updateDoctorChatConversationReplies(
    clinicId: string,
    doctorId: string,
    patientId: string,
    repliesEnabled: boolean,
  ) {
    await this.assertDoctorInClinic(clinicId, doctorId);
    return chatService.updateConversationReplies(
      doctorId,
      patientId,
      repliesEnabled,
      doctorId,
      UserType.DOCTOR,
    );
  }

  async setDoctorOnlineStatus(clinicId: string, doctorId: string, isOnline: boolean) {
    const doctor = await this.assertDoctorInClinic(clinicId, doctorId);
    if (doctor.status !== EntityStatus.ACTIVE) {
      throw new AppError('Doctor account is not active', 403);
    }
    await doctorsService.setOnlineStatus(doctorId, isOnline);
    return clinicsRepository.getDoctorInClinic(clinicId, doctorId);
  }

  async removeDoctor(clinicId: string, doctorId: string) {

    const result = await clinicsRepository.removeDoctor(clinicId, doctorId);

    if (result.count === 0) throw new AppError('Doctor not found in clinic', 404);

  }



  async listAll(query: Record<string, unknown>) {

    const pagination = parsePagination(query);

    const status = query.status as EntityStatus | undefined;

    const { items, total } = await clinicsRepository.findMany(pagination, status);

    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };

  }



  async listPending(query: Record<string, unknown>) {

    return this.listAll({ ...query, status: EntityStatus.PENDING });

  }



  async adminUpdate(id: string, data: Record<string, unknown>, adminName?: string) {

    const clinic = await clinicsRepository.findById(id);

    if (!clinic) throw new AppError('Clinic not found', 404);



    const updated = await clinicsRepository.update(id, data as never);



    if (data.status && adminName) {

      await logActivity('VERIFY_CLINIC', adminName, `Clinic ${id} -> ${String(data.status)}`);

    }



    return updated;

  }

}



export const clinicsService = new ClinicsService();

