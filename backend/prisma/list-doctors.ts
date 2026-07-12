import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.doctor.findMany({
    select: { id: true, name: true, email: true, specialization: true, status: true },
    orderBy: { serialNumber: 'asc' },
  });
  console.log(JSON.stringify(doctors, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
