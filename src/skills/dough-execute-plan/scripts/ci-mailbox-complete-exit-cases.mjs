import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createMailbox, recordWorkerIdentity } from "./ci-mailbox.mjs";
import { stopMailbox } from "./ci-mailbox-complete.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  deferChildExit,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";

test("explicit stop returns only after the worker exits the post-terminal window", async (t) => {
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
  // Stub command line must match mailbox-worker identity so stop waits on it.
  const stub = join(storage, "ci-mailbox.mjs");
  writeFileSync(
    stub,
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
  const child = spawn(process.execPath, [stub, "worker", directory], {
    stdio: "ignore",
  });
  deferChildExit(teardown, child, "SIGKILL");
  await new Promise((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });
  recordWorkerIdentity(directory, { pid: child.pid });

  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.status, "stopped");
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, directory),
    "dead",
  );
});
