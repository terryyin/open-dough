// Story Branch closure under a declared integrated-state policy, through the
// GitHub default: the history-preserving integration's accepted receipt is
// the only revision the trunk observer completes, from a later same-target
// snapshot's current GitHub evidence, and wrap-up's retirement follows only a
// `success` receipt with confirmed shutdown. Provider conclusions come from
// actually executed covered commands.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { isDeepStrictEqual } from "node:util";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import { advanceOriginFromAnotherWriter } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { completeThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { listRegisteredRevisions } from "../../dough-execute-plan/scripts/ci-mailbox-revision-records.mjs";
import { readMailboxEvents } from "../../dough-execute-plan/scripts/ci-mailbox-store.mjs";
import { recordedVerdict } from "../../dough-execute-plan/scripts/ci-mailbox-await.mjs";
import {
  assertStillUnresolved,
  createIntegratedStateJourney,
  policy,
  publishReplacedBAndValidatedC,
  unresolved,
} from "../../dough-execute-plan/scripts/ci-integrated-state-journey-test-fixtures.mjs";
import { retireWorktree } from "../../dough-land/scripts/worktree-retirement.mjs";
import { git, revParse } from "./closure-git-fixtures.mjs";

const story = "exec/story";

// Wrap-up's retirement under its gate: a `success` receipt whose shutdown is
// confirmed.
const retire = (fixture, accepted, completion) =>
  retireWorktree({
    repository: fixture.integration,
    worktree: fixture.execution,
    branch: story,
    createdForWork: true,
    contained: [accepted],
    holdReason: () =>
      completion.verdict === "success" &&
      completion.shutdown.status === "confirmed"
        ? null
        : "completion unresolved",
  });

const judged = (expected) => (revision) =>
  isDeepStrictEqual(revision.integrated, expected);

test("Story closure completes only its accepted merge N, with no external fetch: an earlier green, the superseded candidate, another writer's failed C and its rerun never do; D with E running does", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const { fixture } = journey;
  const b = await journey.publishIncrement();
  journey.recordRun(b, { state: "cancelled" });
  const earlier = await journey.publishFromAnotherWriter("earlier.txt");
  journey.recordRun(earlier.sha, { state: "completed", executed: earlier });

  writeFileSync(join(fixture.execution, "closure.txt"), "story closure\n");
  await git(fixture.execution, "add", "closure.txt");
  await git(fixture.execution, "commit", "-m", "story closure");
  const closure = await revParse(fixture.execution, "HEAD");
  await git(fixture.execution, "push", "origin", `HEAD:refs/heads/${story}`);
  const integrate = (options = {}) =>
    publishHistoryPreservingCandidate({
      ownedWorkspace: fixture.execution,
      publishedTip: closure,
      branch: story,
      ...options,
    });
  const published = await integrate({
    beforePush: async ({ attempt }) => {
      if (attempt === 0)
        await advanceOriginFromAnotherWriter(fixture.origin, {
          file: "racing.txt",
        });
    },
  });
  assert.equal(published.rejectedPushCount, 1);
  const n = published.receipt.sha;
  const m = published.supersededSha;
  assert.notEqual(n, m);

  // Only the accepted receipt is registered; an older green that N contains
  // is no evidence for it.
  const directory = await journey.observe(n);
  assert.deepEqual(listRegisteredRevisions(directory), [n]);
  const noCandidate = { state: "unresolved", policy, reason: "no_candidate" };
  await journey.awaitCoverage(
    directory,
    n,
    judged(noCandidate),
    "N's integrated judgement",
  );
  await assertStillUnresolved(journey, directory, n, noCandidate);

  // Another writer's C, which this checkout never fetched, fails. The
  // observer fetches only C's objects to prove its ancestry: no ref changes.
  const refs = async () =>
    (await git(fixture.integration, "for-each-ref")).stdout;
  const before = await refs();
  const c = await journey.publishFromAnotherWriter("c.txt", { failed: true });
  await assert.rejects(git(fixture.execution, "cat-file", "-e", c.sha));
  const cRun = journey.recordRun(c.sha, { state: "completed", executed: c });
  const failing = unresolved([{ sha: c.sha, reason: "not_current_success" }]);
  await journey.awaitCoverage(
    directory,
    n,
    judged(failing),
    "C's failure with its ancestry proved",
  );
  await assertStillUnresolved(journey, directory, n, failing);
  journey.recordRun(c.sha, { id: cRun, attempt: 2, state: "in_progress" });
  assert.deepEqual(
    (await journey.afterTwoPolls(directory, n)).integrated,
    failing,
  );
  // Another writer's failure is not routed to this coordinator for repair.
  assert.equal(
    readMailboxEvents(directory).some(
      ({ event }) => event.type === "CI_FAILURE",
    ),
    false,
  );

  const d = await journey.publishFromAnotherWriter("d.txt");
  const dRun = journey.recordRun(d.sha, { state: "completed", executed: d });
  const e = await journey.publishFromAnotherWriter("e.txt", { waiting: true });
  journey.recordRun(e.sha, { state: "in_progress" });
  await journey.awaitCoverage(
    directory,
    n,
    (revision) =>
      revision.integrated?.state === "success" &&
      revision.integrated.validated.sha === d.sha,
    "D's validated integrated state",
  );
  const completion = await completeThroughCli(fixture, directory, n);
  assert.equal(completion.requestedSha, n);
  assert.equal(completion.verdict, "success");
  const evidence = completion.effectiveEvidence;
  assert.equal(evidence.source, "integrated_state");
  assert.equal(evidence.accepted.sha, n);
  assert.deepEqual(
    [evidence.validated.sha, evidence.validated.runId],
    [d.sha, dRun],
  );
  assert.deepEqual(evidence.ancestry, {
    ancestor: n,
    descendant: d.sha,
    basis: "git merge-base --is-ancestor",
  });
  assert.equal(completion.shutdown.status, "confirmed");
  assert.equal(completion.unreadActionableFailures, undefined);
  assert.equal(await refs(), before, "the observer's fetches write no ref");
  // An integration retry pushes nothing; its reported tip is the target's,
  // never a receipt to register or complete.
  const retry = await integrate();
  assert.equal(retry.classification, "already-accepted");
  assert.equal(retry.receipt, null);
  assert.equal(retry.pushCount, 0);
  assert.equal(retry.acceptedSha, e.sha);
  const removed = await retire(fixture, n, completion);
  assert.deepEqual([removed.worktree, removed.branch], ["removed", "removed"]);
  assert.equal(existsSync(fixture.execution), false);
  assert.deepEqual(
    [b, n, m, c.sha, d.sha, e.sha].map((sha) => journey.commands.count(sha)),
    [0, 0, 0, 1, 1, 0],
  );
});

test("a GitHub run-listing error after N's recorded integrated success withdraws it, never completes N, and keeps the worktree and branch", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const { b } = await publishReplacedBAndValidatedC(journey);
  const directory = await journey.observe(b);
  await journey.awaitCoverage(
    directory,
    b,
    (revision) => revision.integrated?.state === "success",
    "C's green",
  );
  journey.answer("workflows/7001/runs", {
    head: "HTTP/2.0 502 Bad Gateway",
    body: "{}",
    code: 1,
    stderr: "gh: Bad Gateway (HTTP 502)",
  });
  await journey.awaitCoverage(
    directory,
    b,
    (revision) =>
      revision.integrated?.reason === "candidate_lookup_unavailable",
    "withdrawn evidence",
  );
  assert.equal(recordedVerdict(directory, b), undefined);
  const completion = await completeThroughCli(journey.fixture, directory, b);
  assert.equal(completion.verdict, undefined);
  assert.equal(completion.unresolvedReason, "observation_unavailable");
  assert.equal(completion.effectiveEvidence.source, "exact");
  const { detail, ...integrated } = completion.effectiveEvidence.integrated;
  assert.deepEqual(integrated, {
    state: "unresolved",
    policy,
    reason: "candidate_lookup_unavailable",
  });
  assert.match(detail, /502/);
  const kept = await retire(journey.fixture, b, completion);
  assert.equal(kept.worktree, "preserved");
  assert.equal(existsSync(journey.fixture.execution), true);
  assert.equal(
    await revParse(journey.fixture.integration, story),
    journey.fixture.candidateSha,
  );
});
