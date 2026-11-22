// A native refinement, with no Dashboard launch, retains its session UUID at
// the preparation's announcement, keeps it when the preparation resumes, and
// lands its record under that UUID through Land's installed session close.
// The landed session is closed: a later preparation of the same story in that
// kept workspace is another session with its own record, and a retried first
// close settles on its own record.
import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  publishSessionClose,
  resumeSessionClose,
} from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { readSessionEvidence } from "../../../src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs";
import {
  isSessionId,
  refinementSessionWorkflow,
} from "../../../src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  createWorkspace,
  identityC,
  lsRemoteSha,
  releasePreparation,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import {
  closedAt,
  landSession,
  publishedRecord,
  queuedStoryC,
  refineAndRelease,
  targetRef,
} from "./preparation-session-record-test-fixtures.mjs";

// Story C prepared natively in a kept workspace, refined, released and landed.
async function landedNativeRefinement(t) {
  const trunk = await queuedStoryC(t);
  const preparation = await createWorkspace(trunk, "c");
  const start = () => startPreparation(trunk, preparation.workspace, identityC);
  const { receipt: announced } = await start();
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  const { sessionId } = readSessionEvidence(preparation.workspace);
  const { receipt: resumed } = await start();
  assert.equal(resumed.status, "continued", JSON.stringify(resumed));
  await refineAndRelease(preparation.workspace);
  const announcedTip = await lsRemoteSha(trunk.origin, targetRef);
  const refinement = await landSession(t, preparation, {
    message: "Keep story C preparation",
    session: { workflow: refinementSessionWorkflow },
  });
  assert.equal(
    refinement.record.status,
    "published",
    JSON.stringify(refinement),
  );
  return { trunk, preparation, start, sessionId, announcedTip, refinement };
}

test("a native refinement lands its record under the session UUID its preparation start retained", async (t) => {
  const { trunk, sessionId, announcedTip, refinement } =
    await landedNativeRefinement(t);

  assert.ok(isSessionId(sessionId), sessionId);
  assert.deepEqual(await publishedRecord(trunk, sessionId), {
    version: 1,
    sessionId,
    workflow: "dough-story-refinement",
    closedAt: closedAt.toISOString(),
    story: identityC,
    ranges: [{ base: announcedTip, candidate: refinement.work.receipt.sha }],
  });
});

test("a landed native session is closed: the kept workspace's next preparation is a new session with its own record", async (t) => {
  const { trunk, preparation, start, sessionId, refinement } =
    await landedNativeRefinement(t);

  const unnamed = await publishSessionClose({
    workspace: preparation.workspace,
    session: { workflow: "ad-hoc" },
    branch: preparation.branch,
    targetRef,
  });
  assert.equal(unnamed.work.status, "session-identity-missing");

  const { receipt: second } = await start();
  assert.equal(second.status, "announced", JSON.stringify(second));
  const secondSession = readSessionEvidence(preparation.workspace).sessionId;
  assert.notEqual(secondSession, sessionId);
  appendFileSync(join(preparation.workspace, seedC), "Second thoughts.\n");
  const secondRelease = await releasePreparation(
    preparation.workspace,
    identityC,
  );
  assert.equal(secondRelease.receipt.status, "release-staged");
  const secondBase = await lsRemoteSha(trunk.origin, targetRef);
  const secondLanding = await landSession(t, preparation, {
    message: "Keep story C second preparation",
    session: { workflow: refinementSessionWorkflow },
  });
  assert.equal(
    secondLanding.record.status,
    "published",
    JSON.stringify(secondLanding),
  );
  assert.deepEqual((await publishedRecord(trunk, secondSession)).ranges, [
    { base: secondBase, candidate: secondLanding.work.receipt.sha },
  ]);

  // A retry of the first close after its answer was lost settles on its
  // own published record without another push.
  const retried = await resumeSessionClose({
    record: refinement.record.record,
    workspace: preparation.workspace,
    branch: preparation.branch,
    targetRef,
  });
  assert.equal(retried.record.status, "published", JSON.stringify(retried));
  assert.equal(retried.record.publication.pushCount, 0);
  assert.equal((await publishedRecord(trunk, sessionId)).sessionId, sessionId);
});
