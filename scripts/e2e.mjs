// End-to-end rehearsal of the demo script in a real headless Chrome.
//
//   node scripts/e2e.mjs                          # against http://localhost:3300
//   node scripts/e2e.mjs https://payfix-mu.vercel.app
//
// Signs up a fresh visitor, creates a demo company, pays $600 + $500, checks the
// oversized-payment message, runs the customer resolution (including "request changes"),
// approves, refunds, and verifies the receipt reconciles. Needs DEMO_MODE on the target.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.argv[2] ?? "http://localhost:3300").replace(/\/$/, "");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9335;
const email = `e2e+${Date.now()}@demo.test`;

const profile = mkdtempSync(join(tmpdir(), "payfix-e2e-"));
const browser = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });

let ws;
let seq = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "evaluate failed");
  return r.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(desc, js, timeout = 45_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const v = await evaluate(js);
      if (v) return v;
    } catch {}
    await sleep(400);
  }
  const text = await evaluate(`document.body.innerText.slice(0, ${process.env.E2E_DEBUG ? 4000 : 600})`).catch(() => "");
  throw new Error(`Timed out waiting for: ${desc}\n--- page ---\n${text}`);
}
const waitText = (t, timeout) => waitFor(`text "${t}"`, `document.body.innerText.includes(${JSON.stringify(t)})`, timeout);
const goto = async (path) => {
  await send("Page.navigate", { url: path.startsWith("http") ? path : BASE + path });
  await waitFor("page load", "document.readyState === 'complete'");
  await sleep(500);
};
const click = (label) =>
  waitFor(
    `button "${label}"`,
    `(() => { const el = [...document.querySelectorAll('button, a')].find(b => b.innerText.trim().includes(${JSON.stringify(label)}) && !b.disabled); if (el) { el.click(); return true; } return false; })()`,
  );
// React-controlled inputs need the native setter plus an input event.
const type = (selector, value) =>
  waitFor(
    `input ${selector}`,
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false;
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`,
  );
const latestCode = (to) =>
  waitFor(`code for ${to}`, `fetch('/api/dev/inbox').then(r => r.json()).then(m => (m.find(x => x.code && x.to === ${JSON.stringify(to)}) || {}).code || null)`);
const latestLink = () => waitFor("resolution link", `fetch('/api/dev/inbox').then(r => r.json()).then(m => (m.find(x => x.link && x.link.includes('/r/')) || {}).link || null)`);
const pasteCode = (code) =>
  evaluate(`(() => { const el = document.querySelector('input[autocomplete="one-time-code"]'); const dt = new DataTransfer(); dt.setData('text', ${JSON.stringify(code)});
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); return true; })()`);
const step = (name) => console.log(`\n▸ ${name}`);
const ok = (msg) => console.log(`  ✓ ${msg}`);

async function main() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        break;
      }
    } catch {}
    await sleep(100);
  }
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error" && process.env.E2E_DEBUG)
      console.log(`  [console] ${m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 300)}`);
    if (m.method === "Runtime.exceptionThrown" && process.env.E2E_DEBUG) console.log(`  [exception] ${m.params.exceptionDetails.exception?.description?.slice(0, 300)}`);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) rej(new Error(m.error.message));
      else res(m.result);
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  console.log(`PayFix e2e against ${BASE} as ${email}`);

  step("Sign up and create a company");
  await goto("/login");
  await type('input[type="email"]', email);
  await click("Continue");
  await pasteCode(await latestCode(email).then(async (c) => (await waitFor("code input", "!!document.querySelector('input[autocomplete=\"one-time-code\"]')"), c)));
  await waitFor("onboarding", "location.pathname === '/onboarding'");
  await type("#name", "E2E Studio");
  await click("Create company");
  await waitFor("dashboard", "location.pathname === '/app'", 90_000);
  await waitText("Guided demo");
  ok("signed up, company created with its own demo wallet");

  step("Large amounts fit their cards");
  await goto("/app/invoices/new");
  await type("#title", "Enterprise rollout");
  await type("#amount", "10000000");
  await click("Create invoice");
  await waitFor("invoice page", "/^\\/app\\/invoices\\/inv_/.test(location.pathname)");
  await waitText("$10,000,000.00");
  await sleep(1500); // let the count-up animation finish
  if (process.env.E2E_SHOTS) {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    (await import("node:fs")).writeFileSync(join(process.env.E2E_SHOTS, "big-invoice.png"), Buffer.from(data, "base64"));
  }
  const overflow = await evaluate(`[...document.querySelectorAll('.tabular')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.innerText + ' (' + el.scrollWidth + '>' + el.clientWidth + ')')`);
  if (overflow.length) throw new Error(`Amounts overflow their boxes: ${overflow.join(", ")}`);
  ok("$10,000,000.00 fits with nothing cut off");
  await goto("/app");

  step("Customer pays $600, then $500");
  const payPath = await waitFor("pay link", "document.querySelector('a[href^=\"/pay/\"]')?.getAttribute('href')");
  await goto(payPath);
  await type("#amount", "10000000");
  await click("from demo wallet");
  await waitText("only holds");
  ok("oversized payment explained in plain words");
  await type("#amount", "600");
  await click("from demo wallet");
  await waitText("Payment confirmed", 90_000);
  await waitText("$400.00 remains");
  ok("$600 confirmed, $400 remaining");
  await click("Make another payment");
  await type("#amount", "500");
  await click("from demo wallet");
  await waitText("held for your decision", 90_000);
  ok("$500 confirmed, $100 held as excess");

  step("Business sends the resolution link");
  await goto("/app/exceptions");
  const casePath = await waitFor("case", "document.querySelector('a[href^=\"/app/exceptions/case_\"]')?.getAttribute('href')");
  await goto(casePath);
  await click("Send resolution link");
  const link = await latestLink();
  ok("link sent");

  step("Customer verifies and proposes $60 → INV-0002 + $40 refund");
  await goto(link);
  await click("Email me a code");
  await waitFor("code input", "!!document.querySelector('input[autocomplete=\"one-time-code\"]')");
  await pasteCode(await latestCode("ap@acme.test"));
  await click("Split 60 / 40");
  await click("Use demo wallet A");
  await waitText("Ownership verified");
  await click("Send plan to");
  await waitText("Waiting for E2E Studio to approve");
  ok("plan v1 submitted");

  step("Business asks for changes");
  await goto(casePath);
  await click("Request changes");
  await type("textarea", "Please send the refund to your other wallet.");
  await click("Send to customer");
  await waitText("You asked for changes to v1");
  ok("v1 declined with a note");

  step("Customer revises (wallet B), business approves v2 and refunds");
  await goto(link);
  await waitText("asked for a change to version 1");
  await click("Split 60 / 40");
  await click("Use demo wallet B");
  await waitText("Ownership verified");
  await click("Send revised plan (v2)");
  await waitText("Waiting for E2E Studio to approve");
  await goto(casePath);
  await click("Approve v2");
  await click("Run plan v2");
  await click("Sign with demo merchant wallet");
  // The case page reconciles the refund with the chain every few seconds and refreshes itself.
  await waitText("Loop closed", 120_000);
  ok("refund confirmed on chain, case resolved");

  step("Receipt reconciles");
  await goto(casePath.replace("/app/exceptions/", "/receipt/"));
  await waitText("Settled");
  for (const t of ["$1,100.00", "$1,000.00", "$60.00", "$40.00", "$0.00"]) await waitText(t);
  ok("$1,100 = $1,000 + $60 + $40 + $0 unresolved");

  step("Owner invites a viewer; the viewer gets read-only access");
  const viewer = email.replace("e2e+", "viewer+");
  await goto("/app/settings");
  await type('#team input[type="email"]', viewer);
  await waitFor("role select", `(() => { const s = document.querySelectorAll('#team select'); const el = s[s.length - 1]; if (!el) return false;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, 'viewer'); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  await click("Invite");
  await waitText(viewer);
  await evaluate("document.querySelector('[aria-label=\"Switch company\"]').click()");
  await click("Sign out");
  await waitFor("signed out", "location.pathname === '/login'");
  await type('input[type="email"]', viewer);
  await click("Continue");
  await waitFor("code input", "!!document.querySelector('input[autocomplete=\"one-time-code\"]')");
  await pasteCode(await latestCode(viewer));
  await waitFor("dashboard", "location.pathname === '/app'");
  await waitText("View only");
  const canCreate = await evaluate("[...document.querySelectorAll('a')].some(a => a.innerText.includes('New invoice'))");
  if (canCreate) throw new Error("Viewer can see the New invoice button");
  await goto("/app/invoices/new");
  await waitFor("redirect away from new invoice", "location.pathname === '/app/invoices'");
  await goto(casePath);
  await waitText("Loop closed");
  ok("viewer sees the company read-only and can't create invoices");
  console.log("\nAll steps passed.");
}

main()
  .catch((err) => {
    console.error(`\n✗ ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    ws?.close();
    browser.kill();
    await sleep(500);
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  });
