"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorsService = exports.DoctorsService = void 0;
const client_1 = require("@prisma/client");
const AppError_js_1 = require("../../utils/AppError.js");
const pagination_js_1 = require("../../utils/pagination.js");
const slotGenerator_js_1 = require("../../utils/slotGenerator.js");
const doctors_repository_js_1 = require("./doctors.repository.js");
class DoctorsService {
    async search(query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await doctors_repository_js_1.doctorsRepository.findMany({
            q: query.q,
            city: query.city,
            specialization: query.specialization,
            status: client_1.EntityStatus.ACTIVE,
        }, pagination);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async adminSearch(query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await doctors_repository_js_1.doctorsRepository.findManyAdmin({
            q: query.q,
            city: query.city,
            specialization: query.specialization,
            status: query.status,
        }, pagination);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async getProfile(id) {
        const doctor = await doctors_repository_js_1.doctorsRepository.findByIdPublic(id);
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        return doctor;
    }
    async getById(id) {
        const doctor = await doctors_repository_js_1.doctorsRepository.findById(id);
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        return doctor;
    }
    async updateProfile(doctorId, data, image, certificate) {
        const updateData = { ...data };
        if (image)
            updateData.image = image;
        if (certificate)
            updateData.certificate = certificate;
        return doctors_repository_js_1.doctorsRepository.update(doctorId, updateData);
    }
    async adminUpdate(id, data) {
        const doctor = await doctors_repository_js_1.doctorsRepository.findById(id);
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        return doctors_repository_js_1.doctorsRepository.update(id, data);
    }
    async deleteDoctor(id) {
        const doctor = await doctors_repository_js_1.doctorsRepository.findById(id);
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        await doctors_repository_js_1.doctorsRepository.delete(id);
    }
    async setOnlineStatus(doctorId, isOnline) {
        return doctors_repository_js_1.doctorsRepository.updateOnlineStatus(doctorId, isOnline);
    }
    async getSchedules(doctorId) {
        return doctors_repository_js_1.doctorsRepository.getSchedules(doctorId);
    }
    async createSchedule(doctorId, data) {
        try {
            return await doctors_repository_js_1.doctorsRepository.createSchedule(doctorId, data);
        }
        catch {
            throw new AppError_js_1.AppError('Schedule already exists for this day', 409);
        }
    }
    async updateSchedule(scheduleId, doctorId, data) {
        try {
            return await doctors_repository_js_1.doctorsRepository.updateSchedule(scheduleId, doctorId, data);
        }
        catch {
            throw new AppError_js_1.AppError('Schedule not found', 404);
        }
    }
    async deleteSchedule(scheduleId, doctorId) {
        try {
            await doctors_repository_js_1.doctorsRepository.deleteSchedule(scheduleId, doctorId);
        }
        catch {
            throw new AppError_js_1.AppError('Schedule not found', 404);
        }
    }
    async getAvailability(doctorId, filters) {
        return doctors_repository_js_1.doctorsRepository.getAvailabilitySlots(doctorId, filters);
    }
    async createAvailabilitySlot(doctorId, date, time) {
        try {
            return await doctors_repository_js_1.doctorsRepository.createAvailabilitySlot(doctorId, date, time);
        }
        catch {
            throw new AppError_js_1.AppError('Slot already exists', 409);
        }
    }
    async bulkCreateAvailability(doctorId, date, times) {
        return doctors_repository_js_1.doctorsRepository.createManyAvailabilitySlots(doctorId, (0, slotGenerator_js_1.normalizeDateOnly)(date), times);
    }
    async generateAvailability(doctorId, input) {
        const date = (0, slotGenerator_js_1.normalizeDateOnly)(input.date);
        const candidateTimes = (0, slotGenerator_js_1.generateSlotTimes)({
            startTime: input.startTime,
            endTime: input.endTime,
            slotDurationMinutes: input.slotDurationMinutes,
            gapMinutes: input.gapMinutes ?? 0,
            breakStart: input.breakStart,
            breakEnd: input.breakEnd,
        });
        if (candidateTimes.length === 0) {
            throw new AppError_js_1.AppError('No slots could be generated with the provided settings', 400);
        }
        const existing = await doctors_repository_js_1.doctorsRepository.getAvailabilitySlotsForDate(doctorId, date);
        const duration = input.slotDurationMinutes;
        const filteredTimes = candidateTimes.filter((candidate) => {
            const candidateStart = (0, slotGenerator_js_1.parseTimeToMinutes)(candidate);
            for (const slot of existing) {
                const existingStart = (0, slotGenerator_js_1.parseTimeToMinutes)(slot.time);
                if (slot.time === candidate || (0, slotGenerator_js_1.slotsOverlap)(candidateStart, duration, existingStart, duration)) {
                    return false;
                }
            }
            return true;
        });
        if (filteredTimes.length === 0) {
            throw new AppError_js_1.AppError('All generated slots overlap with existing appointments', 409);
        }
        await doctors_repository_js_1.doctorsRepository.createManyAvailabilitySlots(doctorId, date, filteredTimes);
        const slots = await doctors_repository_js_1.doctorsRepository.getAvailabilitySlotsForDate(doctorId, date);
        return {
            createdCount: filteredTimes.length,
            skippedCount: candidateTimes.length - filteredTimes.length,
            slots,
        };
    }
    async generateRecurringAvailability(doctorId, input) {
        const selectedDays = new Set(input.daysOfWeek);
        const candidateTimes = (0, slotGenerator_js_1.generateSlotTimes)({
            startTime: input.startTime,
            endTime: input.endTime,
            slotDurationMinutes: input.slotDurationMinutes,
            gapMinutes: input.gapMinutes ?? 0,
            breakStart: input.breakStart,
            breakEnd: input.breakEnd,
        });
        if (candidateTimes.length === 0) {
            throw new AppError_js_1.AppError('No slots could be generated with the provided settings', 400);
        }
        for (const day of input.daysOfWeek) {
            await doctors_repository_js_1.doctorsRepository.upsertScheduleByDay(doctorId, day, {
                startTime: input.startTime,
                endTime: input.endTime,
            });
        }
        const today = (0, slotGenerator_js_1.normalizeDateOnly)(new Date());
        let totalCreated = 0;
        let totalSkipped = 0;
        const weeksAhead = input.weeksAhead ?? 8;
        for (let offset = 0; offset < weeksAhead * 7; offset++) {
            const date = (0, slotGenerator_js_1.addDaysLocal)(today, offset);
            const dayOfWeek = (0, slotGenerator_js_1.dateToDayOfWeek)(date);
            if (!selectedDays.has(dayOfWeek))
                continue;
            const normalizedDate = (0, slotGenerator_js_1.normalizeDateOnly)(date);
            const existing = await doctors_repository_js_1.doctorsRepository.getAvailabilitySlotsForDate(doctorId, normalizedDate);
            const duration = input.slotDurationMinutes;
            const filteredTimes = candidateTimes.filter((candidate) => {
                const candidateStart = (0, slotGenerator_js_1.parseTimeToMinutes)(candidate);
                for (const slot of existing) {
                    const existingStart = (0, slotGenerator_js_1.parseTimeToMinutes)(slot.time);
                    if (slot.time === candidate || (0, slotGenerator_js_1.slotsOverlap)(candidateStart, duration, existingStart, duration)) {
                        return false;
                    }
                }
                return true;
            });
            if (filteredTimes.length > 0) {
                await doctors_repository_js_1.doctorsRepository.createManyAvailabilitySlots(doctorId, normalizedDate, filteredTimes);
                totalCreated += filteredTimes.length;
            }
            totalSkipped += candidateTimes.length - filteredTimes.length;
        }
        return {
            createdCount: totalCreated,
            skippedCount: totalSkipped,
            daysProcessed: input.daysOfWeek.length,
            weeksAhead,
        };
    }
    async getMyAvailability(doctorId, filters) {
        await this.purgeExpiredAvailabilitySlots(doctorId);
        const slots = await doctors_repository_js_1.doctorsRepository.getAvailabilitySlots(doctorId, {
            date: filters.date ? (0, slotGenerator_js_1.normalizeDateOnly)(filters.date) : undefined,
            from: filters.from ? (0, slotGenerator_js_1.normalizeDateOnly)(filters.from) : undefined,
            to: filters.to ? (0, slotGenerator_js_1.normalizeDateOnly)(filters.to) : undefined,
        });
        const now = new Date();
        const activeSlots = slots.filter((slot) => slot.isBooked || (0, slotGenerator_js_1.getAppointmentDateTime)(slot.date, slot.time) >= now);
        if (filters.availableOnly) {
            return activeSlots.filter((slot) => !slot.isBooked);
        }
        return activeSlots;
    }
    async purgeExpiredAvailabilitySlots(doctorId) {
        const today = (0, slotGenerator_js_1.normalizeDateOnly)(new Date());
        const candidates = await doctors_repository_js_1.doctorsRepository.getUnbookedSlotsUpToDate(doctorId, today);
        const now = new Date();
        const expiredIds = candidates
            .filter((slot) => (0, slotGenerator_js_1.getAppointmentDateTime)(slot.date, slot.time) < now)
            .map((slot) => slot.id);
        await doctors_repository_js_1.doctorsRepository.deleteAvailabilitySlotsByIds(expiredIds, doctorId);
    }
    async deleteAvailabilitySlot(slotId, doctorId) {
        try {
            await doctors_repository_js_1.doctorsRepository.deleteAvailabilitySlot(slotId, doctorId);
        }
        catch {
            throw new AppError_js_1.AppError('Slot not found or already booked', 404);
        }
    }
    async bootstrapDefaultAvailability(doctorId) {
        const weekdays = [
            client_1.DayOfWeek.SUNDAY,
            client_1.DayOfWeek.MONDAY,
            client_1.DayOfWeek.TUESDAY,
            client_1.DayOfWeek.WEDNESDAY,
            client_1.DayOfWeek.THURSDAY,
        ];
        for (const day of weekdays) {
            await doctors_repository_js_1.doctorsRepository.upsertScheduleByDay(doctorId, day, {
                startTime: '09:00',
                endTime: '17:00',
            });
        }
        const today = (0, slotGenerator_js_1.normalizeDateOnly)(new Date());
        const defaultTimes = ['09:00', '10:00', '11:00', '14:00', '15:00'];
        for (let i = 0; i < 7; i++) {
            const date = (0, slotGenerator_js_1.addDaysLocal)(today, i);
            await doctors_repository_js_1.doctorsRepository.createManyAvailabilitySlots(doctorId, date, defaultTimes);
        }
    }
    assertDoctorAccess(userId, userType, doctorId) {
        if (userType === client_1.UserType.DOCTOR && userId !== doctorId) {
            throw new AppError_js_1.AppError('Forbidden', 403);
        }
    }
}
exports.DoctorsService = DoctorsService;
exports.doctorsService = new DoctorsService();
//# sourceMappingURL=doctors.service.js.map