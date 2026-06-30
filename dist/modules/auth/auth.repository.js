"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = exports.AuthRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
class AuthRepository {
    async findAdminByEmail(email) {
        return database_js_1.prisma.admin.findUnique({ where: { email } });
    }
    async findClinicByEmail(email) {
        return database_js_1.prisma.clinic.findUnique({ where: { email } });
    }
    async findDoctorByEmail(email) {
        return database_js_1.prisma.doctor.findUnique({ where: { email } });
    }
    async findPatientByEmail(email) {
        return database_js_1.prisma.patient.findUnique({ where: { email } });
    }
    async createPatient(data) {
        return database_js_1.prisma.patient.create({
            data: { ...data, status: client_1.EntityStatus.ACTIVE },
            select: { id: true, name: true, email: true, phone: true, status: true, attendancePoints: true, bookingBlockedUntil: true, createdAt: true },
        });
    }
    async createDoctor(data) {
        return database_js_1.prisma.doctor.create({
            data: { ...data, status: client_1.EntityStatus.PENDING },
            select: {
                id: true,
                serialNumber: true,
                name: true,
                email: true,
                phone: true,
                specialization: true,
                city: true,
                location: true,
                status: true,
                createdAt: true,
            },
        });
    }
    async createClinic(data) {
        return database_js_1.prisma.clinic.create({
            data: { ...data, status: client_1.EntityStatus.PENDING },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                location: true,
                city: true,
                specialization: true,
                certificate: true,
                status: true,
                createdAt: true,
            },
        });
    }
    async createAdmin(data) {
        return database_js_1.prisma.admin.create({
            data,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    }
    async getNextDoctorSerialNumber() {
        const count = await database_js_1.prisma.doctor.count();
        const year = new Date().getFullYear();
        return `DOC-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    async createSession(data) {
        return database_js_1.prisma.session.create({ data });
    }
    async updateSessionToken(id, token) {
        return database_js_1.prisma.session.update({ where: { id }, data: { token } });
    }
    async deleteSession(token) {
        return database_js_1.prisma.session.deleteMany({ where: { token } });
    }
    async deleteSessionById(id) {
        return database_js_1.prisma.session.delete({ where: { id } });
    }
    async createLoginAttempt(data) {
        return database_js_1.prisma.loginAttempt.create({ data });
    }
    async findUserByType(userType, userId) {
        switch (userType) {
            case client_1.UserType.ADMIN:
                return database_js_1.prisma.admin.findUnique({
                    where: { id: userId },
                    select: { id: true, name: true, email: true, role: true },
                });
            case client_1.UserType.CLINIC:
                return database_js_1.prisma.clinic.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        location: true,
                        city: true,
                        specialization: true,
                        certificate: true,
                        status: true,
                    },
                });
            case client_1.UserType.DOCTOR:
                return database_js_1.prisma.doctor.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        specialization: true,
                        city: true,
                        location: true,
                        status: true,
                        isOnline: true,
                        serialNumber: true,
                        clinic: { select: { id: true, name: true, location: true } },
                    },
                });
            case client_1.UserType.PATIENT:
                return database_js_1.prisma.patient.findUnique({
                    where: { id: userId },
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
            default:
                return null;
        }
    }
    async emailExists(userType, email) {
        switch (userType) {
            case client_1.UserType.ADMIN:
                return (await this.findAdminByEmail(email)) !== null;
            case client_1.UserType.CLINIC:
                return (await this.findClinicByEmail(email)) !== null;
            case client_1.UserType.DOCTOR:
                return (await this.findDoctorByEmail(email)) !== null;
            case client_1.UserType.PATIENT:
                return (await this.findPatientByEmail(email)) !== null;
            default:
                return false;
        }
    }
    async registerUser(input, passwordHash) {
        switch (input.userType) {
            case client_1.UserType.PATIENT:
                return this.createPatient({
                    name: input.name,
                    email: input.email,
                    password: passwordHash,
                    phone: input.phone,
                });
            case client_1.UserType.DOCTOR: {
                const serialNumber = await this.getNextDoctorSerialNumber();
                return this.createDoctor({
                    serialNumber,
                    name: input.name,
                    email: input.email,
                    password: passwordHash,
                    phone: input.phone,
                    specialization: input.specialization,
                    city: input.city,
                    location: input.location,
                    certificate: input.certificate,
                    clinicInfo: input.clinicInfo,
                    description: input.description,
                    clinicId: input.clinicId,
                });
            }
            case client_1.UserType.CLINIC: {
                return this.createClinic({
                    name: input.name,
                    email: input.email,
                    password: passwordHash,
                    phone: input.phone,
                    location: input.location,
                    city: input.city,
                    specialization: input.specialization,
                    certificate: input.certificate,
                });
            }
        }
    }
}
exports.AuthRepository = AuthRepository;
exports.authRepository = new AuthRepository();
//# sourceMappingURL=auth.repository.js.map