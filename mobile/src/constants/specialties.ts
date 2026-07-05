import type { AppIconName } from '../components/AppIcon';

export interface SpecialtyCategory {
  id: string;
  labelKey: string;
  icon: AppIconName;
  /** Canonical value stored on the doctor profile. */
  value?: string;
  /** Match terms used when filtering doctors by specialization. */
  terms?: readonly string[];
}

export const SPECIALTY_CATEGORIES: readonly SpecialtyCategory[] = [
  { id: 'all', labelKey: 'home.categoryAll', icon: 'doctors' },
  {
    id: 'pediatrics',
    labelKey: 'specialties.pediatrics',
    icon: 'baby',
    value: 'طب الأطفال',
    terms: ['طب الأطفال', 'أطفال', 'Pediatrics', 'pediatrics'],
  },
  {
    id: 'dentistry',
    labelKey: 'specialties.dentistry',
    icon: 'tooth',
    value: 'طب الأسنان',
    terms: ['طب الأسنان', 'أسنان', 'Dentistry', 'dentistry', 'Dental'],
  },
  {
    id: 'psychiatry',
    labelKey: 'specialties.psychiatry',
    icon: 'psychiatry',
    value: 'الطب النفسي',
    terms: ['الطب النفسي', 'نفسي', 'Psychiatry', 'psychiatry'],
  },
  {
    id: 'cardiology',
    labelKey: 'specialties.cardiology',
    icon: 'cardiology',
    value: 'طب جراحة القلب والأوعية الدموية',
    terms: ['القلب', 'أمراض القلب', 'الأوعية الدموية', 'Cardiology', 'cardiology', 'قلب'],
  },
  {
    id: 'generalMedicine',
    labelKey: 'specialties.generalMedicine',
    icon: 'general',
    value: 'الطب العام',
    terms: ['الطب العام', 'طب عام', 'General', 'general'],
  },
  {
    id: 'ophthalmology',
    labelKey: 'specialties.ophthalmology',
    icon: 'eye',
    value: 'طب العيون',
    terms: ['طب العيون', 'عيون', 'Ophthalmology', 'ophthalmology'],
  },
  {
    id: 'neurology',
    labelKey: 'specialties.neurology',
    icon: 'brain',
    value: 'طب المخ والأعصاب',
    terms: ['المخ', 'الأعصاب', 'أعصاب', 'Neurology', 'neurology'],
  },
  {
    id: 'internalMedicine',
    labelKey: 'specialties.internalMedicine',
    icon: 'gastro',
    value: 'الباطنة والجهاز الهضمي',
    terms: ['الباطنة', 'الجهاز الهضمي', 'باطنة', 'Internal', 'Gastroenterology'],
  },
  {
    id: 'obstetrics',
    labelKey: 'specialties.obstetrics',
    icon: 'gynecology',
    value: 'نساء وتوليد',
    terms: ['نساء وتوليد', 'نساء', 'توليد', 'Obstetrics', 'Gynecology'],
  },
  {
    id: 'urology',
    labelKey: 'specialties.urology',
    icon: 'urology',
    value: 'مسالك بولية',
    terms: ['مسالك بولية', 'مسالك', 'بولية', 'Urology', 'urology'],
  },
  {
    id: 'orthopedics',
    labelKey: 'specialties.orthopedics',
    icon: 'bone',
    value: 'طب العظام',
    terms: ['طب العظام', 'عظام', 'Orthopedics', 'orthopedics'],
  },
  {
    id: 'oncology',
    labelKey: 'specialties.oncology',
    icon: 'oncology',
    value: 'طب الأورام',
    terms: ['طب الأورام', 'أورام', 'Oncology', 'oncology'],
  },
  {
    id: 'plasticSurgery',
    labelKey: 'specialties.plasticSurgery',
    icon: 'plastic',
    value: 'طب جراحات التجميل',
    terms: ['جراحات التجميل', 'تجميل', 'Plastic', 'plastic'],
  },
  {
    id: 'dermatology',
    labelKey: 'specialties.dermatology',
    icon: 'sparkles',
    value: 'الأمراض الجلدية',
    terms: ['الجلدية', 'الأمراض الجلدية', 'جلدية', 'Dermatology', 'dermatology'],
  },
  {
    id: 'endocrinology',
    labelKey: 'specialties.endocrinology',
    icon: 'endocrine',
    value: 'أمراض الغدد',
    terms: ['أمراض الغدد', 'الغدد', 'غدد', 'Endocrinology', 'endocrinology'],
  },
  {
    id: 'ent',
    labelKey: 'specialties.ent',
    icon: 'ent',
    value: 'طب أنف وأذن وحنجرة',
    terms: ['أنف وأذن وحنجرة', 'أنف', 'أذن', 'حنجرة', 'ENT', 'Otolaryngology'],
  },
] as const;

export type SpecialtyCategoryId = string;

/** Specialties a doctor/clinic can pick when registering (excludes the "all" filter). */
export const DOCTOR_SPECIALTIES = SPECIALTY_CATEGORIES.filter(
  (item): item is SpecialtyCategory & { value: string } => item.id !== 'all' && !!item.value,
);

export function matchSpecialtyValue(specialization: string): string {
  const normalized = specialization.trim();
  if (!normalized) return '';

  const exact = DOCTOR_SPECIALTIES.find((item) => item.value === normalized);
  if (exact) return exact.value;

  const lower = normalized.toLowerCase();
  const matched = DOCTOR_SPECIALTIES.find((item) =>
    item.terms?.some(
      (term) =>
        term.toLowerCase() === lower ||
        lower.includes(term.toLowerCase()) ||
        term.toLowerCase().includes(lower),
    ),
  );

  return matched?.value ?? normalized;
}

export function getSpecializationFilter(categoryId: string): string | undefined {
  const category = SPECIALTY_CATEGORIES.find((item) => item.id === categoryId);
  if (!category || category.id === 'all' || !category.terms) {
    return undefined;
  }
  return category.terms.join('|');
}

/** @deprecated use SPECIALTY_CATEGORIES */
export const CATEGORIES = SPECIALTY_CATEGORIES.map(({ id, labelKey, icon }) => ({
  id,
  labelKey,
  icon,
  query: getSpecializationFilter(id),
}));
