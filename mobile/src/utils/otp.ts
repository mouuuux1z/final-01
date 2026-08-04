/** Generates a random 6-digit OTP. */
export function generateOtpCode(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
    return value.toString().padStart(6, '0');
  }

  return Math.floor(100000 + Math.random() * 900000).toString();
}
