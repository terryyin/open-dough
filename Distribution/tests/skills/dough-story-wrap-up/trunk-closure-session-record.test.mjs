// Trunk Mode `finish` publishes the session record after the accepted final
// closure's completion receipt and before retirement. A refused record push
// stops finish with every resource kept; the rerun publishes the sealed record
// once without pushing the closure or completing it again, then retires.
import assert from "node:assert/strict";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { executionSessionWorkflow } from "../../../src/skills/dough-execute-plan/scripts/session-record.mjs";
import { lsRemoteSha } from "../dough-execute-plan/publication-test-fixtures.mjs";
import { git } from "../dough-execute-plan/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";
import { recordTipOver } from "./trunk-closure-session-record-test-fixtures.mjs";

const main = "refs/heads/main";

// The origin refuses every push that adds a JSON file, as a session record
// commit does, until the returned function lifts the refusal.
function refuseRecordPushes(fixture) {
  const armed = join(fixture.fixture, "refuse-record");
  writeFileSync(armed, "");
  writeFileSync(
    join(fixture.origin, "hooks/pre-receive"),
    `#!/bin/sh
while read old new ref; do
  if [ -f '${armed}' ] && git diff-tree --no-commit-id --name-status -r "$new" | grep -q '^A.*\\.json$'; then
    echo "record refused" >&2
    exit 1
  fi
done
`,
    { mode: 0o755 },
  );
  return () => rmSync(armed);
}

test("finish stops at a refused record push after completing the closure with every resource kept, and its rerun publishes one record without another closure push or completion and retires", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const beforeCleanup = before.receipt.sha;
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
  const accept = refuseRecordPushes(fixture);
  const run = () =>
    finishThroughCli(fixture, {
      beforeCleanup,
      final,
      extra: ["--created-for-work"],
    });

  const first = await run();

  assert.equal(first.code, 1, first.stderr);
  assert.equal(first.result.step, "record");
  assert.equal(first.result.acceptedSha, final);
  assert.equal(first.result.pushCount, 1);
  assert.equal(first.result.completion.requestedSha, final);
  assert.equal(first.result.completion.verdict, "success");
  assert.equal(first.result.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  assert.equal(existsSync(fixture.execution), true);
  assert.notEqual(await branchSha(fixture), "");

  accept();
  const again = await run();

  assert.equal(again.code, 0, JSON.stringify(again));
  assert.equal(again.result.step, "done");
  assert.equal(again.result.pushCount, 0);
  // The sealed close carries the first completion; it is not repeated.
  assert.deepEqual(again.result.completion, first.result.completion);
  const { sha, path, record } = await recordTipOver(fixture, final);
  assert.equal(again.result.record.sha, sha);
  assert.equal(record.workflow, executionSessionWorkflow);
  assert.equal(record.closedAt.length > 0, true);
  assert.deepEqual(record.ranges, [
    { base: fixture.trunkSha, candidate: beforeCleanup },
    { base: beforeCleanup, candidate: final },
  ]);
  assert.equal(
    (await git(fixture.origin, "log", "--format=%H", main, "--", path)).stdout
      .trim()
      .split("\n").length,
    1,
  );
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
});
