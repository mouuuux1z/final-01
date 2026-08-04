import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { addDaysLocal, normalizeDateOnly } from '../../utils/slotGenerator.js';

type QueueDbClient = Pick<typeof prisma, 'appointment'>;

const INACTIVE_QUEUE_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CANCELLED,
  AppointmentStatus.REJECTED,
];

function dateOnlyRange(date: Date) {
  const start = normalizeDateOnly(date);
  return { gte: start, lt: addDaysLocal(start, 1) };
}

export class QueueRepository {
  async getMaxQueueNumber(doctorId: string, date: Date, tx?: QueueDbClient): Promise<number> {
    const client = tx ?? prisma;
    const result = await client.appointment.aggregate({
      where: {
        doctorId,
        date: dateOnlyRange(date),
        isPrivate: false,
        queueNumber: { not: null },
      },
      _max: { queueNumber: true },
    });
    return result._max.queueNumber ?? 0;
  }

  async assignNextQueueNumber(
    doctorId: string,
    date: Date,
    isPrivate: boolean,
    tx: QueueDbClient,
  ): Promise<number | null> {
    if (isPrivate) return null;
    const max = await this.getMaxQueueNumber(doctorId, date, tx);
    return max + 1;
  }

  async ensureQueueNumbersForDay(doctorId: string, date: Date): Promise<void> {
    const normalizedDate = normalizeDateOnly(date);
    const missing = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: dateOnlyRange(normalizedDate),
        isPrivate: false,
        queueNumber: null,
      },
      orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
    });

    if (missing.length === 0) return;

    let next = await this.getMaxQueueNumber(doctorId, normalizedDate);
    for (const appointment of missing) {
      next += 1;
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { queueNumber: next },
      });
    }
  }

  async getSession(doctorId: string, date: Date) {
    return prisma.doctorQueueSession.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date: normalizeDateOnly(date),
        },
      },
    });
  }

  async listDayAppointments(doctorId: string, date: Date) {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: dateOnlyRange(date),
        isPrivate: false,
      },
      orderBy: [{ queueNumber: 'asc' }, { time: 'asc' }],
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true, clinicInfo: true, city: true, location: true } },
      },
    });
  }

  async listActiveQueueAppointments(doctorId: string, date: Date) {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: dateOnlyRange(date),
        isPrivate: false,
        status: { notIn: INACTIVE_QUEUE_STATUSES },
        queueNumber: { not: null },
      },
      orderBy: [{ queueNumber: 'asc' }],
    });
  }

  async countPatientsAhead(
    doctorId: string,
    date: Date,
    currentNumber: number,
    patientQueueNumber: number,
  ): Promise<number> {
    if (currentNumber >= patientQueueNumber) return 0;

    return prisma.appointment.count({
      where: {
        doctorId,
        date: dateOnlyRange(date),
        isPrivate: false,
        status: { notIn: INACTIVE_QUEUE_STATUSES },
        queueNumber: {
          gt: currentNumber,
          lte: patientQueueNumber,
        },
      },
    });
  }

  async saveSession(
    doctorId: string,
    date: Date,
    data: {
      currentNumber: number;
      isActive: boolean;
      isCompleted: boolean;
      startedAt?: Date | null;
      completedAt?: Date | null;
    },
  ) {
    return prisma.doctorQueueSession.upsert({
      where: {
        doctorId_date: {
          doctorId,
          date: normalizeDateOnly(date),
        },
      },
      create: {
        doctorId,
        date: normalizeDateOnly(date),
        currentNumber: data.currentNumber,
        isActive: data.isActive,
        isCompleted: data.isCompleted,
        startedAt: data.startedAt ?? null,
        completedAt: data.completedAt ?? null,
      },
      update: {
        currentNumber: data.currentNumber,
        isActive: data.isActive,
        isCompleted: data.isCompleted,
        startedAt: data.startedAt ?? undefined,
        completedAt: data.completedAt ?? undefined,
      },
    });
  }

  async getAppointmentWithDoctor(appointmentId: string) {
    return prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            clinicInfo: true,
            city: true,
            location: true,
            clinicId: true,
          },
        },
        patient: { select: { id: true, name: true } },
      },
    });
  }
}

export const queueRepository = new QueueRepository();
