import assert from "node:assert/strict";
import { test } from "node:test";
import {
  supplier,
  resolveConsumer,
  readDependencies,
  updateDependency,
  dependency,
} from "./supplier-dependency-fixture.mjs";
import {
  reconciliationFixture,
  decision,
  question,
  textAt,
  writeAt,
  outcome,
} from "./supplier-reconciliation-fixture.mjs";

test("post-cleanup blocked outcomes still reject stale agreements and cannot author missing prerequisites", async (t) => {
  const f = await reconciliationFixture(t);
  const before = textAt(f, `.planning/${decision.link}`);
  const oldBasis = (await readDependencies(f.project, decision)).basis;
  const changed = await resolveConsumer(
    f,
    decision,
    f.evidence,
    f.accepted,
    outcome(f, "decision-needed", "Developer must settle compatibility.", {
      decision: question,
    }),
  );
  assert.equal(changed.code, 0, changed.stderr);
  const held = textAt(f, `.planning/${decision.link}`);
  assert.notEqual(held, before);
  const stale = await resolveConsumer(
    f,
    decision,
    f.evidence,
    f.accepted,
    outcome(f, "waiting", "Outdated judgment."),
    ["--expect-dependencies", oldBasis],
  );
  assert.equal(stale.code, 1);
  assert.match(stale.stderr, /agreement changed/);
  const altered = await resolveConsumer(f, decision, f.evidence, f.accepted, {
    ...outcome(f, "waiting", "Old condition."),
    condition: "A different condition",
  });
  assert.equal(altered.code, 1);
  assert.match(altered.stderr, /agreement changed/);
  const noEvidence = await resolveConsumer(
    f,
    decision,
    f.evidence,
    f.accepted,
    { state: "waiting", resolution: undefined },
  );
  assert.equal(noEvidence.code, 1);
  assert.match(
    noEvidence.stderr,
    /requires recoverable supplier outcome evidence/,
  );
  const unfinished = await resolveConsumer(
    f,
    decision,
    f.trunkSha,
    f.accepted,
    outcome(
      { ...f, evidence: f.trunkSha },
      "waiting",
      "Unfinished supplier is not a completed visit.",
    ),
  );
  assert.equal(unfinished.code, 1);
  assert.match(unfinished.stderr, /every planned slice must be done/);
  const missingHistory = await resolveConsumer(
    f,
    decision,
    f.accepted,
    f.accepted,
    outcome(
      { ...f, evidence: f.accepted },
      "decision-needed",
      "Missing historical supplier home.",
      { decision: question },
    ),
  );
  assert.equal(missingHistory.code, 1);
  assert.match(
    missingHistory.stderr,
    /completion evidence could not be established/,
  );
  const ordinaryWrite = await updateDependency(
    f.project,
    decision,
    dependency(supplier),
  );
  assert.equal(ordinaryWrite.code, 1);
  assert.match(ordinaryWrite.stderr, /Supplier canonical home not found/);
  assert.equal(textAt(f, `.planning/${decision.link}`), held);
  const absent = {
    identity: "ABSENT-AGREEMENT",
    link: "seeds/absent-agreement.md",
  };
  writeAt(
    f,
    `.planning/${absent.link}`,
    "# New consumer\n**Identity:** ABSENT-AGREEMENT\n",
  );
  const missing = await resolveConsumer(f, absent, f.evidence, f.accepted, {
    ...dependency(supplier),
    ...outcome(f, "waiting", "Must not create a relationship from history."),
  });
  assert.equal(missing.code, 1);
  assert.match(missing.stderr, /relationship is missing/);
  assert.equal(
    (await readDependencies(f.project, absent)).status,
    "not-recorded",
  );
});
