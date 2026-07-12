/**
 * One-time baseline when Neon already has tables (Prisma P3005).
 * Run locally with production DATABASE_URL / DIRECT_DATABASE_URL set:
 *   node scripts/baseline-migrations.cjs
 */
const { execSync } = require('node:child_process');

require('../ensure-env.cjs');

const migrations = [
  '20250620000000_init',
  '20250625000000_add_doctor_location',
];

for (const name of migrations) {
  try {
    execSync(`npx prisma migrate resolve --applied ${name}`, { stdio: 'inherit' });
    console.log(`[baseline] marked applied: ${name}`);
  } catch (error) {
    console.error(`[baseline] failed for ${name}:`, error.message);
  }
}
