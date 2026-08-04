import { randomInt, randomUUID } from 'node:crypto';
import { EntityStatus, UserType } from '@prisma/client';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { signToken } from '../../utils/jwt.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import { authRepository } from './auth.repository.js';
import { syncPatientCommitmentState } from '../../services/commitment.service.js';
import { invalidateCachedSession } from '../../utils/sessionCache.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import { clinicRegisterMultipartSchema, doctorRegisterMultipartSchema } from './auth.schema.js';
import type { z } from 'zod';
import { sendPasswordResetEmail } from '../../services/email.service.js';

type DoctorRegisterInput = z.infer<typeof doctorRegisterMultipartSchema> & { certificate: string };
type ClinicRegisterInput = z.infer<typeof clinicRegisterMultipartSchema> & { certificate: string };

function parseExpiresIn(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms =
    unit === 'd'
      ? value * 24 * 60 * 60 * 1000
      : unit === 'h'
        ? value * 60 * 60 * 1000
        : unit === 'm'
          ? value * 60 * 1000
          : value * 1000;
  return new Date(Date.now() + ms);
}

export class AuthService {
  async registerDoctor(input: DoctorRegisterInput) {
    const exists = await authRepository.emailExists(UserType.DOCTOR, input.email);
    if (exists) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.registerUser(
      {
        userType: UserType.DOCTOR,
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
        specialization: input.specialization,
        city: input.city,
        location: input.location,
        certificate: input.certificate,
      } as RegisterInput & { certificate: string },
      passwordHash,
    );

    return { user, pendingApproval: true as const };
  }

  async registerClinic(input: ClinicRegisterInput) {
    const exists = await authRepository.emailExists(UserType.CLINIC, input.email);
    if (exists) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.registerUser(
      {
        userType: UserType.CLINIC,
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
        location: input.location,
        city: input.city,
        specialization: input.specialization,
        certificate: input.certificate,
      } as RegisterInput & { certificate: string },
      passwordHash,
    );

    return { user, pendingApproval: true as const };
  }

  async register(input: RegisterInput) {
    const exists = await authRepository.emailExists(input.userType, input.email);
    if (exists) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.registerUser(input, passwordHash);

    if (input.userType === UserType.DOCTOR || input.userType === UserType.CLINIC) {
      return { user, pendingApproval: true as const };
    }

    const session = await this.createSession(user.id, input.userType);
    return { user, ...session, pendingApproval: false as const };
  }

  async login(input: LoginInput, ipAddress?: string) {
    const email = input.email.trim().toLowerCase();
    const resolved = await this.resolveLoginByCredentials(email, input.password, input.userType);

    if (!resolved) {
      await authRepository.createLoginAttempt({
        email,
        ipAddress,
        success: false,
        userType: input.userType,
      });
      throw new AppError('Invalid credentials', 401);
    }

    const { userType, user } = resolved;
    this.assertUserCanLogin(userType, user);

    await authRepository.createLoginAttempt({
      email,
      ipAddress,
      success: true,
      userType,
    });

    const session = await this.createSession(user.id, userType);
    const profile =
      userType === UserType.PATIENT
        ? await syncPatientCommitmentState(user.id)
        : await authRepository.findUserByType(userType, user.id);

    return { user: profile, userType, ...session };
  }

  async logout(token: string) {
    invalidateCachedSession(token);
    await authRepository.deleteSession(token);
  }

  async forgotPassword(email: string, language?: string) {
    const account = await authRepository.findAccountByEmail(email);

    if (account) {
      const code = randomInt(100_000, 1_000_000).toString();
      const codeHash = await hashPassword(code);
      const expiresAt = parseExpiresIn(env.PASSWORD_RESET_CODE_EXPIRES_IN);

      await authRepository.invalidatePasswordResetTokens(email);
      await authRepository.createPasswordResetToken({
        email,
        codeHash,
        userType: account.userType,
        userId: account.userId,
        expiresAt,
      });

      await sendPasswordResetEmail({
        to: email,
        name: account.name,
        code,
        language,
      });
    }

    return {
      message: 'If an account exists for this email, a reset code has been sent.',
    };
  }

  async resetPassword(email: string, code: string, password: string) {
    const tokens = await authRepository.findActivePasswordResetTokens(email);
    if (tokens.length === 0) {
      throw new AppError('Invalid or expired reset code', 400);
    }

    let matchedToken: (typeof tokens)[number] | null = null;
    for (const token of tokens) {
      const valid = await comparePassword(code, token.codeHash);
      if (valid) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new AppError('Invalid or expired reset code', 400);
    }

    const passwordHash = await hashPassword(password);
    await authRepository.updateUserPassword(matchedToken.userType, matchedToken.userId, passwordHash);
    await authRepository.markPasswordResetTokenUsed(matchedToken.id);
    await authRepository.invalidatePasswordResetTokens(email);

    return { message: 'Password updated successfully' };
  }

  async getProfile(userId: string, userType: UserType) {
    if (userType === UserType.PATIENT) {
      const user = await syncPatientCommitmentState(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    }

    const user = await authRepository.findUserByType(userType, userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  private assertUserCanLogin(userType: UserType, user: { status?: EntityStatus }) {
    if (userType === UserType.PATIENT && user.status === EntityStatus.SUSPENDED) {
      throw new AppError('Account suspended', 403);
    }

    if (userType === UserType.DOCTOR) {
      if (user.status === EntityStatus.PENDING) {
        throw new AppError(
          'Your account is pending admin approval. You will be notified once approved.',
          403,
        );
      }
      if (user.status === EntityStatus.INACTIVE) {
        throw new AppError('Account is inactive', 403);
      }
      if (user.status === EntityStatus.DISABLED) {
        throw new AppError('Account disabled', 403);
      }
      if (user.status === EntityStatus.SUSPENDED) {
        throw new AppError('Account suspended', 403);
      }
    }

    if (userType === UserType.CLINIC) {
      if (user.status === EntityStatus.PENDING) {
        throw new AppError('Your clinic account is pending admin approval', 403);
      }
      if (user.status === EntityStatus.SUSPENDED || user.status === EntityStatus.DISABLED) {
        throw new AppError('Account suspended', 403);
      }
    }
  }

  private async resolveLoginByCredentials(
    email: string,
    password: string,
    preferredType?: UserType,
  ): Promise<{ userType: UserType; user: { id: string; status?: EntityStatus } } | null> {
    if (preferredType) {
      const user = await this.findUserWithPassword(email, preferredType);
      if (!user) return null;

      const valid = await comparePassword(password, user.password);
      return valid ? { userType: preferredType, user } : null;
    }

    const account = await authRepository.findAccountWithPasswordByEmail(email);
    if (!account) return null;

    const valid = await comparePassword(password, account.user.password);
    if (!valid) return null;

    return { userType: account.userType, user: account.user };
  }

  private async findUserWithPassword(email: string, userType: UserType) {
    switch (userType) {
      case UserType.ADMIN:
        return authRepository.findAdminByEmail(email);
      case UserType.CLINIC:
        return authRepository.findClinicByEmail(email);
      case UserType.DOCTOR:
        return authRepository.findDoctorByEmail(email);
      case UserType.PATIENT:
        return authRepository.findPatientByEmail(email);
      default:
        return null;
    }
  }

  private async createSession(userId: string, userType: UserType) {
    const expiresAt = parseExpiresIn(env.JWT_EXPIRES_IN);
    const placeholderToken = randomUUID();

    const session = await authRepository.createSession({
      token: placeholderToken,
      userType,
      userId,
      expiresAt,
    });

    const token = signToken({ userId, userType, sessionId: session.id });
    await authRepository.updateSessionToken(session.id, token);

    return { token, expiresAt };
  }

  async deleteAccount(userId: string, userType: UserType, password: string, sessionToken?: string) {
    if (userType === UserType.ADMIN) {
      throw new AppError('Account deletion is not allowed', 403);
    }

    const storedPassword = await authRepository.findUserPassword(userType, userId);
    if (!storedPassword) {
      throw new AppError('User not found', 404);
    }

    const valid = await comparePassword(password, storedPassword);
    if (!valid) {
      throw new AppError('Incorrect password', 401);
    }

    await authRepository.deleteUserAccount(userType, userId);

    if (sessionToken) {
      invalidateCachedSession(sessionToken);
    }

    return { message: 'Account deleted successfully' };
  }
}

export const authService = new AuthService();
