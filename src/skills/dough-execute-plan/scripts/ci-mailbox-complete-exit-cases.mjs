import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createMailbox, recordWorkerIdentity } from "./ci-mailbox.mjs";
import { stopMailbox } from "./ci-mailbox-complete.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";

test("explicit stop returns only after the worker exits the post-terminal window", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-stop-exit-"));
  t.after(() => rmSync(storage, { recursive: true, force: true }));
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
    `import { existsSync, watch, writeFileSync } from "node:fs";
import { join } from "node:path";
const directory = process.argv[3];
const check = () => {
  if (!existsSync(join(directory, "stop"))) return;
  writeFileSync(join(directory, "result.json"), JSON.stringify({ status: "stopped" }));
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
  t.after(() => {
    try {
      child.kill("SIGKILL");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  });
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
