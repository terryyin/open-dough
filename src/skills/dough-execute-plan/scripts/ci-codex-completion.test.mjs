import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  checkMailboxWorkerLiveness,
  terminateMailboxWorker,
} from "./ci-mailbox-worker-process.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import {
  launchAwait,
  launchComplete,
  parseReceipt,
} from "./ci-mailbox-await-test-fixtures.mjs";
import {
  receiptPrefix,
  readWorkerIdentity,
  recordWorkerIdentity,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import {
  createCodexReplay,
  launcher,
  runCommand,
} from "./ci-codex-lifecycle-test-fixtures.mjs";
import { blockingGithubEnvironment } from "./watch-ci-test-fixtures.mjs";

// The provider is blocked so these tests isolate the live stream/completion
// boundary while publishing the same atomic coverage records as the observer.
test("real stream identity supports pending exact and ancestor completion", async (t) => {
  for (const source of ["exact", "ancestor"]) {
    for (const verdict of ["success", "failure"]) {
      await t.test(`${source} pending to ${verdict}`, async (t) => {
        const { env, teardown } = blockingGithubEnvironment(t);
        const replay = createCodexReplay(teardown, env, {
          exitSignal: "SIGKILL",
        });
        const attached = await replay.setup();
        const identity = readWorkerIdentity(attached.directory);
        assert.equal(
          identity.pid,
          attached.pid,
          "identity exists before receipt",
        );
        assert.equal(
          checkMailboxWorkerLiveness(identity, attached.directory),
          "alive",
          "live stream identity must pass the completion reader verification",
        );
        const sha = "a".repeat(40);
        registerPushedRevision(attached.directory, sha);
        const coverage = (state) =>
          source === "exact"
            ? { sha, state }
            : {
                sha,
                state: "not_required",
                basis: { sha: "b".repeat(40), state },
              };
        publishJson(
          join(attached.directory, "coverage"),
          `${sha}.json`,
          coverage("pending"),
        );
        const waiting = launchAwait(teardown, env, attached.directory, sha);
        // Each recheck follows a pass that read the pending coverage and found
        // the stream alive; a receipt written instead would end the wait.
        await waiting.waitForRechecks(2);
        assert.equal(
          waiting.output(),
          "",
          "live stream observer must remain available while CI is pending",
        );
        publishJson(
          join(attached.directory, "coverage"),
          `${sha}.json`,
          coverage(verdict),
        );
        const completed = await waiting.completed;
        assert.equal(completed.code, 0, completed.stderr);
        const result = parseReceipt(completed.stdout);
        assert.equal(result.verdict, verdict);
        assert.equal(
          result.effectiveEvidence.source,
          source === "exact" ? "exact" : "not_required_basis",
        );
        const completion = launchComplete(
          teardown,
          env,
          attached.directory,
          sha,
        );
        const completionOutput = await completion.completed;
        assert.equal(completionOutput.code, 0, completionOutput.stderr);
        const finished = parseReceipt(completionOutput.stdout);
        assert.equal(finished.verdict, verdict);
        if (verdict === "success") {
          assert.equal(finished.shutdown.status, "confirmed");
          assert.throws(() => process.kill(attached.pid, 0), { code: "ESRCH" });
        } else {
          assert.equal(finished.shutdown.status, "retained");
          assert.equal(
            checkMailboxWorkerLiveness(identity, attached.directory),
            "alive",
          );
          await replay.stop();
        }
      });
    }
  }
});

test("stream completion rejects missing, wrong-mailbox, unknown-mode, and dead identities without signaling another stream", async (t) => {
  const { env, teardown } = blockingGithubEnvironment(t);
  const replay = createCodexReplay(teardown, env, { exitSignal: "SIGKILL" });
  const otherReplay = createCodexReplay(teardown, env, {
    exitSignal: "SIGKILL",
  });
  const attached = await replay.setup();
  const other = await otherReplay.setup();
  const identity = readWorkerIdentity(attached.directory);
  const sha = "a".repeat(40);
  registerPushedRevision(attached.directory, sha);
  const completion = async () => {
    const { stdout } = await runCommand(
      process.execPath,
      [launcher, "await-revision", attached.directory, sha],
      { env },
    );
    return JSON.parse(stdout.slice(receiptPrefix.length));
  };
  rmSync(join(attached.directory, "worker.json"));
  assert.equal((await completion()).detail, "worker_identity_unknown");
  const mismatched = { ...identity, pid: other.pid };
  recordWorkerIdentity(attached.directory, mismatched);
  assert.equal((await completion()).detail, "worker_identity_unknown");
  await assert.rejects(
    terminateMailboxWorker(mismatched, attached.directory),
    /does not match this mailbox/,
  );
  assert.doesNotThrow(() => process.kill(other.pid, 0));
  recordWorkerIdentity(attached.directory, {
    ...identity,
    mode: "unsupported",
  });
  assert.equal((await completion()).detail, "worker_identity_unknown");
  recordWorkerIdentity(attached.directory, identity);
  await replay.stop();
  rmSync(join(attached.directory, "result.json"));
  assert.equal((await completion()).detail, "worker_exited");
  await otherReplay.stop();
});
