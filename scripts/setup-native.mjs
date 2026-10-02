// Acquisition stays separate from test execution. CI supplies one deadline
// across its Node/cache actions and these commands; native callers get 180s.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const stage = process.argv[2];
const recovery =
  "Restore source connectivity and rerun setup before running checks.";
function fail(message) {
  console.error(`Infrastructure setup: ${message}. ${recovery}`);
  process.exit(1);
}
if (!["npm", "browser", "check"].includes(stage)) {
  fail("choose npm, browser, or check with node scripts/setup-native.mjs");
}
const started = Date.now();
const suppliedDeadline = process.env.OPEN_DOUGH_SETUP_DEADLINE_MS;
const deadline =
  suppliedDeadline === undefined
    ? started + 180_000
    : Math.min(Number(suppliedDeadline), started + 180_000);
if (!Number.isFinite(deadline)) {
  fail("invalid acquisition deadline");
}
const selectedNode = readFileSync(".node-version", "utf8").trim();
if (process.versions.node !== selectedNode) {
  fail(
    `Node prerequisite mismatch: selected ${selectedNode}, actual ${process.versions.node}; install the version in .node-version`,
  );
}

if (stage !== "npm") {
  let installed;
  let locked;
  try {
    locked = JSON.parse(readFileSync("package-lock.json", "utf8")).packages[
      "node_modules/playwright"
    ].version;
    installed = JSON.parse(
      readFileSync("node_modules/playwright/package.json", "utf8"),
    ).version;
  } catch {
    fail("locked Playwright prerequisite unavailable; run the npm setup stage");
  }
  if (installed !== locked) {
    fail(
      `Playwright prerequisite mismatch: locked ${locked}, installed ${installed}; run the npm setup stage`,
    );
  }
}
if (stage === "check") {
  console.log(
    `Native prerequisites: Node ${selectedNode}, locked Playwright installed`,
  );
  process.exit(0);
}

const limits = { npm: 45_000, browser: 45_000 };
const remaining = Math.min(limits[stage], deadline - Date.now());
if (remaining <= 0) {
  fail(`${stage} source acquisition deadline expired before launch`);
}
// Invoke the installed CLI directly: npx must never fetch an unlocked package.
const command = stage === "npm" ? "npm" : process.execPath;
const args =
  stage === "npm"
    ? ["ci", "--fetch-retries=0", "--fetch-timeout=20000"]
    : [resolve("node_modules/playwright/cli.js"), "install", "chromium"];
console.log(
  `Native setup: ${stage} source acquisition, at most ${Math.ceil(remaining / 1000)}s`,
);
const child = spawn(command, args, {
  stdio: "inherit",
  detached: true,
  env: { ...process.env, PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT: "20000" },
});
let timedOut = false;
let interruption;
function stopAcquisition() {
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    /* Already exited. */
  }
}
function interrupt(signal) {
  interruption = signal;
  stopAcquisition();
}
const onInterrupt = () => interrupt("SIGINT");
const onTerminate = () => interrupt("SIGTERM");
process.on("SIGINT", onInterrupt);
process.on("SIGTERM", onTerminate);
const timer = setTimeout(() => {
  timedOut = true;
  // Stop npm/Playwright's entire download process group, including retries.
  stopAcquisition();
}, remaining);
const result = await new Promise((done) => {
  child.once("error", (error) => done({ error }));
  child.once("exit", (code, signal) => done({ code, signal }));
});
clearTimeout(timer);
process.off("SIGINT", onInterrupt);
process.off("SIGTERM", onTerminate);
if (interruption) {
  console.error(
    `Infrastructure setup: ${stage} source acquisition interrupted (${interruption}). ${recovery}`,
  );
  process.exit(interruption === "SIGINT" ? 130 : 143);
}
if (timedOut) {
  fail(`${stage} source stalled: acquisition deadline exceeded`);
}
if (result.error) {
  fail(`${stage} source unavailable: ${result.error.message}`);
}
if (result.code !== 0) {
  fail(`${stage} source acquisition failed (${result.signal ?? result.code})`);
}
console.log(`Native setup: ${stage} acquisition complete`);
