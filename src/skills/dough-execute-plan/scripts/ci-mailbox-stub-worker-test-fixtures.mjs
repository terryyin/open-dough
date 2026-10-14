import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { recordWorkerIdentity } from "./ci-mailbox-store.mjs";
import { deferChildExit } from "./fixture-teardown-test-fixtures.mjs";
import { awaitSignalWhileRunning } from "./process-lifetime-test-fixtures.mjs";

// Start a mailbox-shaped worker, returning only after it has run its source
// and is ready to observe a stop request. The caller owns the mailbox state.
export async function startStubWorker({ root, directory, teardown, source }) {
  const stub = join(root, "ci-mailbox.mjs");
  const ready = join(root, "stub-ready");
  writeFileSync(
    stub,
    `${source}
import("node:fs").then(({ writeFileSync }) =>
  writeFileSync(process.env.STUB_READY, ""),
);
`,
  );
  const child = spawn(process.execPath, [stub, "worker", directory], {
    env: { ...process.env, STUB_READY: ready },
    stdio: "ignore",
  });
  deferChildExit(teardown, child, "SIGKILL");
  await new Promise((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });
  recordWorkerIdentity(directory, { pid: child.pid });
  await awaitSignalWhileRunning(
    () => existsSync(ready),
    () => child.exitCode !== null || child.signalCode !== null,
    () => `The stub worker exited before running: ${child.exitCode}`,
  );
  return child;
}

// A stopped result precedes process exit. A changed process title reproduces
// the uncertain exit window; null delay leaves that window open until teardown.
export function publishThenExitSource({
  exitingCommand,
  exitDelayMs = 300,
} = {}) {
  const showExitingCommand =
    exitingCommand === undefined
      ? ""
      : `  process.title = ${JSON.stringify(exitingCommand)};\n`;
  const exit =
    exitDelayMs === null
      ? ""
      : `  setTimeout(() => process.exit(0), ${exitDelayMs});\n`;
  return `import { existsSync, renameSync, watch, writeFileSync } from "node:fs";
import { join } from "node:path";
const directory = process.argv[3];
let published = false;
const check = () => {
  if (published || !existsSync(join(directory, "stop"))) return;
  published = true;
${showExitingCommand}  const result = join(directory, "result.json");
  writeFileSync(result + ".tmp", JSON.stringify({ status: "stopped" }));
  renameSync(result + ".tmp", result);
${exit}};
watch(directory, check);
check();
setInterval(() => {}, 1000);
`;
}
