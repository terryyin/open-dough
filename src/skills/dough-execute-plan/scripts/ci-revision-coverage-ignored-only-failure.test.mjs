import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createMailbox,
  readMailboxEvents,
  readRevisionCoverage,
  registerPushedRevision,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";
import { freshPendingRevision } from "./ci-mailbox-revision-records.mjs";
import {
  lateFailureWithIgnoredOnlyDescendantsGithub,
  otherOwnerFailedGithub,
} from "./ci-revision-coverage-late-github-failure-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  allBranchesWorkflow,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";

test("ignored-only descendants of a pending-then-failing ancestor share its one CI_FAILURE without ever being marked success, a later registration does not duplicate it, and another owner's evidence stays isolated", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-not-required-failure-"));
  const {
    integration: repo,
    fixture,
    revisions: { a: shaA, b: shaB, c: shaC, d: shaD },
  } = await materializeRepository(
    makeMe.aRepository
      // A: the only revision with a real CI attempt.
      .withRevision("a", {
        backlog: null,
        files: {
          "app.js": "console.log('base');\n",
          [workflowPath]: allBranchesWorkflow,
        },
      })
      // B: ignored-only descendant of A, registered up front.
      .withRevision("b", { files: { ".planning/note.md": "note\n" } })
      // C: another ignored-only descendant, also covered by A's real attempt.
      .withRevision("c", { files: { "docs/readme.md": "docs\n" } })
      // D is registered after A fails, proving late registration adds no
      // failure.
      .withRevision("d", { files: { ".planning/note2.md": "note2\n" } })
      .please(),
  );
  const teardown = fixtureTeardown(storage, fixture);
  t.after(teardown.cleanup);

  const shaOther = "c".repeat(40);
  const branch = "feature/ignored-failure";
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch,
      maxDurationMs: 60_000,
    },
    { root: repo, storage },
  );
  const otherDirectory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: "feature/other-owner",
      maxDurationMs: 60_000,
    },
    { storage },
  );
  // A is never registered in this mailbox: it is ordinary GitHub CI history
  // the worker discovers as B and C's (and later D's) applicable basis, not
  // a revision this execution pushed.
  registerPushedRevision(directory, shaB);
  registerPushedRevision(directory, shaC);
  registerPushedRevision(otherDirectory, shaOther);

  const coverageOf = (sha) =>
    readRevisionCoverage(directory).find((revision) => revision.sha === sha);
  const failureEvents = () =>
    readMailboxEvents(directory)
      .map(({ event }) => event)
      .filter(({ type }) => type === "CI_FAILURE");

  const polls = controllableSleep();
  const github = lateFailureWithIgnoredOnlyDescendantsGithub({
    branch,
    shaA,
    databaseIdA: 801,
  });
  const worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep: polls.sleep }),
  });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: repo, storage }),
  );
  // Another owner's revision whose run is already discoverable and failed on
  // the first poll: a real, independent journey, not a synthesized event.
  const otherOwnerGithub = otherOwnerFailedGithub({
    sha: shaOther,
    branch: "feature/other-owner",
  });
  const otherPolls = controllableSleep();
  const otherWorker = runMailboxWorker(otherDirectory, {
    storage,
    observe: (request) =>
      watchCiExecution({
        ...request,
        gh: otherOwnerGithub.gh,
        sleep: otherPolls.sleep,
      }),
  });
  deferWorkerStop(teardown, otherWorker, () =>
    requestMailboxStop(otherDirectory, { storage }),
  );

  const poll = polls.of(worker, () => readMailboxEvents(directory));
  await poll.reached();
  const advancePoll = poll.advance;

  // While A is still pending, B and C already identify it as their
  // applicable basis — the worker follows the applicable attempt rather than
  // waiting for a descendant run that will never exist — but neither is
  // marked success, and no failure has happened yet.
  assert.deepEqual(coverageOf(shaB), {
    sha: shaB,
    state: "not_required",
    basis: { sha: shaA, state: "pending" },
    registeredAt: coverageOf(shaB).registeredAt,
    observedAt: coverageOf(shaB).observedAt,
  });
  assert.deepEqual(coverageOf(shaC), {
    sha: shaC,
    state: "not_required",
    basis: { sha: shaA, state: "pending" },
    registeredAt: coverageOf(shaC).registeredAt,
    observedAt: coverageOf(shaC).observedAt,
  });
  assert.ok(Number.isFinite(coverageOf(shaB).observedAt));
  assert.deepEqual(
    freshPendingRevision(coverageOf(shaB), coverageOf(shaB).observedAt),
    {
      source: "attempt",
      sha: shaB,
      observedAt: coverageOf(shaB).observedAt,
      basis: { sha: shaA, state: "pending" },
    },
  );
  assert.deepEqual(readMailboxEvents(directory), []);

  await advancePoll();
  await advancePoll();
  // Repeated pending polls stay quiet and B/C's reuse basis does not flap.
  assert.deepEqual(coverageOf(shaB).basis, { sha: shaA, state: "pending" });
  assert.deepEqual(coverageOf(shaC).basis, { sha: shaA, state: "pending" });
  assert.equal(coverageOf(shaB).state, "not_required");
  assert.equal(coverageOf(shaC).state, "not_required");
  assert.deepEqual(readMailboxEvents(directory), []);

  // A now fails. Its attempt remains the one being observed for B and C.
  github.failNow();
  await advancePoll();
  assert.ok(failureEvents().length > 0, "A's failure delivered");

  const [failure] = failureEvents();
  assert.equal(failure.sha, shaA);
  assert.equal(failure.runId, 801);
  // B and C are never represented as success, nor as themselves having
  // failed their own run; they still only identify A as their basis, whose
  // resolved state now reflects A's real failure.
  assert.equal(coverageOf(shaB).state, "not_required");
  assert.deepEqual(coverageOf(shaB).basis, { sha: shaA, state: "failure" });
  assert.equal(coverageOf(shaC).state, "not_required");
  assert.deepEqual(coverageOf(shaC).basis, { sha: shaA, state: "failure" });
  assert.equal(freshPendingRevision(coverageOf(shaB)), undefined);

  // Further polling never redelivers the same failure.
  await advancePoll();
  await advancePoll();
  assert.equal(failureEvents().length, 1);

  // Registering a further ignored-only descendant of the same failed basis
  // does not duplicate or newly acknowledge the already-delivered failure.
  registerPushedRevision(directory, shaD);
  await advancePoll();
  assert.equal(coverageOf(shaD)?.state, "not_required", "D basis");
  assert.deepEqual(coverageOf(shaD).basis, { sha: shaA, state: "failure" });
  assert.equal(failureEvents().length, 1);

  await otherPolls
    .of(otherWorker, () => readMailboxEvents(otherDirectory))
    .reached();
  assert.ok(
    readMailboxEvents(otherDirectory).some(
      ({ event }) => event.type === "CI_FAILURE",
    ),
    "other coordinator's real failure",
  );

  // Owners see only their own failures. Host-hook delivery is proved by
  // ci-revision-coverage-late-github-failure.test.mjs against the real checkout;
  // this Git applicability test needs a disposable repository instead.
  const otherFailureEvents = readMailboxEvents(otherDirectory)
    .map(({ event }) => event)
    .filter(({ type }) => type === "CI_FAILURE");
  assert.deepEqual(
    failureEvents().map(({ sha, runId }) => ({ sha, runId })),
    [{ sha: shaA, runId: 801 }],
  );
  assert.deepEqual(
    otherFailureEvents.map(({ sha, runId }) => ({ sha, runId })),
    [{ sha: shaOther, runId: 900 }],
  );

  requestMailboxStop(directory, { root: repo, storage });
  requestMailboxStop(otherDirectory, { storage });
  await worker;
  await otherWorker;

  // B, C, and D are all proved not_required (never unproved), even though
  // their shared basis failed rather than succeeded.
  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  assert.deepEqual(terminal.coverage.unproved ?? [], []);
  assert.equal(coverageOf(shaB).state, "not_required");
  assert.equal(coverageOf(shaC).state, "not_required");
  assert.equal(coverageOf(shaD).state, "not_required");
});
