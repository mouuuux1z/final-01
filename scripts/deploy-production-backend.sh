#!/bin/bash
# Run ON the production server (197.140.142.178) inside the backend project folder.
set -euo pipefail

echo "=== MYDoc backend deploy ==="

if [ ! -f package.json ]; then
  echo "ERROR: Run this script from the backend/ directory on the server."
  exit 1
fi

echo "[1/4] npm install"
npm install

echo "[2/4] prisma migrate deploy"
npm run db:migrate:deploy

echo "[3/4] production build"
npm run production:build

echo "[4/4] restart API process"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart mydoc || pm2 start npm --name mydoc -- run production:start
  pm2 save
elif systemctl is-active --quiet mydoc 2>/dev/null; then
  sudo systemctl restart mydoc
else
  echo "Restart manually: npm run production:start"
fi

echo ""
echo "Verify from your PC:"
echo "  npm run verify:queue"
