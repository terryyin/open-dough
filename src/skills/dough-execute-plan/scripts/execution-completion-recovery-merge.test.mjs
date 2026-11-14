import assert from "node:assert/strict";
import { test } from "node:test";
import { completionBudgetMs } from "./ci-mailbox-completion-state.mjs";
import { createMailbox, registerPushedRevision } from "./ci-mailbox.mjs";
import { completeRevision } from "./ci-mailbox-complete.mjs";
import { claimMailbox } from "./ci-observer-owner.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { mergeRecoveryFixture } from "./execution-completion-recovery-merge-test-fixtures.mjs";
import { repo } from "./execution-completion-recovery-test-fixtures.mjs";

test("command-adapter recovery of an ignored-only merge landing", async (t) => {
  await t.test(
    "not_required basis B succeeds and never uses first-parent M",
    async () => {
      const h = await mergeRecoveryFixture(t);
      h.releaseAncestorAttempts("success");
      const recovered = await h.recoverMerge();
      assert.equal(recovered.ok, true, recovered.observation?.reason);
      assert.equal(recovered.receipt.verdict, "success");
      assert.equal(recovered.receipt.shutdown.status, "confirmed");
      assert.equal(
        recovered.receipt.effectiveEvidence.source,
        "not_required_basis",
      );
      assert.deepEqual(recovered.receipt.effectiveEvidence.basis, {
        sha: h.shaB,
        state: "success",
      });
      assert.notEqual(
        recovered.receipt.effectiveEvidence.basis?.sha,
        h.shaM,
        "must not use first-parent M",
      );
    },
  );

  await t.test("applicable failure of B retains shutdown", async () => {
    const h = await mergeRecoveryFixture(t);
    h.releaseAncestorAttempts("failure");
    const recovered = await h.recoverMerge();
    assert.equal(recovered.ok, true, recovered.observation?.reason);
    assert.equal(recovered.receipt.verdict, "failure");
    assert.equal(recovered.receipt.shutdown.status, "retained");
    assert.equal(
      recovered.receipt.effectiveEvidence.source,
      "not_required_basis",
    );
    assert.deepEqual(recovered.receipt.effectiveEvidence.basis, {
      sha: h.shaB,
      state: "failure",
    });
  });

  await t.test(
    "pending B keeps the first completion start deadline",
    async () => {
      const h = await mergeRecoveryFixture(t);
      const ended = createMailbox(
        {
          mode: "execution",
          repo,
          branch: "main",
          maxDurationMs: 5_000,
        },
        { root: h.root, storage: h.storage },
      );
      assert.ok(claimMailbox(ended, h.owner));
      registerPushedRevision(ended, h.shaL);
      // Real wall time so the carried deadline remains open for recovery.
      const startedAt = Date.now();
      let seedClock = startedAt;
      const first = await completeRevision(ended, h.shaL, {
        root: h.root,
        storage: h.storage,
        now: () => seedClock,
        workerLiveness: () => "alive",
        deadlineMs: 20,
        sleep: async (ms) => {
          seedClock += ms;
        },
      });
      assert.equal(first.handoff.startedAt, startedAt);
      assert.equal(first.handoff.deadline, startedAt + completionBudgetMs);

      h.releaseAncestorAttempts("pending");
      // Pending is proved only after the foreground wait times out while the
      // applicable ancestor is still fresh; keep the observer budget above that.
      const recovered = await h.recoverMerge({
        maxDurationMs: 120_000,
        deadlineMs: 3_000,
      });
      assert.equal(recovered.ok, true, recovered.observation?.reason);
      assert.equal(recovered.receipt.unresolvedReason, "pending");
      assert.equal(recovered.receipt.shutdown.status, "retained");
      assert.equal(recovered.receipt.handoff.startedAt, startedAt);
      assert.equal(
        recovered.receipt.handoff.deadline,
        startedAt + completionBudgetMs,
      );
      assert.deepEqual(recovered.receipt.effectiveEvidence.basis, {
        sha: h.shaB,
        state: "pending",
      });
    },
  );

  await t.test(
    "no attempted ancestor stays unresolved with resources retained",
    async () => {
      const h = await mergeRecoveryFixture(t);
      publishJson(h.fixture.fixture, "release.json", { attempts: [] });
      let clock = 0;
      const recovered = await h.recoverMerge({
        now: () => clock,
        sleep: async (ms) => {
          clock += ms;
        },
        deadlineMs: 80,
      });
      assert.equal(recovered.ok, true, recovered.observation?.reason);
      assert.notEqual(recovered.receipt.verdict, "success");
      assert.ok(recovered.receipt.unresolvedReason);
      assert.equal(recovered.receipt.effectiveEvidence?.basis?.sha, undefined);
      assert.ok(
        recovered.receipt.shutdown.status === "retained" ||
          recovered.receipt.shutdown.terminal?.coverage?.unproved?.some(
            (entry) =>
              entry.sha === h.shaL.toLowerCase() &&
              entry.state === "undiscovered",
          ),
        "resources stay retained or unproved undiscovered is named",
      );
    },
  );
});

test("GitHub Actions recovery of the same ignored-only merge shape", async (t) => {
  const h = await mergeRecoveryFixture(t, { provider: "github" });
  h.holdGithub({ bOutcome: "success" });
  const recovered = await h.recoverMerge({ maxDurationMs: 120_000 });
  assert.equal(recovered.ok, true, recovered.observation?.reason);
  assert.equal(recovered.receipt.verdict, "success");
  assert.equal(recovered.receipt.shutdown.status, "confirmed");
  assert.equal(
    recovered.receipt.effectiveEvidence.source,
    "not_required_basis",
  );
  assert.deepEqual(recovered.receipt.effectiveEvidence.basis, {
    sha: h.shaB,
    state: "success",
  });
  assert.notEqual(recovered.receipt.effectiveEvidence.basis?.sha, h.shaM);
  const asked = h.github.asked();
  assert.equal(
    asked.some(
      (call) => /workflows\/7001\/runs\?/.test(call) && !/branch=/.test(call),
    ),
    true,
    "repository-wide listing must be consulted for B",
  );
});
