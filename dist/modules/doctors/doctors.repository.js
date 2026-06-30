"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorsRepository = exports.DoctorsRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
const slotGenerator_js_1 = require("../../utils/slotGenerator.js");
const prismaFilters_js_1 = require("../../utils/prismaFilters.js");
class DoctorsRepository {
    async findMany(filters, pagination) {
        const where = {
            status: filters.status ?? client_1.EntityStatus.ACTIVE,
        };
        if (filters.city)
            where.city = (0, prismaFilters_js_1.textContains)(filters.city);
        if (filters.specialization) {
            const terms = filters.specialization
                .split('|')
                .map((term) => term.trim())
                .filter(Boolean);
            if (terms.length === 1) {
                where.specialization = (0, prismaFilters_js_1.textContains)(terms[0]);
            }
            else if (terms.length > 1) {
                const specFilter = {
                    OR: terms.map((term) => ({ specialization: (0, prismaFilters_js_1.textContains)(term) })),
                };
                where.AND = Array.isArray(where.AND)
                    ? [...where.AND, specFilter]
                    : where.AND
                        ? [where.AND, specFilter]
                        : [specFilter];
            }
        }
        if (filters.q) {
            where.OR = [
                { name: (0, prismaFilters_js_1.textContains)(filters.q) },
                { specialization: (0, prismaFilters_js_1.textContains)(filters.q) },
                { city: (0, prismaFilters_js_1.textContains)(filters.q) },
                { location: (0, prismaFilters_js_1.textContains)(filters.q) },
                { clinic: { name: (0, prismaFilters_js_1.textContains)(filters.q) } },
            ];
        }
        const [items, total] = await Promise.all([
            database_js_1.prisma.doctor.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { rating: 'desc' },
                select: {
                    id: true,
                    serialNumber: true,
                    name: true,
                    email: true,
                    specialization: true,
                    phone: true,
                    city: true,
                    description: true,
                    image: true,
                    location: true,
                    rating: true,
                    ratingCount: true,
                    status: true,
                    isOnline: true,
                    clinicId: true,
                    clinic: { select: { id: true, name: true, location: true } },
                },
            }),
            database_js_1.prisma.doctor.count({ where }),
        ]);
        return { items, total };
    }
    async findManyAdmin(filters, pagination) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.city)
            where.city = (0, prismaFilters_js_1.textContains)(filters.city);
        if (filters.specialization) {
            const terms = filters.specialization
                .split('|')
                .map((term) => term.trim())
                .filter(Boolean);
            if (terms.length === 1) {
                where.specialization = (0, prismaFilters_js_1.textContains)(terms[0]);
            }
            else if (terms.length > 1) {
                const specFilter = {
                    OR: terms.map((term) => ({ specialization: (0, prismaFilters_js_1.textContains)(term) })),
                };
                where.AND = Array.isArray(where.AND)
                    ? [...where.AND, specFilter]
                    : where.AND
                        ? [where.AND, specFilter]
                        : [specFilter];
            }
        }
        if (filters.q) {
            where.OR = [
                { name: (0, prismaFilters_js_1.textContains)(filters.q) },
                { email: (0, prismaFilters_js_1.textContains)(filters.q) },
                { specialization: (0, prismaFilters_js_1.textContains)(filters.q) },
                { city: (0, prismaFilters_js_1.textContains)(filters.q) },
                { location: (0, prismaFilters_js_1.textContains)(filters.q) },
            ];
        }
        const [items, total] = await Promise.all([
            database_js_1.prisma.doctor.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    serialNumber: true,
                    name: true,
                    email: true,
                    specialization: true,
                    phone: true,
                    city: true,
                    description: true,
                    image: true,
                    location: true,
                    rating: true,
                    ratingCount: true,
                    status: true,
                    isOnline: true,
                    disableReason: true,
                    clinicId: true,
                    createdAt: true,
                    clinic: { select: { id: true, name: true, location: true } },
                },
            }),
            database_js_1.prisma.doctor.count({ where }),
        ]);
        return { items, total };
    }
    async findById(id) {
        return database_js_1.prisma.doctor.findUnique({
            where: { id },
            include: {
                clinic: { select: { id: true, name: true, location: true, phone: true } },
                schedules: true,
                chatSettings: true,
                _count: { select: { appointments: true, ratings: true } },
            },
        });
    }
    async findByIdPublic(id) {
        return database_js_1.prisma.doctor.findFirst({
            where: { id, status: client_1.EntityStatus.ACTIVE },
            select: {
                id: true,
                serialNumber: true,
                name: true,
                specialization: true,
                phone: true,
                city: true,
                location: true,
                clinicInfo: true,
                description: true,
                image: true,
                rating: true,
                ratingCount: true,
                isOnline: true,
                clinic: { select: { id: true, name: true, location: true } },
                schedules: true,
            },
        });
    }
    async update(id, data) {
        return database_js_1.prisma.doctor.update({
            where: { id },
            data,
            select: {
                id: true,
                serialNumber: true,
                name: true,
                email: true,
                specialization: true,
                phone: true,
                city: true,
                location: true,
                description: true,
                image: true,
                certificate: true,
                status: true,
                isOnline: true,
                lastActive: true,
                clinicId: true,
            },
        });
    }
    async delete(id) {
        return database_js_1.prisma.doctor.delete({ where: { id } });
    }
    async updateOnlineStatus(id, isOnline) {
        return database_js_1.prisma.doctor.update({
            where: { id },
            data: { isOnline, lastActive: new Date() },
            select: { id: true, isOnline: true, lastActive: true },
        });
    }
    async getSchedules(doctorId) {
        return database_js_1.prisma.doctorSchedule.findMany({
            where: { doctorId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }
    async createSchedule(doctorId, data) {
        return database_js_1.prisma.doctorSchedule.create({ data: { doctorId, ...data } });
    }
    async updateSchedule(scheduleId, doctorId, data) {
        return database_js_1.prisma.doctorSchedule.update({
            where: { id: scheduleId, doctorId },
            data,
        });
    }
    async upsertScheduleByDay(doctorId, dayOfWeek, data) {
        return database_js_1.prisma.doctorSchedule.upsert({
            where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: dayOfWeek } },
            create: { doctorId, dayOfWeek: dayOfWeek, ...data },
            update: data,
        });
    }
    async deleteSchedule(scheduleId, doctorId) {
        return database_js_1.prisma.doctorSchedule.delete({ where: { id: scheduleId, doctorId } });
    }
    async getAvailabilitySlots(doctorId, filters) {
        const where = { doctorId };
        if (filters.date) {
            const start = (0, slotGenerator_js_1.normalizeDateOnly)(filters.date);
            const end = (0, slotGenerator_js_1.addDaysLocal)(start, 1);
            where.date = { gte: start, lt: end };
        }
        else if (filters.from || filters.to) {
            where.date = {};
            if (filters.from)
                where.date.gte = filters.from;
            if (filters.to)
                where.date.lte = filters.to;
        }
        return database_js_1.prisma.doctorAvailabilitySlot.findMany({
            where,
            orderBy: [{ date: 'asc' }, { time: 'asc' }],
        });
    }
    async createAvailabilitySlot(doctorId, date, time) {
        return database_js_1.prisma.doctorAvailabilitySlot.create({
            data: { doctorId, date, time },
        });
    }
    async createManyAvailabilitySlots(doctorId, date, times) {
        const normalizedDate = (0, slotGenerator_js_1.normalizeDateOnly)(date);
        if (times.length === 0) {
            return { count: 0 };
        }
        const existing = await this.getAvailabilitySlotsForDate(doctorId, normalizedDate);
        const existingTimes = new Set(existing.map((slot) => slot.time));
        const uniqueTimes = [...new Set(times)].filter((time) => !existingTimes.has(time));
        if (uniqueTimes.length === 0) {
            return { count: 0 };
        }
        return database_js_1.prisma.doctorAvailabilitySlot.createMany({
            data: uniqueTimes.map((time) => ({ doctorId, date: normalizedDate, time })),
        });
    }
    async getAvailabilitySlotsForDate(doctorId, date) {
        const start = (0, slotGenerator_js_1.normalizeDateOnly)(date);
        const end = (0, slotGenerator_js_1.addDaysLocal)(start, 1);
        return database_js_1.prisma.doctorAvailabilitySlot.findMany({
            where: {
                doctorId,
                date: { gte: start, lt: end },
            },
            orderBy: { time: 'asc' },
        });
    }
    async deleteAvailabilitySlot(slotId, doctorId) {
        return database_js_1.prisma.doctorAvailabilitySlot.delete({
            where: { id: slotId, doctorId, isBooked: false },
        });
    }
    async getUnbookedSlotsUpToDate(doctorId, upToDate) {
        return database_js_1.prisma.doctorAvailabilitySlot.findMany({
            where: {
                doctorId,
                isBooked: false,
                date: { lte: upToDate },
            },
            select: { id: true, date: true, time: true },
        });
    }
    async deleteAvailabilitySlotsByIds(ids, doctorId) {
        if (ids.length === 0) {
            return { count: 0 };
        }
        return database_js_1.prisma.doctorAvailabilitySlot.deleteMany({
            where: {
                id: { in: ids },
                doctorId,
                isBooked: false,
            },
        });
    }
    async findDoctorsByClinic(clinicId) {
        return database_js_1.prisma.doctor.findMany({
            where: { clinicId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.DoctorsRepository = DoctorsRepository;
exports.doctorsRepository = new DoctorsRepository();
//# sourceMappingURL=doctors.repository.js.map