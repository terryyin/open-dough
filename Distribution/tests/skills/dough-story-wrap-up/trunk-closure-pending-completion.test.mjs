import assert from "node:assert/strict";
import { cpSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
} from "./trunk-closure-test-fixtures.mjs";

for (const unresolvedReason of ["pending", "completion_expired"]) {
  test(`installed finish preserves resources and concrete recovery for ${unresolvedReason}`, async (t) => {
    const fixture = await createTrunkClosureFixture(t);
    const before = await deliverBeforeCleanupThroughCli(fixture);
    const final = await commitFinalClosure(fixture);
    // Replace the real imported completion collaborator only at this gate's
    // boundary. Real queue→pending→resume composition is independently covered
    // by ci-mailbox-pending-completion.test.mjs; this test owns retirement.
    const completion = {
      requestedSha: final,
      unresolvedReason,
      handoff: {
        command: `node '/retained/ci-mailbox.mjs' complete-revision '/retained/watch-owned' ${final}`,
        deadline: 3601000,
      },
      shutdown: {
        status: unresolvedReason === "pending" ? "retained" : "confirmed",
      },
    };
    const collaborator = join(
      fixture.execution,
      ".claude/skills/dough-execute-plan/scripts/ci-mailbox-complete.mjs",
    );
    cpSync(
      collaborator,
      join(
        fixture.execution,
        ".claude/skills/dough-execute-plan/scripts/ci-mailbox-real-complete.mjs",
      ),
    );
    writeFileSync(
      collaborator,
      `export { requestMailboxStop, stopMailbox } from './ci-mailbox-real-complete.mjs';\nexport async function completeRevision() { return ${JSON.stringify(completion)}; }\n`,
    );
    const { result, code } = await finishThroughCli(fixture, {
      beforeCleanup: before.receipt.sha,
      final,
      extra: ["--created-for-work"],
    });
    assert.equal(code, 1);
    assert.equal(result.step, "completion");
    assert.deepEqual(result.completion, completion);
    assert.equal(result.cleanup, "not-performed");
    assert.equal(existsSync(fixture.execution), true);
    assert.equal(await branchSha(fixture), final);
    if (unresolvedReason === "pending")
      assert.ok(result.recovery.includes(completion.handoff.command));
    else assert.match(result.recovery, /later green cannot reopen/);
  });
}
