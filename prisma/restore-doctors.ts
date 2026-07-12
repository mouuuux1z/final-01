import {
  PrismaClient,
  EntityStatus,
  DayOfWeek,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'MyDoc@123';

type DoctorSeed = {
  serialNumber: string;
  name: string;
  email: string;
  specialization: string;
  phone: string;
  city: string;
  location: string;
  description: string;
  rating: number;
  ratingCount: number;
  isOnline: boolean;
};

const RESTORED_DOCTORS: DoctorSeed[] = [
  {
    serialNumber: 'DOC-DEMO-001',
    name: 'د. محمد التجريبي',
    email: 'demo.doctor@mydoc.com',
    specialization: 'طب عام',
    phone: '+966500000001',
    city: 'الرياض',
    location: 'حي العليا، الرياض — حساب تجريبي',
    description: 'طبيب تجريبي لاختبار حجز المواعيد وبوابة الطبيب',
    rating: 5.0,
    ratingCount: 0,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-001',
    name: 'د. أحمد المحمد',
    email: 'ahmed.cardio@mydoc.com',
    specialization: 'أمراض القلب',
    phone: '+966501111111',
    city: 'الرياض',
    location: 'شارع الملك فهد، حي العليا',
    description: 'استشاري أمراض القلب',
    rating: 4.8,
    ratingCount: 24,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-002',
    name: 'د. سارة العتيبي',
    email: 'sara.pediatrics@mydoc.com',
    specialization: 'طب الأطفال',
    phone: '+966502222222',
    city: 'الرياض',
    location: 'حي النخيل، الرياض',
    description: 'استشارية طب الأطفال',
    rating: 4.6,
    ratingCount: 12,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-003',
    name: 'د. خالد الحربي',
    email: 'khalid.derma@mydoc.com',
    specialization: 'الجلدية',
    phone: '+966503333333',
    city: 'الرياض',
    location: 'حي الملز، الرياض',
    description: 'استشاري الأمراض الجلدية',
    rating: 4.7,
    ratingCount: 8,
    isOnline: false,
  },
  {
    serialNumber: 'DOC-2024-004',
    name: 'د. نورة الزهراني',
    email: 'noura.neuro@mydoc.com',
    specialization: 'الأعصاب',
    phone: '+966504444445',
    city: 'الرياض',
    location: 'حي العليا، الرياض',
    description: 'استشارية الأمراض العصبية',
    rating: 4.9,
    ratingCount: 15,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-005',
    name: 'د. فيصل القحطاني',
    email: 'faisal.ortho@mydoc.com',
    specialization: 'العظام',
    phone: '+966505555555',
    city: 'الرياض',
    location: 'حي السليمانية، الرياض',
    description: 'استشاري جراحة العظام',
    rating: 4.5,
    ratingCount: 9,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-006',
    name: 'د. ليلى الشمري',
    email: 'layla.obgyn@mydoc.com',
    specialization: 'النساء والولادة',
    phone: '+966506666666',
    city: 'الرياض',
    location: 'حي الورود، الرياض',
    description: 'استشارية النساء والولادة',
    rating: 4.8,
    ratingCount: 18,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-007',
    name: 'د. عمر الدوسري',
    email: 'omar.general@mydoc.com',
    specialization: 'طب عام',
    phone: '+966507777777',
    city: 'الرياض',
    location: 'حي النرجس، الرياض',
    description: 'طبيب عام وطب الأسرة',
    rating: 4.4,
    ratingCount: 6,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-008',
    name: 'د. ريم الغامدي',
    email: 'reem.ophthal@mydoc.com',
    specialization: 'العيون',
    phone: '+966508888888',
    city: 'الرياض',
    location: 'حي الياسمين، الرياض',
    description: 'استشارية طب وجراحة العيون',
    rating: 4.7,
    ratingCount: 11,
    isOnline: false,
  },
  {
    serialNumber: 'DOC-2024-009',
    name: 'د. ياسر المطيري',
    email: 'yasser.ent@mydoc.com',
    specialization: 'الأنف والأذن والحنجرة',
    phone: '+966509999999',
    city: 'الرياض',
    location: 'حي المروج، الرياض',
    description: 'استشاري الأنف والأذن والحنجرة',
    rating: 4.6,
    ratingCount: 7,
    isOnline: true,
  },
  {
    serialNumber: 'DOC-2024-010',
    name: 'د. هدى السبيعي',
    email: 'huda.psych@mydoc.com',
    specialization: 'الطب النفسي',
    phone: '+966500000010',
    city: 'الرياض',
    location: 'حي الصحافة، الرياض',
    description: 'استشارية الطب النفسي',
    rating: 4.9,
    ratingCount: 14,
    isOnline: true,
  },
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function bootstrapDoctorAvailability(doctorId: string) {
  const weekdays = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
  ];

  for (const day of weekdays) {
    await prisma.doctorSchedule.upsert({
      where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: day } },
      create: { doctorId, dayOfWeek: day, startTime: '09:00', endTime: '17:00' },
      update: { startTime: '09:00', endTime: '17:00' },
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const defaultTimes = ['09:00', '10:00', '11:00', '14:00', '15:00'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const existing = await prisma.doctorAvailabilitySlot.findMany({
      where: { doctorId, date: { gte: date, lt: new Date(date.getTime() + 86400000) } },
      select: { time: true },
    });
    const existingTimes = new Set(existing.map((slot) => slot.time));
    const newTimes = defaultTimes.filter((time) => !existingTimes.has(time));

    if (newTimes.length > 0) {
      await prisma.doctorAvailabilitySlot.createMany({
        data: newTimes.map((time) => ({ doctorId, date, time, isBooked: false })),
      });
    }
  }
}

async function main(): Promise<void> {
  console.log('Restoring doctors (without deleting existing data)...');

  const clinic = await prisma.clinic.findFirst({
    where: { email: 'clinic.noor@mydoc.com' },
  });

  if (!clinic) {
    throw new Error('Clinic not found. Run: npm run db:seed');
  }

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);
  let restored = 0;

  for (const doc of RESTORED_DOCTORS) {
    const doctor = await prisma.doctor.upsert({
      where: { email: doc.email },
      create: {
        ...doc,
        password: passwordHash,
        status: EntityStatus.ACTIVE,
        clinicId: clinic.id,
        lastActive: new Date(),
      },
      update: {
        serialNumber: doc.serialNumber,
        name: doc.name,
        specialization: doc.specialization,
        phone: doc.phone,
        city: doc.city,
        location: doc.location,
        description: doc.description,
        rating: doc.rating,
        ratingCount: doc.ratingCount,
        isOnline: doc.isOnline,
        status: EntityStatus.ACTIVE,
        clinicId: clinic.id,
        lastActive: new Date(),
      },
    });

    await bootstrapDoctorAvailability(doctor.id);

    await prisma.doctorChatSettings.upsert({
      where: { doctorId: doctor.id },
      create: { doctorId: doctor.id, repliesEnabled: true },
      update: { repliesEnabled: true },
    });

    restored += 1;
    console.log(`  ✓ ${doc.name} — ${doc.specialization}`);
  }

  const total = await prisma.doctor.count({ where: { status: EntityStatus.ACTIVE } });
  console.log(`\nDone. Restored/updated ${restored} doctors. Active doctors in DB: ${total}`);
  console.log(`Default password for demo accounts: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
