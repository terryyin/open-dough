import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { startCliResult } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { readState } from "./story-state-fixture.mjs";
import {
  fixture,
  publish,
  plan,
  supplierPlan,
  cleanupSupplier,
  resolveConsumer,
  homeBytes,
  consumer,
  supplier,
  readDependencies,
} from "./supplier-dependency-fixture.mjs";
import {
  correctedCondition,
  correctionSummary,
  correction,
  mixedAgreement,
} from "./supplier-dependency-correction-fixture.mjs";

test("explicit historical correction removes only the proved supplier wait and retains consumer work", async (t) => {
  const f = await fixture(t);
  writeFileSync(
    join(f.integration, ".planning/seeds/A.md"),
    homeBytes(f).replace(
      "Execute A.",
      "Scope: implement consumption of the selected endpoint.\nExample: the consumer uses the supplied endpoint; that implementation is pending.",
    ),
  );
  await mixedAgreement(f);
  writeFileSync(join(f.integration, supplierPlan), plan("done"));
  const evidence = await publish(f, "supplier delivers the endpoint contract");
  const waiting = await resolveConsumer(f, consumer, evidence, evidence, {
    state: "waiting",
    resolution: {
      revision: evidence,
      path: ".planning/seeds/B.md#b",
      summary:
        "Supplier contract is available; the mixed condition still includes pending consumer implementation.",
    },
  });
  assert.equal(waiting.code, 0, waiting.stderr);
  const accepted = await cleanupSupplier(f);
  const before = await readDependencies(f.project, consumer);
  const preparation = await readState(f.project, consumer);
  const backlog = readFileSync(
    join(f.integration, ".planning/PRODUCT-BACKLOG.md"),
    "utf8",
  );
  const consumerPlan = readFileSync(
    join(f.integration, ".planning/slice-plans/A/PLAN.md"),
    "utf8",
  );
  const sibling = homeBytes(f).slice(homeBytes(f).indexOf('<a id="late"'));
  const ordinary = await resolveConsumer(
    f,
    consumer,
    evidence,
    accepted,
    correction(evidence),
  );
  assert.equal(ordinary.code, 1);
  assert.match(ordinary.stderr, /agreement changed/);
  const corrected = await resolveConsumer(
    f,
    consumer,
    evidence,
    accepted,
    correction(evidence),
    ["--correct-agreement"],
  );
  assert.equal(corrected.code, 0, corrected.stderr);
  const facts = await readDependencies(f.project, consumer);
  const held = facts.dependencies.find(
    (entry) => entry.supplier.identity === supplier.identity,
  );
  assert.deepEqual(held.supplier, {
    identity: supplier.identity,
    href: supplier.link,
  });
  assert.equal(held.condition, correctedCondition);
  assert.equal(held.state, "satisfied");
  assert.equal(held.resolution.revision, evidence);
  assert.equal(held.resolution.path, ".planning/seeds/B.md#b");
  assert.ok(held.resolution.summary.includes(correctionSummary));
  assert.ok(
    held.resolution.summary.includes(before.dependencies[0].resolution.summary),
  );
  assert.match(held.resolution.summary, new RegExp(accepted));
  assert.deepEqual(facts.dependencies[1], before.dependencies[1]);
  assert.deepEqual(
    facts.blocking.map((entry) => entry.supplier.identity),
    ["THIRD"],
  );
  const state = await readState(f.project, consumer);
  assert.deepEqual(state.assessment.basis, preparation.assessment.basis);
  assert.equal(state.assessment.status, preparation.assessment.status);
  assert.equal(state.assessment.changedSinceReview, true);
  assert.deepEqual(
    state.startEligibility.blockers.map((entry) => entry.supplier),
    ["THIRD"],
  );
  assert.equal(
    readFileSync(join(f.integration, ".planning/PRODUCT-BACKLOG.md"), "utf8"),
    backlog,
  );
  assert.equal(
    readFileSync(
      join(f.integration, ".planning/slice-plans/A/PLAN.md"),
      "utf8",
    ),
    consumerPlan,
  );
  assert.equal(
    homeBytes(f).slice(homeBytes(f).indexOf('<a id="late"')),
    sibling,
  );
  assert.match(homeBytes(f), /that implementation is pending/);
  assert.equal(existsSync(join(f.integration, ".planning/seeds/B.md")), false);
  const bytes = homeBytes(f);
  const replay = await resolveConsumer(
    f,
    consumer,
    evidence,
    accepted,
    correction(evidence),
    ["--correct-agreement"],
  );
  assert.equal(replay.code, 0, replay.stderr);
  assert.equal(homeBytes(f), bytes);
  await publish(f, "publish corrected consumer prerequisite");
  const blocked = await startCliResult(f, "story-branch");
  assert.equal(blocked.code, 1);
  assert.match(blocked.receipt.error, /THIRD/);
  assert.doesNotMatch(blocked.receipt.error, /SEED-B#b/);
  assert.equal(existsSync(blocked.workspace), false);
});
