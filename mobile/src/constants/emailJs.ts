/**
 * EmailJS credentials — from https://dashboard.emailjs.com/admin
 *
 * Template variables (use any matching names in your template):
 * - To Email field: {{to_email}} or {{email}}
 * - Body: {{passcode}} or {{otp}}
 */
export const EMAILJS_SERVICE_ID =
  process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID ?? 'service_6ehof5x';

export const EMAILJS_TEMPLATE_ID =
  process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID ?? 'template_hwiyfhl';

export const EMAILJS_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY ?? 'qgwhp57AYRtFsxloN';

const PLACEHOLDER_SERVICE_ID = 'YOUR_SERVICE_ID';
const PLACEHOLDER_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const PLACEHOLDER_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export function isEmailJsConfigured(): boolean {
  return (
    EMAILJS_SERVICE_ID !== PLACEHOLDER_SERVICE_ID &&
    EMAILJS_TEMPLATE_ID !== PLACEHOLDER_TEMPLATE_ID &&
    EMAILJS_PUBLIC_KEY !== PLACEHOLDER_PUBLIC_KEY &&
    EMAILJS_SERVICE_ID.length > 0 &&
    EMAILJS_TEMPLATE_ID.length > 0 &&
    EMAILJS_PUBLIC_KEY.length > 0
  );
}
