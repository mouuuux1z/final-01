import emailjs from '@emailjs/browser';
import {
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  isEmailJsConfigured,
} from '../constants/emailJs';

export class EmailJsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailJsError';
  }
}

function extractEmailJsMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const record = error as { text?: string; message?: string; status?: number };
    if (typeof record.text === 'string' && record.text.trim()) {
      return record.text.trim();
    }
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim();
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return 'Failed to send verification email';
}

function buildTemplateParams(userEmail: string, otpCode: string) {
  return {
    to_email: userEmail,
    email: userEmail,
    user_email: userEmail,
    passcode: otpCode,
    otp: otpCode,
    otp_code: otpCode,
    verification_code: otpCode,
    message: `رمز التحقق: ${otpCode}`,
  };
}

/**
 * Sends a 6-digit OTP to the user via EmailJS.
 * Template settings (EmailJS dashboard):
 * - To Email field MUST be: {{to_email}} or {{email}}
 * - Body should include: {{passcode}}
 */
export async function sendOTP(userEmail: string, otpCode: string): Promise<void> {
  if (!isEmailJsConfigured()) {
    throw new EmailJsError('EmailJS is not configured');
  }

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      buildTemplateParams(userEmail, otpCode),
    );

    if (response.status !== 200) {
      throw new EmailJsError(extractEmailJsMessage(response));
    }
  } catch (error) {
    const message = extractEmailJsMessage(error);
    console.error('EmailJS sendOTP failed:', message, error);
    throw new EmailJsError(message);
  }
}
