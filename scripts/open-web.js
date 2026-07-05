const http = require('http');
const { exec } = require('child_process');

const URL = 'http://localhost:8082';
const BUNDLE_PATH =
  '/node_modules/expo/AppEntry.bundle?platform=web&dev=true&hot=false&lazy=true';
const MAX_ATTEMPTS = 90;
const INTERVAL_MS = 2000;

function checkUrl(path) {
  return new Promise((resolve) => {
    const req = http.get(`${URL}${path}`, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function openBrowser() {
  const cmd =
    process.platform === 'win32'
      ? `cmd /c start "" "${URL}"`
      : process.platform === 'darwin'
        ? `open "${URL}"`
        : `xdg-open "${URL}"`;

  exec(cmd, (err) => {
    if (err) {
      console.log(`[open] Could not open browser. Visit ${URL} manually.`);
      return;
    }
    console.log(`[open] Opened ${URL} in your browser.`);
  });
}

async function waitAndOpen() {
  console.log(`[open] Waiting for ${URL} ...`);
  console.log('[open] First web build can take 1–2 minutes. Please keep the terminal open.');

  let serverReady = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (!serverReady) {
      serverReady = await checkUrl('/');
      if (serverReady) {
        console.log('[open] Dev server is up. Waiting for web bundle...');
      }
    } else {
      const bundleReady = await checkUrl(BUNDLE_PATH);
      if (bundleReady) {
        openBrowser();
        return;
      }
    }

    if (attempt % 15 === 0) {
      console.log('[open] Still building… (this is normal on first run)');
    }

    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  console.log(`[open] Timed out waiting for bundle. Open ${URL} manually and refresh.`);
}

waitAndOpen();
