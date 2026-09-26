import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import {
  publishMailboxEvent,
  readMailboxEvents,
  readWorkerIdentity,
} from "./ci-mailbox.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  exec,
  launcher,
  releaseRun,
  sha,
  setupProcessMailbox,
  spawnIdleNode,
} from "./ci-mailbox-process-test-fixtures.mjs";
import { awaitWorkerSignal, waitForFile } from "./watch-ci-test-fixtures.mjs";

test("a symlink-equivalent entry path still runs the probe CLI body", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-mailbox-symlink-storage-"));
  const linkDir = mkdtempSync(join(tmpdir(), "ci-mailbox-symlink-entry-"));
  const entry = join(linkDir, "ci-mailbox-entry.mjs");
  symlinkSync(launcher, entry);
  t.after(() => {
    rmSync(storage, { recursive: true, force: true });
    rmSync(linkDir, { recursive: true, force: true });
  });
  const env = { ...process.env, DOUGH_CI_MAILBOX_ROOT: storage };

  const { stdout } = await exec(process.execPath, [entry, "probe"], {
    env,
    timeout: 5000,
  });

  assert.match(stdout, /^CI_OBSERVER /);
  const { directory } = JSON.parse(stdout.slice("CI_OBSERVER ".length));
  assert.equal(resolve(dirname(directory)), resolve(storage));
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "finished",
  });
  assert.deepEqual(
    readMailboxEvents(directory).map(({ event }) => event),
    [{ type: "CI_MONITOR_READY" }],
  );
});

test("execution launcher returns before startup discovery and appends its eventual failure", async (t) => {
  const { directory, mailbox, stdout, deliver } = await setupProcessMailbox(t, [
    "--execution",
    "owner/repo",
    "main",
    "60000",
  ]);
  await awaitWorkerSignal(mailbox, join(directory, "started"));
  assert.equal(existsSync(join(mailbox, "result.json")), false);
  writeFileSync(join(directory, "caller-continued"), "");
  await deliver("cursor", stdout);

  const retained = { type: "CI_INCOMPLETE", runId: 41, attempt: 1 };
  publishMailboxEvent(mailbox, retained);
  releaseRun(directory, { createdAt: "2026-09-05T12:00:00Z" });

  await waitForFile(join(mailbox, "events", "000000000002.json"));
  assert.equal(existsSync(join(directory, "caller-continued")), true);
  assert.deepEqual(
    readMailboxEvents(mailbox).map(({ event }) => event),
    [
      retained,
      {
        type: "CI_FAILURE",
        repo: "owner/repo",
        sha,
        branch: "main",
        workflow: "ci.yml",
        runId: 42,
        attempt: 1,
        conclusion: "failure",
        failedJobs: [],
      },
    ],
  );
  const delivered = await deliver("cursor");
  assert.match(
    delivered.additional_context,
    /"type":"CI_INCOMPLETE","runId":41/,
  );
  assert.match(
    delivered.additional_context,
    /"type":"CI_FAILURE","repo":"owner\/repo"/,
  );
  assert.deepEqual(await deliver("cursor"), {});
});

for (const host of ["cursor", "claude"])
  for (const conclusion of ["failure", "success"]) {
    test(`${host}: detached execution observer delivers ${conclusion} through the actual hook process`, async (t) => {
      const { directory, mailbox, stdout, deliver, env } =
        await setupProcessMailbox(t);
      await awaitWorkerSignal(mailbox, join(directory, "started"));
      assert.equal(existsSync(join(mailbox, "result.json")), false);
      await deliver(host, stdout);
      assert.deepEqual(await deliver(host), {});
      releaseRun(directory, { conclusion });
      await waitForFile(join(directory, "observed"));
      if (conclusion === "failure")
        await waitForFile(join(mailbox, "events", "000000000001.json"));
      const delivered = await deliver(host);
      if (conclusion === "failure")
        assert.match(JSON.stringify(delivered), /CI_FAILURE/);
      else assert.deepEqual(delivered, {});
      assert.deepEqual(await deliver(host), {});
      await exec(process.execPath, [launcher, "stop", mailbox], { env });
    });
  }

test("launcher retains its exact worker while receipt and normal stop stay unchanged", async (t) => {
  const {
    directory,
    mailbox,
    stdout: launchReceipt,
    env,
  } = await setupProcessMailbox(t, [
    "--execution",
    "owner/repo",
    "main",
    "60000",
  ]);
  await awaitWorkerSignal(mailbox, join(directory, "started"));
  assert.deepEqual(readWorkerIdentity(mailbox), {
    pid: Number(readFileSync(join(directory, "worker-pid"))),
  });
  assert.equal(
    launchReceipt,
    `CI_OBSERVER ${JSON.stringify({ directory: mailbox })}\n`,
  );
  const { stdout } = await exec(process.execPath, [launcher, "stop", mailbox], {
    env,
  });
  await waitForFile(join(directory, "request-stopped"));
  const expectedTerminal = {
    status: "stopped",
    coverage: { state: "ended", pendingCi: "unobserved" },
    evidence: { recordedThrough: 0, deliveredThrough: 0, unread: 0 },
  };
  assert.deepEqual(
    JSON.parse(readFileSync(join(mailbox, "result.json"))),
    expectedTerminal,
  );
  assert.deepEqual(JSON.parse(stdout.slice("CI_OBSERVER ".length)), {
    directory: mailbox,
    terminal: expectedTerminal,
  });

  const repeated = await exec(process.execPath, [launcher, "stop", mailbox], {
    env,
  });
  assert.equal(repeated.stdout, stdout);
});

test("missing terminal publication stops only the retained worker and reports lost coverage", async (t) => {
  const { directory, mailbox, env } = await setupProcessMailbox(t, [
    "--execution",
    "owner/repo",
    "main",
    "60000",
  ]);
  await awaitWorkerSignal(mailbox, join(directory, "started"));
  const { pid } = readWorkerIdentity(mailbox);
  const unrelated = await spawnIdleNode(t, [launcher, "worker"]);

  const retained = { type: "CI_FAILURE", runId: 41, attempt: 1 };
  publishMailboxEvent(mailbox, retained);
  await exec("mkfifo", [join(mailbox, "result.json.tmp")]);

  // The FIFO holds the live worker's publication open, so no deadline length
  // lets it publish; a short one still fires, without the 5 s default wait.
  const { stdout } = await exec(process.execPath, [launcher, "stop", mailbox], {
    env: { ...env, DOUGH_CI_TERMINAL_RESULT_DEADLINE_MS: "300" },
    timeout: 10000,
  });
  const terminal = JSON.parse(stdout.slice("CI_OBSERVER ".length)).terminal;

  assert.deepEqual(readMailboxEvents(mailbox), [
    { sequence: 1, event: retained },
  ]);
  assert.deepEqual(terminal, {
    status: "stopped",
    coverage: {
      state: "lost",
      pendingCi: "unobserved",
      reason:
        "CI observer terminal result was not published before its lifecycle deadline",
    },
    evidence: { recordedThrough: 1, deliveredThrough: 0, unread: 1 },
  });
  assert.equal(checkMailboxWorkerLiveness({ pid }, mailbox), "dead");
  assert.doesNotThrow(() => process.kill(unrelated.pid, 0));
});

test("stop and publication race retains prior unread evidence without continuation", async (t) => {
  const { directory, mailbox, stdout, deliver, env } =
    await setupProcessMailbox(t, [
      "--execution",
      "owner/repo",
      "main",
      "60000",
    ]);
  await awaitWorkerSignal(mailbox, join(directory, "started"));
  await deliver("cursor", stdout);
  const retained = { type: "CI_FAILURE", runId: 41, attempt: 1 };
  publishMailboxEvent(mailbox, retained);

  releaseRun(directory, { createdAt: "2026-09-05T12:00:00Z" });
  const stopped = await exec(process.execPath, [launcher, "stop", mailbox], {
    env,
  });

  const records = readMailboxEvents(mailbox);
  assert.deepEqual(records[0], { sequence: 1, event: retained });
  const terminal = JSON.parse(readFileSync(join(mailbox, "result.json")));
  assert.equal(terminal.evidence.unread >= 1, true);
  const delivered = await deliver("cursor");
  assert.match(delivered.additional_context, /"runId":41/);
  assert.deepEqual(await deliver("cursor", stopped.stdout), {});
});
