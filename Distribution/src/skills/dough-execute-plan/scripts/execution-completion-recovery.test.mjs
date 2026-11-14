import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { completionBudgetMs } from "./ci-mailbox-completion-state.mjs";
import { readPredecessors } from "./ci-mailbox-predecessors.mjs";
import { recoveryFixture } from "./execution-completion-recovery-test-fixtures.mjs";

test("completion recovery on a replacement observer", async (t) => {
  const h = await recoveryFixture(t);

  await t.test(
    "SIGINT then rerun leaves one live observer and one success receipt",
    async () => {
      const ended = await h.endObserverByBudget();
      const before = h.snapshot(ended);
      const child = await h.recoverThroughCli([], { spawn: true });
      let stdout = "";
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      await new Promise((resolve, reject) => {
        const timer = setInterval(() => {
          if (h.liveObservers().length === 1) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
        child.once("error", reject);
        child.once("exit", (code, signal) => {
          clearInterval(timer);
          reject(
            new Error(
              `recovery exited early code=${code} signal=${signal}: ${stdout}`,
            ),
          );
        });
      });
      child.kill("SIGINT");
      await new Promise((resolve) => child.once("exit", resolve));
      assert.equal(h.liveObservers().length, 1);
      h.fixture.stopAtTeardown(h.liveObservers()[0]);

      h.fixture.releaseSuccess(h.sha);
      const again = await h.recoverThroughCli();
      assert.equal(again.code, 0, again.stderr);
      assert.equal(again.receipt.verdict, "success");
      assert.equal(again.receipt.shutdown.status, "confirmed");
      assert.deepEqual(h.snapshot(ended), before);

      const third = await h.recoverThroughCli();
      assert.equal(third.receipt.verdict, "success");
      assert.equal(h.liveObservers().length, 0);
    },
  );

  await t.test(
    "budget-expiry recovery prints ordinary success and preserves ended records",
    async () => {
      const ended = await h.endObserverByBudget();
      const before = h.snapshot(ended);
      const first = await h.recoverThroughCli();
      assert.equal(first.code, 0, first.stderr);
      assert.equal(first.receipt.verdict, "success");
      assert.equal(first.receipt.shutdown.status, "confirmed");
      assert.equal(first.receipt.requestedSha, h.sha);
      assert.equal(first.receipt.effectiveEvidence.revision.sha, h.sha);
      assert.deepEqual(h.snapshot(ended), before);
      assert.equal(h.liveObservers().length, 0);
      const successor = readdirSync(h.storage)
        .filter((name) => /^watch-/.test(name))
        .map((name) => join(h.storage, name))
        .find(
          (directory) =>
            directory !== ended && readPredecessors(directory).includes(ended),
        );
      assert.ok(successor);
      assert.ok(readPredecessors(successor).includes(ended));
    },
  );

  await t.test(
    "unread failure on the ended mailbox stays unread and retains shutdown",
    async () => {
      await h.stopLiveObservers();
      const ended = await h.endObserverByBudget();
      h.publishUnreadFailure(ended);
      const before = h.snapshot(ended);

      const recovered = await h.recoverInstalled();
      assert.equal(recovered.ok, true, recovered.observation?.reason);
      assert.equal(recovered.receipt.verdict, "success");
      assert.equal(recovered.receipt.shutdown.status, "retained");
      assert.equal(
        recovered.receipt.shutdown.reason,
        "unread_actionable_failure",
      );
      assert.equal(recovered.receipt.unreadActionableFailures.length, 1);
      assert.deepEqual(h.snapshot(ended), before);
    },
  );

  await t.test(
    "carried deadline from the ended mailbox expires under controlled now",
    async () => {
      await h.stopLiveObservers();
      const ended = await h.endObserverByBudget();
      const startedAt = 1_000;
      const first = await h.startCompletion(ended, () => startedAt);
      assert.equal(first.unresolvedReason, "observation_unavailable");
      assert.equal(first.handoff.startedAt, startedAt);
      assert.equal(first.handoff.deadline, startedAt + completionBudgetMs);

      const recovered = await h.recoverInstalled({
        now: () => startedAt + completionBudgetMs + 1,
      });
      assert.equal(recovered.ok, true, recovered.observation?.reason);
      assert.equal(recovered.receipt.unresolvedReason, "completion_expired");
      assert.equal(recovered.receipt.detail, "overall_completion_deadline");
      assert.equal(recovered.receipt.handoff.startedAt, startedAt);
      assert.equal(
        recovered.receipt.handoff.deadline,
        startedAt + completionBudgetMs,
      );
      assert.ok(
        readPredecessors(recovered.observation.directory).includes(ended),
      );
    },
  );
});
