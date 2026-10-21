import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readState, recordArgs } from "./story-state-fixture.mjs";
import {
  fixture as supplierFixture,
  publish,
  plan,
  supplierPlan,
  cleanupSupplier,
  resolveConsumer,
  consumer,
  supplier,
  homeBytes,
  dependency,
  updateDependency,
  run,
} from "./supplier-dependency-fixture.mjs";

test("historical agreement correction flags reviewed content and preserves an unrelated Not ready judgment", async (t) => {
  const f = await supplierFixture(t);
  writeFileSync(
    join(f.integration, ".planning/seeds/A.md"),
    homeBytes(f).replace(
      "Execute A.",
      "Scope: implement endpoint consumption. Example: this consumer uses the supplied contract; implementation is pending.",
    ),
  );
  assert.equal(
    (
      await updateDependency(
        f.project,
        consumer,
        dependency(supplier, {
          condition:
            "The endpoint is available and this consumer has implemented its consumption.",
        }),
      )
    ).code,
    0,
  );
  const observed = await readState(f.project, consumer);
  const recorded = await run(
    f.project,
    recordArgs(consumer, {
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/A/PLAN.md",
      assessment: "not-ready",
      reasons: [
        "Consumer compatibility behavior still needs a developer decision.",
      ],
      expectDocument: observed.basis.document,
      expectPlan: observed.basis.plan,
    }),
  );
  assert.equal(recorded.code, 0, recorded.stderr);
  const reviewed = await readState(f.project, consumer);
  assert.equal(reviewed.assessment.changedSinceReview, false);
  writeFileSync(join(f.integration, supplierPlan), plan("done"));
  const evidence = await publish(f);
  const accepted = await cleanupSupplier(f);
  const sibling = homeBytes(f).slice(homeBytes(f).indexOf('<a id="late"'));
  const corrected = await resolveConsumer(
    f,
    consumer,
    evidence,
    accepted,
    {
      condition: "The selected endpoint contract is completed and integrated.",
      resolution: {
        revision: evidence,
        path: ".planning/seeds/B.md#b",
        summary:
          "Endpoint proof establishes availability. Existing consumer scope owns future consumption; compatibility remains a separate developer decision.",
      },
    },
    ["--correct-agreement"],
  );
  assert.equal(corrected.code, 0, corrected.stderr);
  const after = await readState(f.project, consumer);
  assert.deepEqual(after.assessment, {
    ...reviewed.assessment,
    changedSinceReview: true,
  });
  assert.deepEqual(after.refinement, reviewed.refinement);
  assert.deepEqual(after.approach, reviewed.approach);
  assert.deepEqual(
    after.startEligibility.blockers.map((entry) => entry.kind),
    ["dependency", "assessment"],
  );
  assert.equal(after.startEligibility.blockers[0].supplier, "THIRD");
  assert.deepEqual(after.startEligibility.blockers[1], {
    kind: "assessment",
    status: "not-ready",
    reasons: reviewed.assessment.reasons,
  });
  assert.equal(
    homeBytes(f).slice(homeBytes(f).indexOf('<a id="late"')),
    sibling,
  );
});
