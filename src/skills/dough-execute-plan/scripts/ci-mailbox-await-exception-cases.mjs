import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import {
  exec,
  launchAwait,
  parseReceipt,
  register,
} from "./ci-mailbox-await-test-fixtures.mjs";
import {
  createMailbox,
  publishMailboxEvent,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import {
  launcher,
  releaseRun,
  setupProcessMailbox,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";

test("missing registration, incomplete coverage, unavailable observation, and explicit wait cancellation stay distinct", async (t) => {
  await t.test("missing registration", async (t) => {
    const fixture = await setupProcessMailbox(t);
    const { stdout } = await exec(
      process.execPath,
      [launcher, "await-revision", fixture.mailbox, sha],
      { env: fixture.env },
    );
    assert.equal(parseReceipt(stdout).unresolvedReason, "missing_registration");
  });

  await t.test("terminal incomplete coverage", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    const waiting = launchAwait(fixture.env, fixture.mailbox);
    releaseRun(fixture.directory, {
      status: "completed",
      conclusion: "cancelled",
    });
    const completed = await waiting.completed;
    const result = parseReceipt(completed.stdout);
    assert.equal(result.unresolvedReason, "incomplete");
    assert.equal(result.effectiveEvidence.revision.state, "incomplete");
  });

  await t.test("monitor unavailable event", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    const waiting = launchAwait(fixture.env, fixture.mailbox);
    publishMailboxEvent(fixture.mailbox, {
      type: "CI_MONITOR_UNAVAILABLE",
      repo: "owner/repo",
      branch: "main",
      reason: "provider unavailable",
    });
    const completed = await waiting.completed;
    const result = parseReceipt(completed.stdout);
    assert.equal(result.unresolvedReason, "observation_unavailable");
    assert.equal(result.detail, "monitor_unavailable");
  });

  await t.test("wait cancellation", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    const waiting = launchAwait(fixture.env, fixture.mailbox);
    await waiting.waitForCancellationReady();
    waiting.child.kill("SIGTERM");
    const completed = await waiting.completed;
    const result = parseReceipt(completed.stdout);
    assert.equal(completed.code, 0, completed.stderr);
    assert.equal(result.unresolvedReason, "wait_cancelled");
    assert.equal(existsSync(join(fixture.mailbox, "stop")), false);
    assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
  });
});

test("a discovery advisory is nonterminal, while stopped observation and timeout return their own bounded outcomes", async (t) => {
  await t.test("discovery advisory and observation cancellation", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    const waiting = launchAwait(fixture.env, fixture.mailbox);
    publishMailboxEvent(fixture.mailbox, {
      type: "CI_DISCOVERY_DELAYED",
      repo: "owner/repo",
      branch: "main",
      revisions: [sha],
    });
    // The second recheck follows a complete read that began after the advisory
    // was published; a receipt written instead would end the wait.
    await waiting.waitForRechecks(2);
    assert.equal(waiting.output(), "");
    await exec(process.execPath, [launcher, "stop", fixture.mailbox], {
      env: fixture.env,
    });
    const result = parseReceipt((await waiting.completed).stdout);
    assert.equal(result.unresolvedReason, "observation_cancelled");
  });

  await t.test(
    "deterministic timeout with missing inherited basis",
    async (t) => {
      const storage = mkdtempSync(join(tmpdir(), "ci-await-timeout-"));
      t.after(() => rmSync(storage, { recursive: true, force: true }));
      const directory = createMailbox(
        {
          mode: "execution",
          repo: "owner/repo",
          branch: "main",
          maxDurationMs: 60_000,
        },
        { root: process.cwd(), storage },
      );
      registerPushedRevision(directory, sha);
      publishJson(join(directory, "coverage"), `${sha}.json`, {
        sha,
        state: "not_required",
      });
      let time = 0;
      const result = await awaitRevision(directory, sha, {
        root: process.cwd(),
        storage,
        deadlineMs: 20,
        now: () => time,
        sleep: async (duration) => {
          time += duration;
        },
        workerLiveness: () => "alive",
      });
      assert.equal(result.unresolvedReason, "timeout");
      assert.deepEqual(result.effectiveEvidence, {
        source: "not_required_basis",
        revision: { sha, state: "not_required" },
      });
    },
  );
});

function pendingMailbox(t) {
  const storage = mkdtempSync(join(tmpdir(), "ci-await-bounded-"));
  t.after(() => rmSync(storage, { recursive: true, force: true }));
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/repo",
      branch: "main",
      maxDurationMs: 60_000,
    },
    { root: process.cwd(), storage },
  );
  registerPushedRevision(directory, sha);
  return { directory, storage };
}

test("dead, ended, and unreadable observation evidence have explicit bounded results", async (t) => {
  await t.test("dead worker", async (t) => {
    const { directory, storage } = pendingMailbox(t);
    const result = await awaitRevision(directory, sha, {
      root: process.cwd(),
      storage,
      workerLiveness: () => "dead",
    });
    assert.equal(result.unresolvedReason, "observation_unavailable");
    assert.equal(result.detail, "worker_exited");
  });

  await t.test("ended observation", async (t) => {
    const { directory, storage } = pendingMailbox(t);
    publishJson(directory, "result.json", { status: "finished" });
    const result = await awaitRevision(directory, sha, {
      root: process.cwd(),
      storage,
      workerLiveness: () => "alive",
    });
    assert.equal(result.unresolvedReason, "observation_unavailable");
    assert.equal(result.detail, "observation_ended");
  });

  await t.test("unreadable coverage", async (t) => {
    const { directory, storage } = pendingMailbox(t);
    writeFileSync(join(directory, "coverage", `${sha}.json`), "not json");
    const result = await awaitRevision(directory, sha, {
      root: process.cwd(),
      storage,
      workerLiveness: () => "alive",
    });
    assert.equal(result.unresolvedReason, "evidence_unreadable");
    assert.equal(result.effectiveEvidence.source, "unreadable");
  });
});
