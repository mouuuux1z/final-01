"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const node_crypto_1 = require("node:crypto");
const client_1 = require("@prisma/client");
const env_js_1 = require("../../config/env.js");
const AppError_js_1 = require("../../utils/AppError.js");
const jwt_js_1 = require("../../utils/jwt.js");
const password_js_1 = require("../../utils/password.js");
const auth_repository_js_1 = require("./auth.repository.js");
const commitment_service_js_1 = require("../../services/commitment.service.js");
function parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms = unit === 'd'
        ? value * 24 * 60 * 60 * 1000
        : unit === 'h'
            ? value * 60 * 60 * 1000
            : unit === 'm'
                ? value * 60 * 1000
                : value * 1000;
    return new Date(Date.now() + ms);
}
class AuthService {
    async registerDoctor(input) {
        const exists = await auth_repository_js_1.authRepository.emailExists(client_1.UserType.DOCTOR, input.email);
        if (exists) {
            throw new AppError_js_1.AppError('Email already registered', 409);
        }
        const passwordHash = await (0, password_js_1.hashPassword)(input.password);
        const user = await auth_repository_js_1.authRepository.registerUser({
            userType: client_1.UserType.DOCTOR,
            name: input.name,
            email: input.email,
            password: input.password,
            phone: input.phone,
            specialization: input.specialization,
            city: input.city,
            location: input.location,
            certificate: input.certificate,
        }, passwordHash);
        return { user, pendingApproval: true };
    }
    async registerClinic(input) {
        const exists = await auth_repository_js_1.authRepository.emailExists(client_1.UserType.CLINIC, input.email);
        if (exists) {
            throw new AppError_js_1.AppError('Email already registered', 409);
        }
        const passwordHash = await (0, password_js_1.hashPassword)(input.password);
        const user = await auth_repository_js_1.authRepository.registerUser({
            userType: client_1.UserType.CLINIC,
            name: input.name,
            email: input.email,
            password: input.password,
            phone: input.phone,
            location: input.location,
            city: input.city,
            specialization: input.specialization,
            certificate: input.certificate,
        }, passwordHash);
        return { user, pendingApproval: true };
    }
    async register(input) {
        const exists = await auth_repository_js_1.authRepository.emailExists(input.userType, input.email);
        if (exists) {
            throw new AppError_js_1.AppError('Email already registered', 409);
        }
        const passwordHash = await (0, password_js_1.hashPassword)(input.password);
        const user = await auth_repository_js_1.authRepository.registerUser(input, passwordHash);
        if (input.userType === client_1.UserType.DOCTOR || input.userType === client_1.UserType.CLINIC) {
            return { user, pendingApproval: true };
        }
        const session = await this.createSession(user.id, input.userType);
        return { user, ...session, pendingApproval: false };
    }
    async login(input, ipAddress) {
        const email = input.email.trim().toLowerCase();
        const resolved = await this.resolveLoginByCredentials(email, input.password, input.userType);
        if (!resolved) {
            await auth_repository_js_1.authRepository.createLoginAttempt({
                email,
                ipAddress,
                success: false,
                userType: input.userType,
            });
            throw new AppError_js_1.AppError('Invalid credentials', 401);
        }
        const { userType, user } = resolved;
        this.assertUserCanLogin(userType, user);
        await auth_repository_js_1.authRepository.createLoginAttempt({
            email,
            ipAddress,
            success: true,
            userType,
        });
        const session = await this.createSession(user.id, userType);
        const profile = userType === client_1.UserType.PATIENT
            ? await (0, commitment_service_js_1.syncPatientCommitmentState)(user.id)
            : await auth_repository_js_1.authRepository.findUserByType(userType, user.id);
        return { user: profile, userType, ...session };
    }
    async logout(token) {
        await auth_repository_js_1.authRepository.deleteSession(token);
    }
    async getProfile(userId, userType) {
        if (userType === client_1.UserType.PATIENT) {
            const user = await (0, commitment_service_js_1.syncPatientCommitmentState)(userId);
            if (!user) {
                throw new AppError_js_1.AppError('User not found', 404);
            }
            return user;
        }
        const user = await auth_repository_js_1.authRepository.findUserByType(userType, userId);
        if (!user) {
            throw new AppError_js_1.AppError('User not found', 404);
        }
        return user;
    }
    assertUserCanLogin(userType, user) {
        if (userType === client_1.UserType.PATIENT && user.status === client_1.EntityStatus.SUSPENDED) {
            throw new AppError_js_1.AppError('Account suspended', 403);
        }
        if (userType === client_1.UserType.DOCTOR) {
            if (user.status === client_1.EntityStatus.PENDING) {
                throw new AppError_js_1.AppError('Your account is pending admin approval. You will be notified once approved.', 403);
            }
            if (user.status === client_1.EntityStatus.INACTIVE) {
                throw new AppError_js_1.AppError('Account is inactive', 403);
            }
            if (user.status === client_1.EntityStatus.DISABLED) {
                throw new AppError_js_1.AppError('Account disabled', 403);
            }
            if (user.status === client_1.EntityStatus.SUSPENDED) {
                throw new AppError_js_1.AppError('Account suspended', 403);
            }
        }
        if (userType === client_1.UserType.CLINIC) {
            if (user.status === client_1.EntityStatus.PENDING) {
                throw new AppError_js_1.AppError('Your clinic account is pending admin approval', 403);
            }
            if (user.status === client_1.EntityStatus.SUSPENDED || user.status === client_1.EntityStatus.DISABLED) {
                throw new AppError_js_1.AppError('Account suspended', 403);
            }
        }
    }
    async resolveLoginByCredentials(email, password, preferredType) {
        const searchOrder = preferredType
            ? [preferredType]
            : [client_1.UserType.ADMIN, client_1.UserType.CLINIC, client_1.UserType.DOCTOR, client_1.UserType.PATIENT];
        for (const userType of searchOrder) {
            const user = await this.findUserWithPassword(email, userType);
            if (!user)
                continue;
            const valid = await (0, password_js_1.comparePassword)(password, user.password);
            if (!valid) {
                if (preferredType)
                    return null;
                continue;
            }
            return { userType, user };
        }
        return null;
    }
    async findUserWithPassword(email, userType) {
        switch (userType) {
            case client_1.UserType.ADMIN:
                return auth_repository_js_1.authRepository.findAdminByEmail(email);
            case client_1.UserType.CLINIC:
                return auth_repository_js_1.authRepository.findClinicByEmail(email);
            case client_1.UserType.DOCTOR:
                return auth_repository_js_1.authRepository.findDoctorByEmail(email);
            case client_1.UserType.PATIENT:
                return auth_repository_js_1.authRepository.findPatientByEmail(email);
            default:
                return null;
        }
    }
    async createSession(userId, userType) {
        const expiresAt = parseExpiresIn(env_js_1.env.JWT_EXPIRES_IN);
        const placeholderToken = (0, node_crypto_1.randomUUID)();
        const session = await auth_repository_js_1.authRepository.createSession({
            token: placeholderToken,
            userType,
            userId,
            expiresAt,
        });
        const token = (0, jwt_js_1.signToken)({ userId, userType, sessionId: session.id });
        await auth_repository_js_1.authRepository.updateSessionToken(session.id, token);
        return { token, expiresAt };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map