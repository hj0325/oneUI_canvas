const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const cwd = path.join(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const previewPath = '/theme-preview.html';
const url = `http://127.0.0.1:${port}${previewPath}`;

const serveMain = path.join(cwd, 'node_modules', 'serve', 'build', 'main.js');
const child = spawn(process.execPath, [
    serveMain,
    '.',
    '-p',
    String(port),
    '--no-port-switching',
  ], {
  cwd,
  stdio: 'inherit',
});

let opened = false;

function tryOpen() {
  const req = http.get(url, { timeout: 1500 }, (res) => {
    res.resume();
    if (!opened) {
      opened = true;
      spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
    }
  });
  req.on('error', () => setTimeout(tryOpen, 250));
  req.on('timeout', () => {
    req.destroy();
    setTimeout(tryOpen, 250);
  });
}

setTimeout(tryOpen, 400);

function shutdown() {
  child.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
