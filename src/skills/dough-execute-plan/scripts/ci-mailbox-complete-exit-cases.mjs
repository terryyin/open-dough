import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createMailbox,
  recordWorkerIdentity,
  workerLossReason,
} from "./ci-mailbox.mjs";
import { stopMailbox } from "./ci-mailbox-complete.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  deferChildExit,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { awaitSignalWhileRunning } from "./process-lifetime-test-fixtures.mjs";

// A mailbox whose recorded worker is a stub started from `source`, with a
// command line matching a mailbox worker's so stop treats it as one. It
// returns once the stub has run `source`, so the stub already watches for
// the stop request that a test then makes.
async function mailboxWithStubWorker(t, source) {
  const storage = mkdtempSync(join(tmpdir(), "ci-stop-exit-"));
  const teardown = fixtureTeardown(storage);
  t.after(teardown.cleanup);
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/repo",
      branch: "main",
      maxDurationMs: 60000,
    },
    { storage },
  );
  const stub = join(storage, "ci-mailbox.mjs");
  const ready = join(storage, "stub-ready");
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
  return { storage, directory, child };
}

test("explicit stop returns only after the worker exits the post-terminal window", async (t) => {
  const { storage, directory, child } = await mailboxWithStubWorker(
    t,
    `import { existsSync, renameSync, watch, writeFileSync } from "node:fs";
import { join } from "node:path";
const directory = process.argv[3];
let published = false;
const check = () => {
  if (published || !existsSync(join(directory, "stop"))) return;
  published = true;
  const result = join(directory, "result.json");
  writeFileSync(result + ".tmp", JSON.stringify({ status: "stopped" }));
  renameSync(result + ".tmp", result);
  setTimeout(() => process.exit(0), 300);
};
watch(directory, check);
check();
setInterval(() => {}, 1000);
`,
  );

  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.status, "stopped");
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, directory),
    "dead",
  );
});

test("stop ends when the worker exits without publishing and reports it lost", async (t) => {
  const { storage, directory, child } = await mailboxWithStubWorker(
    t,
    `import { existsSync, watch } from "node:fs";
import { join } from "node:path";
const directory = process.argv[3];
const check = () => {
  if (existsSync(join(directory, "stop"))) process.exit(1);
};
watch(directory, check);
check();
setInterval(() => {}, 1000);
`,
  );

  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.coverage.state, "lost");
  assert.equal(terminal.coverage.reason, workerLossReason);
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, directory),
    "dead",
  );
});
