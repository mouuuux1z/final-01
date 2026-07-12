const { execSync } = require('node:child_process');

function deriveDirectUrl(poolUrl) {
  try {
    const parsed = new URL(poolUrl);
    parsed.hostname = parsed.hostname.replace('-pooler', '');
    parsed.searchParams.delete('pgbouncer');
    parsed.searchParams.delete('channel_binding');
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    return parsed.toString();
  } catch {
    return poolUrl.replace('-pooler', '').replace(/[&?]pgbouncer=true/g, '');
  }
}

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL =
    'postgresql://build:build@127.0.0.1:5432/build?schema=public';
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL;
  console.log('[ensure-env] Placeholder DATABASE_URL for prisma generate (build only)');
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    /[&?]channel_binding=require/g,
    '',
  );

  if (!process.env.DIRECT_DATABASE_URL?.trim()) {
    process.env.DIRECT_DATABASE_URL = deriveDirectUrl(process.env.DATABASE_URL);
    console.log('[ensure-env] DIRECT_DATABASE_URL derived from DATABASE_URL');
  }
}

// Do NOT set PORT here — Railway injects PORT automatically.

const command = process.argv[2];
if (command === '--generate') {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
}
