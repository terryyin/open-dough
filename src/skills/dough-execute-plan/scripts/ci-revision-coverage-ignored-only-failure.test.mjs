import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
import {
  lateFailureWithIgnoredOnlyDescendantsGithub,
  controllableSleep,
  waitFor,
} from "./ci-revision-coverage-late-github-failure-test-fixtures.mjs";
import { modeledGithubActions } from "./watch-ci-test-fixtures.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import {
  allBranchesWorkflow,
  commitAll,
  exec,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

test("ignored-only descendants of a pending-then-failing ancestor share its one CI_FAILURE without ever being marked success, a later registration does not duplicate it, and another owner's evidence stays isolated", async (t) => {
  const repo = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-not-required-failure-"));
  const teardown = fixtureTeardown(storage, repo);
  t.after(teardown.cleanup);

  // A: the only revision with a real CI attempt.
  writeFileSync(join(repo, "app.js"), "console.log('base');\n");
  writeWorkflow(repo, allBranchesWorkflow);
  const shaA = await commitAll(repo, "base code and workflow");

  // B: ignored-only descendant of A, registered up front.
  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  const shaB = await commitAll(repo, "ignored-only change B");

  // C: a further ignored-only descendant (of B), also registered up front;
  // its nearest attempt-bearing ancestor is still A, since B never gets a
  // CI run of its own.
  await exec("mkdir", ["-p", join(repo, "docs")]);
  writeFileSync(join(repo, "docs", "readme.md"), "docs\n");
  const shaC = await commitAll(repo, "ignored-only change C");

  // D: another ignored-only descendant, registered only after A has already
  // failed and been delivered once — proving late registration neither
  // duplicates nor newly acknowledges the already-delivered failure.
  writeFileSync(join(repo, ".planning", "note2.md"), "note2\n");
  const shaD = await commitAll(repo, "ignored-only change D");

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

  const { sleep, sleeps } = controllableSleep();
  const github = lateFailureWithIgnoredOnlyDescendantsGithub({
    branch,
    shaA,
    databaseIdA: 801,
  });
  const worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep }),
  });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: repo, storage }),
  );
  // Another owner's revision whose run is already discoverable and failed on
  // the first poll: a real, independent journey, not a synthesized event.
  const otherOwnerGithub = modeledGithubActions({
    workflows: { "ci.yml": "CI" },
    runs: [
      {
        workflow: "ci.yml",
        databaseId: 900,
        headSha: shaOther,
        headBranch: "feature/other-owner",
        status: "completed",
        conclusion: "failure",
      },
    ],
    jobs: { 900: [{ databaseId: 9000, name: "build", conclusion: "failure" }] },
  });
  const { sleep: otherSleep } = controllableSleep();
  const otherWorker = runMailboxWorker(otherDirectory, {
    storage,
    observe: (request) =>
      watchCiExecution({
        ...request,
        gh: otherOwnerGithub.gh,
        sleep: otherSleep,
      }),
  });
  deferWorkerStop(teardown, otherWorker, () =>
    requestMailboxStop(otherDirectory, { storage }),
  );

  await waitFor(() => sleeps.length > 0, "initial poll");
  const advancePoll = async () => {
    sleeps.shift().resolve();
    await waitFor(() => sleeps.length > 0, "poll advanced");
  };

  // While A is still pending, B and C already identify it as their
  // applicable basis — the worker follows the applicable attempt rather than
  // waiting for a descendant run that will never exist — but neither is
  // marked success, and no failure has happened yet.
  assert.deepEqual(coverageOf(shaB), {
    sha: shaB,
    state: "not_required",
    basis: { sha: shaA, state: "pending" },
    registeredAt: coverageOf(shaB).registeredAt,
  });
  assert.deepEqual(coverageOf(shaC), {
    sha: shaC,
    state: "not_required",
    basis: { sha: shaA, state: "pending" },
    registeredAt: coverageOf(shaC).registeredAt,
  });
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
  await waitFor(() => failureEvents().length > 0, "A's failure delivered");

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

  // Further polling never redelivers the same failure.
  await advancePoll();
  await advancePoll();
  assert.equal(failureEvents().length, 1);

  // Registering a further ignored-only descendant of the same failed basis
  // does not duplicate or newly acknowledge the already-delivered failure.
  registerPushedRevision(directory, shaD);
  await advancePoll();
  await waitFor(() => coverageOf(shaD)?.state === "not_required", "D basis");
  assert.deepEqual(coverageOf(shaD).basis, { sha: shaA, state: "failure" });
  assert.equal(failureEvents().length, 1);

  await waitFor(
    () =>
      readMailboxEvents(otherDirectory).some(
        ({ event }) => event.type === "CI_FAILURE",
      ),
    "other coordinator's real failure",
  );

  // Unrelated-owner evidence stays isolated in both directions: this
  // mailbox's own event log names only A's failure, and the other
  // coordinator's mailbox names only its own unrelated revision. (Delivery
  // through the host hook CLI is exercised by
  // ci-revision-coverage-late-github-failure.test.mjs; it cannot be reused
  // unmodified here because that CLI always reads mailboxes against this real
  // checkout's root, while this test's git-based classification requires a
  // disposable temporary repository as `root`.)
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
