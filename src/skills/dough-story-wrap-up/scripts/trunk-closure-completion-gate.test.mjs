// The completion receipt gate of the installed Trunk Mode `finish`, run as a
// child process: a receipt other than `success` with confirmed shutdown stops
// at completion with the accepted final closure, the worktree, and the branch
// kept.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { lsRemoteSha } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";
// An observer budget long enough for `finish` to register the final closure
// on the live observer; the observation then ends at the observer's next
// recheck, well inside the default budget.
const unresolvedBudgetMs = 20_000;

// A CI failure, or a success whose shutdown is retained by an earlier
// revision's unread CI failure, never retires.
for (const [receipt, beforeCi, finalCi, verdict] of [
  ["a failed CI receipt", "success", "failure", "failure"],
  ["a success receipt with retained shutdown", "failure", "success", "success"],
]) {
  test(`${receipt} stops at completion and preserves the worktree and branch`, async (t) => {
    const fixture = await createTrunkClosureFixture(t);
    const before = await deliverBeforeCleanupThroughCli(fixture);
    const final = await commitFinalClosure(fixture);
    releaseCi(fixture, { [before.receipt.sha]: beforeCi, [final]: finalCi });

    const { result, code } = await finishThroughCli(fixture, {
      beforeCleanup: before.receipt.sha,
      final,
      extra: ["--created-for-work"],
    });

    assert.equal(code, 1);
    assert.equal(result.step, "completion");
    assert.equal(result.acceptedSha, final);
    assert.equal(result.completion.verdict, verdict);
    assert.equal(result.completion.shutdown.status, "retained");
    assert.equal(result.cleanup, "not-performed");
    assert.equal(existsSync(fixture.execution), true);
    assert.equal(await branchSha(fixture), final);
  });
}

// CI reports nothing for the final closure before the observer's observation
// budget ends, so the receipt holds no verdict although shutdown is confirmed.
test("a receipt with no CI verdict for the final closure stops at completion, preserves the worktree and branch, and names the rerun or the lost-coverage report", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const before = await deliverBeforeCleanupThroughCli(fixture, {
    maxDurationMs: unresolvedBudgetMs,
  });
  const beforeCleanup = before.receipt.sha;
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [beforeCleanup]: "success" });

  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    extra: ["--created-for-work", "--default-checkout", fixture.integration],
  });

  assert.equal(code, 1);
  assert.equal(result.ok, false);
  assert.equal(result.step, "completion");
  assert.equal(result.acceptedSha, final);
  assert.equal(result.completion.requestedSha, final);
  assert.equal(typeof result.completion.unresolvedReason, "string");
  assert.equal("verdict" in result.completion, false);
  assert.match(
    result.recovery,
    /no verdict[\s\S]+rerun finish[\s\S]+this coordinator's observer[\s\S]+coverage as lost/,
  );
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
});
