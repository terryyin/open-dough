// Accepted B's replaced run and C's listed green, judged afresh every poll:
// a C attempt that is contradicted, unreadable, or outside the declared
// policy never completes B, which stays unresolved with its own exact state.
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

for (const [name, declared, reason] of [
  [
    "a context the declared policy does not name",
    { check: "ci.yml", context: "workflow_dispatch" },
    "context_incompatible",
  ],
  [
    "a declared required job C's attempt lacks",
    { check: "ci.yml", context: "push", jobs: ["covered", "lint"] },
    "missing_check",
  ],
  [
    "another workflow than the declared check",
    { check: "release.yml", context: "push" },
    "context_incompatible",
  ],
])
  test(`C green under ${name} never completes B`, async (t) => {
    const journey = await createIntegratedStateJourney(t, { declared });
    const published = await publishReplacedBAndValidatedC(journey);
    const { b, c } = published;
    const directory = await journey.observe(b);
    await journey.awaitCoverage(
      directory,
      b,
      (revision) => revision.integrated !== undefined,
      "integrated judgement",
    );
    await assertStillUnresolved(
      journey,
      directory,
      b,
      unresolved([...waitingTips(published), { sha: c, reason }], declared),
    );
  });

test("an unreadable current attempt beside C's listed green replaces the recorded success", async (t) => {
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
  journey.answer(`runs/${cRun}`, {
    head: "HTTP/2.0 502 Bad Gateway",
    body: "{}",
    code: 1,
    stderr: "gh: Bad Gateway (HTTP 502)",
  });
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "unresolved",
    "unavailable current attempt",
  );
  await assertStillUnresolved(
    journey,
    directory,
    b,
    unresolved([
      ...waitingTips(published),
      { sha: c, reason: "current_attempt_unavailable" },
    ]),
  );
});
