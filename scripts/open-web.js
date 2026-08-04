const http = require('http');
const { exec } = require('child_process');

const URL = 'http://localhost:8082';
// Must match the script URL Expo serves in index.html (without lazy=true).
const BUNDLE_PATH =
  '/node_modules/expo/AppEntry.bundle?platform=web&dev=true&hot=false';
const MIN_BUNDLE_BYTES = 500_000;
const MAX_ATTEMPTS = 150;
const INTERVAL_MS = 2000;

function checkServerUp() {
  return new Promise((resolve) => {
    const req = http.get(`${URL}/`, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForBundleReady() {
  return new Promise((resolve) => {
    console.log('[open] Building web bundle (first run can take 2-3 minutes on OneDrive)...');

    const req = http.get(`${URL}${BUNDLE_PATH}`, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
        const size = chunks.reduce((sum, part) => sum + part.length, 0);
        if (size >= MIN_BUNDLE_BYTES && !resolved) {
          resolved = true;
          req.destroy();
          resolve(true);
        }
      });

      res.on('end', () => {
        if (!resolved) {
          const size = chunks.reduce((sum, part) => sum + part.length, 0);
          resolve(res.statusCode === 200 && size >= MIN_BUNDLE_BYTES);
        }
      });
    });

    let resolved = false;

    req.on('error', () => resolve(false));
    req.setTimeout(240_000, () => {
      if (!resolved) {
        resolved = true;
        req.destroy();
        resolve(false);
      }
    });
  });
}

function openBrowser() {
  const cmd =
    process.platform === 'win32'
      ? `powershell -Command "Start-Process '${URL}'"`
      : process.platform === 'darwin'
        ? `open "${URL}"`
        : `xdg-open "${URL}"`;

  exec(cmd, (err) => {
    if (err) {
      console.log(`[open] Could not open browser automatically. Visit ${URL} manually.`);
      return;
    }
    console.log(`[open] Opened ${URL} in your browser.`);
  });
}

async function waitAndOpen() {
  console.log(`[open] Waiting for ${URL} ...`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const serverReady = await checkServerUp();
    if (serverReady) {
      break;
    }

    if (attempt % 5 === 0) {
      console.log('[open] Waiting for Expo dev server...');
    }

    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  const bundleReady = await waitForBundleReady();

  if (bundleReady) {
    console.log('[open] Web bundle is ready. Opening browser...');
  } else {
    console.log('[open] Bundle warmup timed out. Opening browser anyway...');
  }

  openBrowser();
}

waitAndOpen();
