import { NotificationTargetType, NotificationType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import {
  ATTENDANCE_COMMITMENT_DEDUCTION,
  ATTENDANCE_COMMITMENT_MAX,
  BOOKING_BLOCK_DAYS,
  normalizeCommitmentPoints,
} from '../constants/attendance.js';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function releaseExpiredBookingBlock(patientId: string): Promise<boolean> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { bookingBlockedUntil: true },
  });

  if (!patient?.bookingBlockedUntil || patient.bookingBlockedUntil > new Date()) {
    return false;
  }

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      bookingBlockedUntil: null,
      attendancePoints: ATTENDANCE_COMMITMENT_MAX,
    },
  });

  await prisma.notification.create({
    data: {
      targetType: NotificationTargetType.PATIENT,
      targetId: patientId,
      title: 'Commitment score restored',
      message: `Your commitment score has been restored to ${ATTENDANCE_COMMITMENT_MAX} points. You can book appointments again.`,
      type: NotificationType.SYSTEM,
    },
  });

  return true;
}

export async function applyNoShowPenalty(patientId: string): Promise<{
  attendancePoints: number;
  bookingBlockedUntil: Date | null;
  blocked: boolean;
}> {
  await releaseExpiredBookingBlock(patientId);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { attendancePoints: true, bookingBlockedUntil: true },
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (patient.bookingBlockedUntil && patient.bookingBlockedUntil > new Date()) {
    return {
      attendancePoints: normalizeCommitmentPoints(patient.attendancePoints),
      bookingBlockedUntil: patient.bookingBlockedUntil,
      blocked: true,
    };
  }

  const current = normalizeCommitmentPoints(patient.attendancePoints);
  const nextPoints = Math.max(0, current - ATTENDANCE_COMMITMENT_DEDUCTION);
  const bookingBlockedUntil = nextPoints === 0 ? addDays(new Date(), BOOKING_BLOCK_DAYS) : null;

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      attendancePoints: nextPoints,
      bookingBlockedUntil,
    },
  });

  if (bookingBlockedUntil) {
    await prisma.notification.create({
      data: {
        targetType: NotificationTargetType.PATIENT,
        targetId: patientId,
        title: 'Booking suspended',
        message: `Your commitment score reached zero. Booking is blocked for ${BOOKING_BLOCK_DAYS} days.`,
        type: NotificationType.SYSTEM,
      },
    });
  }

  return {
    attendancePoints: nextPoints,
    bookingBlockedUntil,
    blocked: bookingBlockedUntil !== null,
  };
}

export async function assertPatientCanBook(patientId: string): Promise<void> {
  await releaseExpiredBookingBlock(patientId);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { status: true, bookingBlockedUntil: true },
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (patient.bookingBlockedUntil && patient.bookingBlockedUntil > new Date()) {
    throw new AppError('Commitment booking block active', 403);
  }
}

export async function syncPatientCommitmentState(patientId: string) {
  await releaseExpiredBookingBlock(patientId);
  return prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      attendancePoints: true,
      bookingBlockedUntil: true,
    },
  });
}
