// Accepted B is published and registered; the project's custom provider never
// runs B and actually executes the counted covered command for descendant C.
// Under the declared integrated-state policy, the installed completion command
// completes B from the custom adapter's own target, check, context and
// current-attempt facts for C; another target, a newer rerun, unavailable
// discovery and a legacy adapter never do.
import assert from "node:assert/strict";
import { test } from "node:test";
import { git } from "./publication-test-fixtures.mjs";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import {
  assertStillUnresolved,
  createIntegratedStateJourney,
  unresolved,
} from "./ci-integrated-state-journey-test-fixtures.mjs";
import {
  customPolicy,
  customProvider,
} from "./ci-integrated-state-custom-test-fixtures.mjs";

const customJourney = (t, shape, declared = customPolicy) =>
  createIntegratedStateJourney(t, {
    declared,
    provider: customProvider(shape),
  });

test("declared policy: custom C green with E pending completes accepted B as validated C outside the startup stream", async (t) => {
  const journey = await customJourney(t);
  const b = await journey.publishIncrement();
  const c = await journey.publishIncrement("c.txt");
  const cAttempt = await journey.validate(c);
  const d = await journey.publishIncrement("d.txt");
  await journey.validate(d, { failed: true });
  const e = await journey.publishIncrement("e.txt");
  await journey.holdPending(e);
  // The ordinary startup stream keeps E (unfinished) and D (newest
  // completed), so C's evidence must come from the retained discovery.
  const { targetCommandAttempts, latestCommandAttempts } =
    await journey.installedModule("ci-command-attempts.mjs");
  const { startupCiRuns } = await journey.installedModule("ci-runs.mjs");
  const discovered = targetCommandAttempts(journey.discover().attempts, "main");
  assert.deepEqual(
    startupCiRuns(latestCommandAttempts(discovered)).map(
      ({ headSha }) => headSha,
    ),
    [e, d],
  );

  const directory = await journey.observe(b);
  assert.equal(
    (await journey.afterTwoPolls(directory, b)).integrated?.state,
    "success",
    "B must have integrated-state evidence from C",
  );
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.requestedSha, b);
  assert.equal(completion.verdict, "success");
  const evidence = completion.effectiveEvidence;
  assert.equal(evidence.source, "integrated_state");
  assert.equal(evidence.accepted.sha, b);
  assert.equal(evidence.accepted.state, "undiscovered");
  assert.equal(evidence.accepted.checkedBy, undefined, "no invented B run");
  assert.deepEqual(evidence.validated, {
    sha: c,
    branch: "main",
    runId: cAttempt.runId,
    attempt: cAttempt.attemptId,
    url: cAttempt.url,
    check: "project-checks",
    context: "push",
  });
  assert.deepEqual(evidence.policy, customPolicy);
  assert.deepEqual(evidence.ancestry, {
    ancestor: b,
    descendant: c,
    basis: "git merge-base --is-ancestor",
  });
  assert.equal(completion.shutdown.status, "confirmed");
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "dead",
  );
  assert.equal(journey.commands.count(b), 0, "B's check never ran");
  assert.equal(journey.commands.count(c), 1);
  assert.equal(journey.commands.count(e), 0, "E is still waiting");
});

test("another branch's newer green descendant never certifies the target", async (t) => {
  const journey = await customJourney(t, "all-branch-history");
  const b = await journey.publishIncrement();
  const { execution } = journey.fixture;
  const tree = (await git(execution, "rev-parse", `${b}^{tree}`)).stdout;
  const f = (
    await git(execution, "commit-tree", tree.trim(), "-p", b, "-m", "F")
  ).stdout.trim();
  await git(execution, "push", "origin", `${f}:refs/heads/feature/other`);
  const fAttempt = await journey.validate(f, { ref: "feature/other" });
  assert.equal(journey.commands.count(f), 1);
  await git(execution, "merge-base", "--is-ancestor", b, f);
  // The provider reports F's green to a discovery for main, naming its branch.
  assert.deepEqual(
    journey
      .discover()
      .attempts.map(({ sha, branch, runId }) => ({ sha, branch, runId })),
    [{ sha: f, branch: "feature/other", runId: fAttempt.runId }],
  );

  const directory = await journey.observe(b);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated !== undefined,
    "integrated judgement",
  );
  await assertStillUnresolved(journey, directory, b, {
    state: "unresolved",
    policy: customPolicy,
    reason: "no_candidate",
  });
});

test("C's newer rerun, pending and then failed, contradicts its older green in an all-attempt history", async (t) => {
  const journey = await customJourney(t, "all-branch-history");
  const b = await journey.publishIncrement();
  const c = await journey.publishIncrement("c.txt");
  const green = await journey.validate(c);
  const directory = await journey.observe(b);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "success",
    "C's green",
  );
  const rerun = await journey.holdPending(c, { failed: true });
  // Newest first, the provider still lists C's older green.
  const [newest, older] = journey.discover().attempts;
  assert.equal(newest.outcome, "pending");
  assert.notEqual(newest.runId, green.runId);
  assert.deepEqual(older, { ...green, branch: "main", ...customPolicy });
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "unresolved",
    "rerun contradiction",
  );
  const contradicted = unresolved(
    [{ sha: c, reason: "not_current_success" }],
    customPolicy,
  );
  await assertStillUnresolved(journey, directory, b, contradicted);

  assert.equal((await rerun.release()).outcome, "failure");
  assert.equal(journey.commands.count(c), 2);
  assert.deepEqual(
    (await journey.afterTwoPolls(directory, b)).integrated,
    contradicted,
  );
  await assertStillUnresolved(journey, directory, b, contradicted);
});

test("unavailable discovery withdraws C's retained green and never completes B", async (t) => {
  const journey = await customJourney(t);
  const b = await journey.publishIncrement();
  const c = await journey.publishIncrement("c.txt");
  await journey.validate(c);
  const directory = await journey.observe(b);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "success",
    "C's green",
  );
  journey.setUnavailable(true);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "unresolved",
    "withdrawn evidence",
  );
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.verdict, undefined);
  assert.equal(completion.unresolvedReason, "observation_unavailable");
  assert.equal(completion.effectiveEvidence.source, "exact");
  const { detail, ...integrated } = completion.effectiveEvidence.integrated;
  assert.deepEqual(integrated, {
    state: "unresolved",
    policy: customPolicy,
    reason: "candidate_lookup_unavailable",
  });
  assert.match(detail, /custom CI service unavailable/);
  const { recordedVerdict } = await journey.installedModule(
    "ci-mailbox-await.mjs",
  );
  assert.equal(recordedVerdict(directory, b), undefined);
});

test("a legacy exact-only adapter without a policy keeps exact completion unchanged", async (t) => {
  const journey = await customJourney(t, "legacy", null);
  const b = await journey.publishIncrement();
  const c = await journey.publishIncrement("c.txt");
  await journey.validate(c);
  assert.equal(
    journey.discover().attempts.some((attempt) => "branch" in attempt),
    false,
  );
  const directory = await journey.observe(b);
  const revision = await journey.afterTwoPolls(directory, b);
  assert.equal(revision.state, "undiscovered");
  assert.equal(revision.integrated, undefined);
  await assertStillUnresolved(journey, directory, b, undefined);

  const own = await journey.validate(b);
  await journey.awaitCoverage(
    directory,
    b,
    (recorded) => recorded.state === "success",
    "B's own success",
  );
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.verdict, "success");
  assert.equal(completion.effectiveEvidence.source, "exact");
  assert.deepEqual(completion.effectiveEvidence.revision.checkedBy, {
    runId: own.runId,
    attemptId: own.attemptId,
  });
  assert.equal(completion.shutdown.status, "confirmed");
});

test("a declared policy over a legacy adapter leaves B unresolved: an unnamed branch attests no target", async (t) => {
  const journey = await customJourney(t, "legacy");
  const b = await journey.publishIncrement();
  const c = await journey.publishIncrement("c.txt");
  await journey.validate(c);
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
    unresolved([{ sha: c, reason: "different_target" }], customPolicy),
  );
});
