import type { UserType } from '../types';
import type { AppIconName } from '../components/AppIcon';

export const TEST_PASSWORD = 'MyDoc@123';

export interface DemoAccount {
  userType: UserType;
  email: string;
  labelKey: string;
  hintKey: string;
  icon: AppIconName;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    userType: 'PATIENT',
    email: 'mohammed.patient@mydoc.com',
    labelKey: 'auth.patient',
    hintKey: 'auth.patientLoginHint',
    icon: 'profile',
  },
  {
    userType: 'DOCTOR',
    email: 'ahmed.cardio@mydoc.com',
    labelKey: 'auth.doctor',
    hintKey: 'auth.doctorLoginHint',
    icon: 'doctors',
  },
  {
    userType: 'CLINIC',
    email: 'clinic.noor@mydoc.com',
    labelKey: 'auth.clinic',
    hintKey: 'auth.clinicLoginHint',
    icon: 'clinic',
  },
  {
    userType: 'ADMIN',
    email: 'admin@mydoc.com',
    labelKey: 'auth.admin',
    hintKey: 'auth.adminLoginSubtitle',
    icon: 'users',
  },
];

export function resolveLoginUserType(email: string): UserType | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find((item) => item.email === normalizedEmail);
  if (account?.userType === 'ADMIN') return 'ADMIN';
  if (account?.userType === 'CLINIC') return 'CLINIC';
  return undefined;
}
