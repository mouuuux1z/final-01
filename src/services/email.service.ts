import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

let transporter: Transporter | null = null;

function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_USER?.trim() && env.SMTP_PASS?.trim());
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (!isSmtpConfigured()) {
    throw new AppError('Email service is not configured', 503);
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
  });

  return transporter;
}

function logDevResetCode(to: string, code: string) {
  console.log('');
  console.log('========== MYDoc DEV PASSWORD RESET ==========');
  console.log(`Email : ${to}`);
  console.log(`Code  : ${code}`);
  console.log('Add SMTP_USER and SMTP_PASS to backend/.env to send real emails.');
  console.log('==============================================');
  console.log('');
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  code: string;
  language?: string;
}) {
  const isArabic = !params.language || params.language.startsWith('ar');
  const subject = isArabic ? 'MYDoc — رمز إعادة تعيين كلمة المرور' : 'MYDoc — Password reset code';
  const greeting = isArabic ? `مرحباً ${params.name}،` : `Hello ${params.name},`;
  const intro = isArabic
    ? 'استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك في MYDoc.'
    : 'We received a request to reset your MYDoc account password.';
  const codeLabel = isArabic ? 'رمز التحقق:' : 'Verification code:';
  const expiry = isArabic
    ? `ينتهي هذا الرمز خلال ${env.PASSWORD_RESET_CODE_EXPIRES_IN}.`
    : `This code expires in ${env.PASSWORD_RESET_CODE_EXPIRES_IN}.`;
  const ignore = isArabic
    ? 'إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.'
    : 'If you did not request a reset, you can ignore this email.';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 520px;">
      <p>${greeting}</p>
      <p>${intro}</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1089D3;">${codeLabel} ${params.code}</p>
      <p>${expiry}</p>
      <p style="color: #666;">${ignore}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">MYDoc — Healthcare Appointments</p>
    </div>
  `;

  const text = `${greeting}\n\n${intro}\n${codeLabel} ${params.code}\n${expiry}\n${ignore}`;

  if (!isSmtpConfigured()) {
    if (env.NODE_ENV === 'development') {
      logDevResetCode(params.to, params.code);
      return;
    }
    throw new AppError('Email service is not configured', 503);
  }

  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to: params.to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error('SMTP email failed:', error);
    throw new AppError('Failed to send verification email', 502);
  }
}
