import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readState, recordArgs } from "./story-state-fixture.mjs";
import {
  fixture,
  publish,
  plan,
  supplierPlan,
  cleanupSupplier,
  resolveConsumer,
  homeBytes,
  supplier,
  readDependencies,
  git,
  run,
} from "./supplier-dependency-fixture.mjs";
import {
  correctedCondition,
  correctionSummary,
  correction,
  mixedAgreement,
} from "./supplier-dependency-correction-fixture.mjs";

test("correcting a satisfied mixed agreement retains its original locator and accepted evidence", async (t) => {
  const f = await fixture(t);
  writeFileSync(
    join(f.integration, ".planning/seeds/A.md"),
    homeBytes(f).replace(
      "Deliver late work.",
      "Scope: implement endpoint consumption. Example: this consumer uses the supplied contract; implementation is pending.",
    ),
  );
  await mixedAgreement(f, f.sibling);
  const preparation = await readState(f.project, f.sibling);
  const ready = await run(
    f.project,
    recordArgs(f.sibling, {
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/late/PLAN.md",
      assessment: "ready",
      expectDocument: preparation.basis.document,
      expectPlan: preparation.basis.plan,
    }),
  );
  assert.equal(ready.code, 0, ready.stderr);
  writeFileSync(join(f.integration, supplierPlan), plan("done"));
  const evidence = await publish(f);
  const resolved = await resolveConsumer(f, f.sibling, evidence, evidence);
  assert.equal(resolved.code, 0, resolved.stderr);
  const original = (await readDependencies(f.project, f.sibling))
    .dependencies[0].resolution;
  const reviewedEvidence = await publish(
    f,
    "retain the first satisfied judgment",
  );
  const accepted = await cleanupSupplier(f);
  const before = homeBytes(f);
  const corrected = await resolveConsumer(
    f,
    f.sibling,
    reviewedEvidence,
    accepted,
    correction(reviewedEvidence),
    ["--correct-agreement"],
  );
  assert.equal(corrected.code, 0, corrected.stderr);
  const held = (await readDependencies(f.project, f.sibling)).dependencies[0];
  assert.equal(held.condition, correctedCondition);
  assert.equal(held.resolution.revision, original.revision);
  assert.equal(held.resolution.path, original.path);
  assert.ok(held.resolution.summary.includes(original.summary));
  assert.ok(held.resolution.summary.includes(correctionSummary));
  assert.ok(held.resolution.summary.includes(reviewedEvidence));
  assert.ok(held.resolution.summary.includes(accepted));
  assert.notEqual(homeBytes(f), before);
  assert.equal(
    (await readState(f.project, f.sibling)).startEligibility.status,
    "eligible",
  );
  const bytes = homeBytes(f);
  assert.equal(
    (
      await resolveConsumer(
        f,
        f.sibling,
        reviewedEvidence,
        accepted,
        correction(reviewedEvidence),
        ["--correct-agreement"],
      )
    ).code,
    0,
  );
  assert.equal(homeBytes(f), bytes);
  assert.equal(
    (
      await git(
        f.integration,
        "show",
        `${held.resolution.revision}:${held.resolution.path.split("#")[0]}`,
      )
    ).stdout.includes(supplier.identity),
    true,
  );
});
