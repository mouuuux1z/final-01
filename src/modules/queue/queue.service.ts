import { AppointmentStatus, UserType } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import { formatDateKey, normalizeDateOnly } from '../../utils/slotGenerator.js';
import { emitToUser } from '../../websocket/emitter.js';
import { SocketEvents } from '../../websocket/events.js';
import { queueRepository } from './queue.repository.js';

const INACTIVE_QUEUE_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CANCELLED,
  AppointmentStatus.REJECTED,
];

function isQueueEligibleStatus(status: AppointmentStatus): boolean {
  return !INACTIVE_QUEUE_STATUSES.includes(status);
}

export type QueueSessionView = {
  isActive: boolean;
  isCompleted: boolean;
  currentNumber: number;
  startedAt: Date | null;
  completedAt: Date | null;
};

export type QueueUpdatedPayload = {
  doctorId: string;
  date: string;
  session: QueueSessionView;
  currentNumber: number;
  maxQueueNumber: number;
  totalActive: number;
};

export class QueueService {
  private toSessionView(session: {
    isActive: boolean;
    isCompleted: boolean;
    currentNumber: number;
    startedAt: Date | null;
    completedAt: Date | null;
  }): QueueSessionView {
    return {
      isActive: session.isActive,
      isCompleted: session.isCompleted,
      currentNumber: session.currentNumber,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    };
  }

  private async buildDoctorQueueState(doctorId: string, date: Date) {
    await queueRepository.ensureQueueNumbersForDay(doctorId, date);

    const [appointments, session] = await Promise.all([
      queueRepository.listDayAppointments(doctorId, date),
      queueRepository.getSession(doctorId, date),
    ]);

    const activeAppointments = appointments.filter((item) => isQueueEligibleStatus(item.status));
    const maxQueueNumber = activeAppointments.reduce(
      (max, item) => Math.max(max, item.queueNumber ?? 0),
      0,
    );

    const defaultSession: QueueSessionView = {
      isActive: false,
      isCompleted: false,
      currentNumber: 0,
      startedAt: null,
      completedAt: null,
    };

    return {
      session: session ? this.toSessionView(session) : defaultSession,
      appointments,
      activeAppointments,
      maxQueueNumber,
      totalActive: activeAppointments.length,
    };
  }

  async getTodayQueue(doctorId: string, dateInput?: Date) {
    const date = normalizeDateOnly(dateInput ?? new Date());
    const state = await this.buildDoctorQueueState(doctorId, date);

    return {
      date: formatDateKey(date),
      session: state.session,
      appointments: state.appointments,
      totalActive: state.totalActive,
      maxQueueNumber: state.maxQueueNumber,
    };
  }

  async startReception(doctorId: string) {
    const date = normalizeDateOnly(new Date());
    const state = await this.buildDoctorQueueState(doctorId, date);

    if (state.totalActive === 0) {
      throw new AppError('No appointments in queue for today', 400);
    }

    if (state.session.isActive && !state.session.isCompleted) {
      throw new AppError('Reception is already active', 409);
    }

    if (state.session.isCompleted) {
      throw new AppError('Today queue is already completed', 400);
    }

    const saved = await queueRepository.saveSession(doctorId, date, {
      currentNumber: 1,
      isActive: true,
      isCompleted: false,
      startedAt: new Date(),
      completedAt: null,
    });

    return this.emitQueueUpdate(doctorId, date, saved);
  }

  async advanceQueue(doctorId: string) {
    const date = normalizeDateOnly(new Date());
    const state = await this.buildDoctorQueueState(doctorId, date);
    const session = await queueRepository.getSession(doctorId, date);

    if (!session?.isActive || session.isCompleted) {
      throw new AppError('Reception is not active', 400);
    }

    if (state.maxQueueNumber === 0) {
      throw new AppError('No appointments in queue for today', 400);
    }

    if (session.currentNumber >= state.maxQueueNumber) {
      const saved = await queueRepository.saveSession(doctorId, date, {
        currentNumber: session.currentNumber,
        isActive: false,
        isCompleted: true,
        startedAt: session.startedAt,
        completedAt: new Date(),
      });
      return this.emitQueueUpdate(doctorId, date, saved);
    }

    const saved = await queueRepository.saveSession(doctorId, date, {
      currentNumber: session.currentNumber + 1,
      isActive: true,
      isCompleted: false,
      startedAt: session.startedAt,
      completedAt: null,
    });

    return this.emitQueueUpdate(doctorId, date, saved);
  }

  async getAppointmentQueueStatus(appointmentId: string, userId: string, userType: UserType) {
    const appointment = await queueRepository.getAppointmentWithDoctor(appointmentId);
    if (!appointment) throw new AppError('Appointment not found', 404);
    if (appointment.isPrivate) {
      throw new AppError('Queue tracking is not available for this appointment', 400);
    }

    if (userType === UserType.PATIENT) {
      if (appointment.patientId !== userId) throw new AppError('Forbidden', 403);
    } else if (userType === UserType.DOCTOR) {
      if (appointment.doctorId !== userId) throw new AppError('Forbidden', 403);
    } else if (userType !== UserType.CLINIC) {
      throw new AppError('Forbidden', 403);
    }

    const date = normalizeDateOnly(appointment.date);
    await queueRepository.ensureQueueNumbersForDay(appointment.doctorId, date);

    const refreshed = await queueRepository.getAppointmentWithDoctor(appointmentId);
    if (!refreshed?.queueNumber) {
      throw new AppError('Queue number is not assigned yet', 400);
    }

    const session = await queueRepository.getSession(appointment.doctorId, date);
    const currentNumber = session?.currentNumber ?? 0;
    const patientsAhead = await queueRepository.countPatientsAhead(
      appointment.doctorId,
      date,
      currentNumber,
      refreshed.queueNumber,
    );

    const clinicName =
      refreshed.doctor.clinicInfo?.trim() ||
      refreshed.doctor.city?.trim() ||
      refreshed.doctor.location?.trim() ||
      null;

    return {
      appointmentId: refreshed.id,
      doctorId: refreshed.doctorId,
      doctorName: refreshed.doctor.name,
      clinicName,
      date: formatDateKey(date),
      time: refreshed.time,
      queueNumber: refreshed.queueNumber,
      currentNumber,
      patientsAhead,
      isActive: session?.isActive ?? false,
      isCompleted: session?.isCompleted ?? false,
      isCancelled: !isQueueEligibleStatus(refreshed.status),
      isYourTurn:
        Boolean(session?.isActive) &&
        !session?.isCompleted &&
        refreshed.queueNumber === currentNumber,
    };
  }

  private async emitQueueUpdate(
    doctorId: string,
    date: Date,
    session: {
      isActive: boolean;
      isCompleted: boolean;
      currentNumber: number;
      startedAt: Date | null;
      completedAt: Date | null;
    },
  ) {
    const state = await this.buildDoctorQueueState(doctorId, date);
    const payload: QueueUpdatedPayload = {
      doctorId,
      date: formatDateKey(date),
      session: this.toSessionView(session),
      currentNumber: session.currentNumber,
      maxQueueNumber: state.maxQueueNumber,
      totalActive: state.totalActive,
    };

    emitToUser(UserType.DOCTOR, doctorId, SocketEvents.QUEUE_UPDATED, payload);

    const patientIds = new Set<string>();
    for (const item of state.activeAppointments) {
      if (item.patientId) patientIds.add(item.patientId);
    }

    for (const patientId of patientIds) {
      emitToUser(UserType.PATIENT, patientId, SocketEvents.QUEUE_UPDATED, payload);
    }

    return {
      date: formatDateKey(date),
      session: payload.session,
      appointments: state.appointments,
      totalActive: state.totalActive,
      maxQueueNumber: state.maxQueueNumber,
    };
  }
}

export const queueService = new QueueService();
