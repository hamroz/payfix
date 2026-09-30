// Renders brand/video/intro.html to an MP4 by stepping its render(t) function
// in headless Chrome over the DevTools protocol, then encoding with ffmpeg.
//
// Usage:
//   node brand/video/render.mjs --out brand/payfix-intro.mp4 [--fps 60] [--duration 10] [--frames DIR]
//   node brand/video/render.mjs --still 4.5 --out still.png

import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const fps = Number(args.fps ?? 60);
const duration = Number(args.duration ?? 10);
const out = resolve(args.out ?? 'brand/payfix-intro.mp4');
const still = args.still !== undefined ? Number(args.still) : null;
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const page = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'intro.html')).href;
const port = 9333;

const profile = mkdtempSync(join(tmpdir(), 'payfix-chrome-'));
const browser = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1920,1080', 'about:blank',
], { stdio: 'ignore' });

async function target() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const pageTarget = list.find(t => t.type === 'page');
      if (pageTarget) return pageTarget.webSocketDebuggerUrl;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Chrome did not start');
}

const ws = new WebSocket(await target());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
const listeners = [];
ws.onmessage = ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) rej(new Error(msg.error.message));
    else res(msg.result);
  } else if (msg.method) {
    listeners.forEach(l => l(msg));
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'evaluate failed');
  return r.result.value;
};
const shot = async () => Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64');

try {
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  const loaded = new Promise(r => listeners.push(m => m.method === 'Page.loadEventFired' && r()));
  await send('Page.navigate', { url: page });
  await loaded;
  const fontOk = await evaluate('window.ready');
  if (!fontOk) console.warn('Sora did not load; the wordmark will use a fallback font.');

  if (still !== null) {
    await evaluate(`render(${still})`);
    writeFileSync(out, await shot());
    console.log(`Wrote ${out}`);
  } else {
    const frames = resolve(args.frames ?? mkdtempSync(join(tmpdir(), 'payfix-frames-')));
    mkdirSync(frames, { recursive: true });
    const total = Math.round(fps * duration);
    for (let f = 0; f < total; f++) {
      await evaluate(`render(${f / fps})`);
      writeFileSync(join(frames, `${String(f).padStart(4, '0')}.png`), await shot());
      if (f % fps === 0) console.log(`frame ${f}/${total}`);
    }
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frames, '%04d.png'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out,
    ], { stdio: 'inherit' });
    if (!args.frames) rmSync(frames, { recursive: true, force: true });
    console.log(`Wrote ${out}`);
  }
} finally {
  ws.close();
  const exited = new Promise(r => browser.once('exit', r));
  browser.kill();
  await exited;
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
