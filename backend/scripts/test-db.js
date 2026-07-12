require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('DATABASE: OK');
  } catch (error) {
    console.log('DATABASE: FAIL');
    console.log(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
