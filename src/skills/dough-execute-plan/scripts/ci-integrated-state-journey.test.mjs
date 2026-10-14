// Accepted B is published and registered; GitHub replaces its waiting run
// with C's, which actually executes the covered command. Under the declared
// integrated-state policy the installed completion command completes B from
// C's current evidence, naming both; otherwise B stays unresolved.
import assert from "node:assert/strict";
import { test } from "node:test";
import { git } from "./publication-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  assertStillUnresolved,
  createIntegratedStateJourney,
  policy,
  publishReplacedBAndValidatedC,
  unresolved,
} from "./ci-integrated-state-journey-test-fixtures.mjs";

test("declared policy: unregistered C green with E running completes accepted B as validated C, then shuts down", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const { b, c, cRun, d, e } = await publishReplacedBAndValidatedC(journey);
  const directory = await journey.observe(b);
  // Each poll judges B before the next poll lists runs again.
  assert.equal(
    (await journey.afterTwoPolls(directory, b)).integrated?.state,
    "success",
    "B must have integrated-state evidence from C",
  );
  // The ordinary startup stream omits C (D is the newest completed run); the
  // evidence came from the bounded candidate lookup and C's current attempt.
  const { startupCiRuns } = await journey.installedModule("ci-runs.mjs");
  assert.deepEqual(
    startupCiRuns(journey.observedRuns()).map(({ headSha }) => headSha),
    [e, d],
  );
  const asked = journey.github.asked();
  assert.ok(
    asked.some((call) =>
      call.endsWith("runs?branch=main&event=push&per_page=100&page=1"),
    ),
  );
  assert.ok(asked.some((call) => call.endsWith(`actions/runs/${cRun}`)));
  assert.ok(
    asked.some((call) => call.includes(`actions/runs/${cRun}/attempts/1/jobs`)),
  );
  const { recordedVerdict } = await journey.installedModule(
    "ci-mailbox-await.mjs",
  );
  assert.equal(recordedVerdict(directory, b), "success");

  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.requestedSha, b);
  assert.equal(completion.verdict, "success");
  assert.deepEqual(completion.target, { repo: "owner/repo", branch: "main" });
  const evidence = completion.effectiveEvidence;
  assert.equal(evidence.source, "integrated_state");
  assert.equal(evidence.accepted.sha, b);
  assert.equal(evidence.accepted.state, "undiscovered");
  assert.equal(evidence.accepted.checkedBy, undefined, "no invented B run");
  assert.deepEqual(evidence.validated, {
    sha: c,
    branch: "main",
    runId: cRun,
    attempt: 1,
    url: `https://github.test/owner/repo/actions/runs/${cRun}`,
    check: "ci.yml",
    context: "push",
    jobs: [
      {
        name: "covered",
        jobId: cRun * 10 + 1,
        conclusion: "success",
        url: `https://github.test/owner/repo/actions/runs/${cRun}/job/${cRun * 10 + 1}`,
      },
    ],
  });
  assert.deepEqual(evidence.policy, policy);
  assert.deepEqual(evidence.ancestry, {
    ancestor: b,
    descendant: c,
    basis: "git merge-base --is-ancestor",
  });
  await git(journey.fixture.execution, "merge-base", "--is-ancestor", b, c);
  assert.equal(completion.shutdown.status, "confirmed");
  assert.equal(completion.shutdown.terminal.coverage.unproved, undefined);
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "dead",
  );
  assert.equal(journey.commands.count(b), 0, "B's check never ran");
  assert.equal(journey.commands.count(c), 1);
});

test("without a declared policy, the same C green leaves registered B unresolved and C's attempt unread", async (t) => {
  const journey = await createIntegratedStateJourney(t, { declared: null });
  const { b, cRun } = await publishReplacedBAndValidatedC(journey);
  const directory = await journey.observe(b);
  const revision = await journey.afterTwoPolls(directory, b);
  assert.equal(revision.state, "undiscovered");
  assert.equal(revision.integrated, undefined);
  await assertStillUnresolved(journey, directory, b, undefined);
  assert.equal(
    journey.github
      .asked()
      .some((call) => call.endsWith(`actions/runs/${cRun}`)),
    false,
  );
});

test("another writer's C with unknown ancestry stays unresolved until the coordinator's checkout can prove B to C", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const b = await journey.publishIncrement();
  // Observation starts before GitHub lists any run, so B's replaced run is
  // seen as B's own cancelled attempt rather than startup history.
  const directory = await journey.observe(b);
  await journey.afterTwoPolls(directory, b);
  journey.recordRun(b, { state: "cancelled" });
  const other = await journey.publishFromAnotherWriter("other.txt");
  assert.equal(other.success, true);
  const cRun = journey.recordRun(other.sha, {
    state: "completed",
    executed: other,
  });
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "unresolved",
    "unknown ancestry",
  );
  assert.equal(journey.coverage(directory, b).state, "incomplete");
  await assertStillUnresolved(
    journey,
    directory,
    b,
    unresolved([{ sha: other.sha, reason: "ancestry_unknown" }]),
  );

  await git(journey.fixture.execution, "fetch", "origin");
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "success",
    "proved ancestry",
  );
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.verdict, "success");
  assert.equal(completion.effectiveEvidence.accepted.state, "incomplete");
  assert.equal(completion.effectiveEvidence.validated.sha, other.sha);
  assert.equal(completion.effectiveEvidence.validated.runId, cRun);
  assert.equal(completion.shutdown.status, "confirmed");
});

test("B's own failed attempt stays B's failure beside C's green and retains the observer", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const b = await journey.publishIncrement();
  const directory = await journey.observe(b);
  await journey.afterTwoPolls(directory, b);
  journey.recordRun(b, {
    state: "completed",
    executed: await journey.runCovered(b, true),
  });
  const c = await journey.publishIncrement("c.txt");
  journey.recordRun(c, {
    state: "completed",
    executed: await journey.runCovered(c),
  });
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.state === "failure",
    "B's own failure",
  );
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.verdict, "failure");
  assert.equal(completion.effectiveEvidence.source, "exact");
  assert.equal(completion.effectiveEvidence.integrated, undefined);
  assert.equal(completion.shutdown.status, "retained");
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "alive",
  );
});
