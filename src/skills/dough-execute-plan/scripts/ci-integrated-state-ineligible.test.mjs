// Accepted B's replaced run and C's listed green, judged afresh every poll,
// through the installed observer and completion: C's later rerun contradicts
// its older green, and B stays unresolved with its own exact state. Each
// other ineligibility reason is proved at the judge
// (ci-integrated-state-judge*.test.mjs) and the GitHub current-attempt read
// (ci-github-current-attempt.test.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertStillUnresolved,
  createIntegratedStateJourney,
  publishReplacedBAndValidatedC,
  unresolved,
  waitingTips,
} from "./ci-integrated-state-journey-test-fixtures.mjs";

test("C's later rerun, pending and then failed, contradicts its older green for B", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const published = await publishReplacedBAndValidatedC(journey);
  const { b, c, cRun } = published;
  const directory = await journey.observe(b);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "success",
    "C's green",
  );
  journey.recordRun(c, { id: cRun, attempt: 2, state: "in_progress" });
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "unresolved",
    "rerun contradiction",
  );
  const contradicted = unresolved([
    ...waitingTips(published),
    { sha: c, reason: "not_current_success" },
  ]);
  await assertStillUnresolved(journey, directory, b, contradicted);

  journey.recordRun(c, {
    id: cRun,
    attempt: 2,
    state: "completed",
    executed: await journey.runCovered(c, true),
  });
  assert.equal(journey.commands.count(c), 2);
  assert.deepEqual(
    (await journey.afterTwoPolls(directory, b)).integrated,
    contradicted,
  );
  await assertStillUnresolved(journey, directory, b, contradicted);
});
