// A fresh published claim starts its own native session; resuming the same
// execution keeps that session's identity.
import assert from "node:assert/strict";
import { test } from "node:test";
import { queuedReadyRepository } from "../../support/queued-repository.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { identityA } from "./workspace-publication-fixtures.mjs";
import {
  resumeArgs,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { readSessionEvidence } from "../../../src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs";
import { isSessionId } from "../../../src/skills/dough-execute-plan/scripts/session-record.mjs";

async function freshStart(t) {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  const started = await startProcess(trunk, "a", identityA).result;
  assert.equal(started.receipt.ok, true, JSON.stringify(started));
  return { trunk, started, evidence: readSessionEvidence(started.workspace) };
}

test("a resumed start keeps its native session, and a fresh start gets another", async (t) => {
  const { trunk, started, evidence } = await freshStart(t);
  assert.equal(isSessionId(evidence.sessionId), true);

  const resumed = await startProcess(
    trunk,
    "a",
    identityA,
    resumeArgs(started.receipt),
  ).result;
  assert.equal(resumed.receipt.status, "resumed", JSON.stringify(resumed));
  assert.deepEqual(readSessionEvidence(started.workspace), evidence);

  const another = await freshStart(t);
  assert.notEqual(another.evidence.sessionId, evidence.sessionId);
});
