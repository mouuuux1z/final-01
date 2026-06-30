"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentsRepository = exports.AppointmentsRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
const slotGenerator_js_1 = require("../../utils/slotGenerator.js");
class AppointmentsRepository {
    dateOnlyRange(date) {
        const start = (0, slotGenerator_js_1.normalizeDateOnly)(date);
        return { gte: start, lt: (0, slotGenerator_js_1.addDaysLocal)(start, 1) };
    }
    async findById(id) {
        return database_js_1.prisma.appointment.findUnique({
            where: { id },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                        phone: true,
                        city: true,
                        location: true,
                        image: true,
                    },
                },
                patient: {
                    select: { id: true, name: true, email: true, phone: true, attendancePoints: true },
                },
            },
        });
    }
    async findMany(filters, pagination) {
        const where = {};
        if (filters.patientId)
            where.patientId = filters.patientId;
        if (filters.doctorId)
            where.doctorId = filters.doctorId;
        if (filters.status)
            where.status = filters.status;
        if (filters.from || filters.to) {
            where.date = {};
            if (filters.from)
                where.date.gte = filters.from;
            if (filters.to)
                where.date.lte = filters.to;
        }
        const [items, total] = await Promise.all([
            database_js_1.prisma.appointment.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: [{ date: 'desc' }, { time: 'desc' }],
                include: {
                    doctor: { select: { id: true, name: true, specialization: true, image: true } },
                    patient: { select: { id: true, name: true, phone: true, attendancePoints: true } },
                },
            }),
            database_js_1.prisma.appointment.count({ where }),
        ]);
        return { items, total };
    }
    async create(data) {
        return database_js_1.prisma.$transaction(async (tx) => {
            const normalizedDate = (0, slotGenerator_js_1.normalizeDateOnly)(data.date);
            const slot = await tx.doctorAvailabilitySlot.findFirst({
                where: {
                    doctorId: data.doctorId,
                    date: this.dateOnlyRange(normalizedDate),
                    time: data.time,
                    isBooked: false,
                },
            });
            if (!slot)
                throw new Error('SLOT_UNAVAILABLE');
            await tx.doctorAvailabilitySlot.update({
                where: { id: slot.id },
                data: { isBooked: true },
            });
            return tx.appointment.create({
                data: {
                    ...data,
                    date: normalizedDate,
                    status: client_1.AppointmentStatus.PENDING,
                },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            specialization: true,
                            phone: true,
                            city: true,
                            location: true,
                            image: true,
                        },
                    },
                    patient: { select: { id: true, name: true, phone: true } },
                },
            });
        });
    }
    async updateStatus(id, status) {
        return database_js_1.prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                doctor: { select: { id: true, name: true } },
                patient: { select: { id: true, name: true } },
            },
        });
    }
    async createDoctorManual(data) {
        return database_js_1.prisma.$transaction(async (tx) => {
            const normalizedDate = (0, slotGenerator_js_1.normalizeDateOnly)(data.date);
            const slot = await tx.doctorAvailabilitySlot.findFirst({
                where: {
                    doctorId: data.doctorId,
                    date: this.dateOnlyRange(normalizedDate),
                    time: data.time,
                    isBooked: false,
                },
            });
            if (!slot)
                throw new Error('SLOT_UNAVAILABLE');
            await tx.doctorAvailabilitySlot.update({
                where: { id: slot.id },
                data: { isBooked: true },
            });
            return tx.appointment.create({
                data: {
                    doctorId: data.doctorId,
                    patientId: null,
                    patientName: data.patientName,
                    patientPhone: data.patientPhone,
                    date: normalizedDate,
                    time: data.time,
                    notes: data.notes,
                    status: client_1.AppointmentStatus.CONFIRMED,
                    attendanceStatus: client_1.AttendanceStatus.PENDING,
                },
                include: {
                    doctor: { select: { id: true, name: true, specialization: true } },
                },
            });
        });
    }
    async updateAttendance(id, attendanceStatus, status) {
        return database_js_1.prisma.appointment.update({
            where: { id },
            data: {
                attendanceStatus: attendanceStatus,
                ...(status ? { status } : {}),
            },
            include: {
                doctor: { select: { id: true, name: true } },
                patient: { select: { id: true, name: true, phone: true } },
            },
        });
    }
    async cancel(id) {
        return database_js_1.prisma.$transaction(async (tx) => {
            const appointment = await tx.appointment.findUnique({ where: { id } });
            if (!appointment)
                throw new Error('NOT_FOUND');
            await tx.doctorAvailabilitySlot.updateMany({
                where: {
                    doctorId: appointment.doctorId,
                    date: appointment.date,
                    time: appointment.time,
                },
                data: { isBooked: false },
            });
            return tx.appointment.update({
                where: { id },
                data: { status: client_1.AppointmentStatus.CANCELLED },
                include: {
                    doctor: { select: { id: true, name: true } },
                    patient: { select: { id: true, name: true } },
                },
            });
        });
    }
    async reject(id) {
        return database_js_1.prisma.$transaction(async (tx) => {
            const appointment = await tx.appointment.findUnique({ where: { id } });
            if (!appointment)
                throw new Error('NOT_FOUND');
            await tx.doctorAvailabilitySlot.updateMany({
                where: {
                    doctorId: appointment.doctorId,
                    date: appointment.date,
                    time: appointment.time,
                },
                data: { isBooked: false },
            });
            return tx.appointment.update({
                where: { id },
                data: { status: client_1.AppointmentStatus.REJECTED },
                include: {
                    doctor: { select: { id: true, name: true } },
                    patient: { select: { id: true, name: true } },
                },
            });
        });
    }
    async reschedule(id, date, time) {
        return database_js_1.prisma.$transaction(async (tx) => {
            const appointment = await tx.appointment.findUnique({ where: { id } });
            if (!appointment)
                throw new Error('NOT_FOUND');
            const normalizedDate = (0, slotGenerator_js_1.normalizeDateOnly)(date);
            const newSlot = await tx.doctorAvailabilitySlot.findFirst({
                where: {
                    doctorId: appointment.doctorId,
                    date: this.dateOnlyRange(normalizedDate),
                    time,
                    isBooked: false,
                },
            });
            if (!newSlot)
                throw new Error('SLOT_UNAVAILABLE');
            await tx.doctorAvailabilitySlot.updateMany({
                where: {
                    doctorId: appointment.doctorId,
                    date: this.dateOnlyRange(appointment.date),
                    time: appointment.time,
                },
                data: { isBooked: false },
            });
            await tx.doctorAvailabilitySlot.update({
                where: { id: newSlot.id },
                data: { isBooked: true },
            });
            return tx.appointment.update({
                where: { id },
                data: { date: normalizedDate, time, status: client_1.AppointmentStatus.PENDING },
                include: {
                    doctor: { select: { id: true, name: true } },
                },
            });
        });
    }
}
exports.AppointmentsRepository = AppointmentsRepository;
exports.appointmentsRepository = new AppointmentsRepository();
//# sourceMappingURL=appointments.repository.js.map