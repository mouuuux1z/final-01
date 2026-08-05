const fs = require('node:fs');
const path = require('node:path');

const entry = path.join(process.cwd(), 'dist', 'server.js');

if (!fs.existsSync(entry)) {
  console.error(`[verify-build] Missing ${entry}`);
  console.error('[verify-build] cwd:', process.cwd());
  console.error('[verify-build] Run npm run production:build from the backend/ directory');
  process.exit(1);
}

console.log('[verify-build] OK:', entry);
