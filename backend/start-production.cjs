'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');

const tag = '[mydoc-start]';

console.log(`${tag} cwd:`, process.cwd());
try {
  console.log(`${tag} root files:`, fs.readdirSync(process.cwd()).join(', '));
} catch (error) {
  console.error(`${tag} cannot read cwd:`, error);
}

require('./ensure-env.cjs');

console.log(`${tag} PORT=`, process.env.PORT || '(not set)');

const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]?.trim()) {
    console.error(`${tag} FATAL: missing env ${key} — add it in backend/.env`);
    process.exit(1);
  }
}

if ((process.env.JWT_SECRET?.length ?? 0) < 32) {
  console.error(`${tag} FATAL: JWT_SECRET must be at least 32 characters`);
  process.exit(1);
}

const entry = path.join(process.cwd(), 'dist', 'server.js');
if (!fs.existsSync(entry)) {
  console.error(`${tag} FATAL: build output missing:`, entry);
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    console.error(`${tag} dist contains:`, fs.readdirSync(path.join(process.cwd(), 'dist')).join(', '));
  }
  console.error(`${tag} Run npm run production:build before starting the API`);
  process.exit(1);
}

console.log(`${tag} launching`, entry);
require(entry);
