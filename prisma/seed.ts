import {
  PrismaClient,
  AdminRole,
  EntityStatus,
  DayOfWeek,
  AppointmentStatus,
  AttendanceStatus,
  SenderType,
  NotificationTargetType,
  NotificationType,
  ComplaintStatus,
  ComplaintUserType,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'MyDoc@123';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main(): Promise<void> {
  console.log('Seeding MYDoc database...');

  await prisma.rating.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.doctorChatSettings.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorAvailabilitySlot.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.siteContent.deleteMany();

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const superAdmin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'admin@mydoc.com',
      password: passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  await prisma.siteContent.createMany({
    data: [
      { key: 'faq', value: JSON.stringify([{ q: 'كيف أحجز موعداً؟', a: 'ابحث عن الطبيب واختر الوقت المتاح.' }]) },
      { key: 'privacy', value: 'نحن نلتزم بحماية بياناتك الصحية.' },
      { key: 'terms', value: 'باستخدام MYDoc توافق على شروط الخدمة.' },
      { key: 'contact', value: JSON.stringify({ email: 'support@mydoc.com', phone: '+966500000000' }) },
    ],
  });

  const clinic = await prisma.clinic.create({
    data: {
      name: 'عيادة النور الطبية',
      location: 'حي العليا، الرياض',
      phone: '+966112345678',
      email: 'clinic.noor@mydoc.com',
      password: passwordHash,
      status: EntityStatus.ACTIVE,
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      serialNumber: 'DOC-2024-001',
      name: 'د. أحمد المحمد',
      email: 'ahmed.cardio@mydoc.com',
      password: passwordHash,
      specialization: 'أمراض القلب',
      phone: '+966501111111',
      city: 'الرياض',
      location: 'شارع الملك فهد، حي العليا',
      description: 'استشاري أمراض القلب',
      rating: 4.8,
      ratingCount: 1,
      status: EntityStatus.ACTIVE,
      isOnline: true,
      lastActive: new Date(),
      clinicId: clinic.id,
    },
  });

  await prisma.doctor.createMany({
    data: [
      {
        serialNumber: 'DOC-DEMO-001',
        name: 'د. محمد التجريبي',
        email: 'demo.doctor@mydoc.com',
        password: passwordHash,
        specialization: 'طب عام',
        phone: '+966500000001',
        city: 'الرياض',
        location: 'حي العليا، الرياض — حساب تجريبي',
        description: 'طبيب تجريبي لاختبار حجز المواعيد وبوابة الطبيب',
        rating: 5.0,
        ratingCount: 0,
        status: EntityStatus.ACTIVE,
        isOnline: true,
        lastActive: new Date(),
        clinicId: clinic.id,
      },
      {
        serialNumber: 'DOC-2024-002',
        name: 'د. سارة العتيبي',
        email: 'sara.pediatrics@mydoc.com',
        password: passwordHash,
        specialization: 'طب الأطفال',
        phone: '+966502222222',
        city: 'الرياض',
        location: 'حي النخيل، الرياض',
        description: 'استشارية طب الأطفال',
        rating: 4.6,
        ratingCount: 12,
        status: EntityStatus.ACTIVE,
        isOnline: true,
        clinicId: clinic.id,
      },
      {
        serialNumber: 'DOC-2024-003',
        name: 'د. خالد الحربي',
        email: 'khalid.derma@mydoc.com',
        password: passwordHash,
        specialization: 'الجلدية',
        phone: '+966503333333',
        city: 'الرياض',
        location: 'حي الملز، الرياض',
        description: 'استشاري الأمراض الجلدية',
        rating: 4.7,
        ratingCount: 8,
        status: EntityStatus.ACTIVE,
        isOnline: false,
        clinicId: clinic.id,
      },
      {
        serialNumber: 'DOC-2024-004',
        name: 'د. نورة الزهراني',
        email: 'noura.neuro@mydoc.com',
        password: passwordHash,
        specialization: 'الأعصاب',
        phone: '+966504444445',
        city: 'الرياض',
        location: 'حي العليا، الرياض',
        description: 'استشارية الأمراض العصبية',
        rating: 4.9,
        ratingCount: 15,
        status: EntityStatus.ACTIVE,
        isOnline: true,
        clinicId: clinic.id,
      },
    ],
  });

  await prisma.doctorSchedule.createMany({
    data: [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY].map(
      (day) => ({ doctorId: doctor.id, dayOfWeek: day, startTime: '09:00', endTime: '17:00' }),
    ),
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    await prisma.doctorAvailabilitySlot.createMany({
      data: ['09:00', '10:00', '11:00', '14:00', '15:00'].map((time) => ({
        doctorId: doctor.id,
        date,
        time,
        isBooked: false,
      })),
    });
  }

  await prisma.doctorChatSettings.create({ data: { doctorId: doctor.id, repliesEnabled: true } });

  const patient = await prisma.patient.create({
    data: {
      name: 'محمد العلي',
      email: 'mohammed.patient@mydoc.com',
      password: passwordHash,
      phone: '+966504444444',
      status: EntityStatus.ACTIVE,
    },
  });

  const appointmentDate = new Date(today);
  appointmentDate.setDate(today.getDate() + 1);

  await prisma.appointment.create({
    data: {
      doctorId: doctor.id,
      patientId: patient.id,
      date: appointmentDate,
      time: '10:00',
      status: AppointmentStatus.CONFIRMED,
      attendanceStatus: AttendanceStatus.PENDING,
    },
  });

  await prisma.doctorAvailabilitySlot.updateMany({
    where: { doctorId: doctor.id, date: appointmentDate, time: '10:00' },
    data: { isBooked: true },
  });

  await prisma.rating.create({
    data: { doctorId: doctor.id, patientId: patient.id, rating: 5, comment: 'طبيب ممتاز' },
  });

  await prisma.notification.create({
    data: {
      targetType: NotificationTargetType.PATIENT,
      targetId: patient.id,
      title: 'مرحباً',
      message: 'تم تأكيد موعدك',
      type: NotificationType.APPOINTMENT,
    },
  });

  await prisma.complaint.create({
    data: {
      userType: ComplaintUserType.PATIENT,
      userId: patient.id,
      subject: 'تأخير',
      body: 'انتظرت طويلاً',
      status: ComplaintStatus.OPEN,
    },
  });

  await prisma.chatMessage.create({
    data: {
      doctorId: doctor.id,
      patientId: patient.id,
      senderType: SenderType.PATIENT,
      message: 'السلام عليكم',
    },
  });

  await prisma.activityLog.create({
    data: { action: 'SEED', adminName: superAdmin.name, details: 'Initial seed' },
  });

  console.log(`Seed done. Default password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
