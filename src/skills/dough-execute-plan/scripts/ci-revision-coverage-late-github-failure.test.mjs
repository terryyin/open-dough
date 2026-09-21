import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
import { context, input, runHostHook } from "./ci-host-hook-test-fixtures.mjs";
import {
  controllableSleep,
  immediateFailureGithub,
  lateFailureGithub,
  waitFor,
} from "./ci-revision-coverage-late-github-failure-test-fixtures.mjs";

test("a late-discovered GitHub failure for a registered revision reaches its owning coordinator, while an unresolved sibling and another owner's revision stay isolated", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-late-github-"));
  // Declared with `let` (not const) so the cleanup below can stop whichever
  // mailboxes/workers were actually created if setup fails partway through.
  // eslint-disable-next-line prefer-const
  let worker, otherWorker, directory, otherDirectory;
  t.after(async () => {
    if (directory) requestMailboxStop(directory, { storage });
    if (otherDirectory) requestMailboxStop(otherDirectory, { storage });
    await Promise.allSettled([worker, otherWorker]);
    rmSync(storage, { recursive: true, force: true });
  });

  const shaA = "a".repeat(40);
  const shaB = "b".repeat(40);
  const shaOther = "c".repeat(40);

  directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: "feature/late",
      maxDurationMs: 60_000,
    },
    { storage },
  );
  otherDirectory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: "feature/other",
      maxDurationMs: 60_000,
    },
    { storage },
  );
  registerPushedRevision(directory, shaA);
  registerPushedRevision(directory, shaB);
  registerPushedRevision(otherDirectory, shaOther);

  // Attach both mailboxes to distinct coordinators before any CI activity,
  // so later delivery proves ownership rather than incidental attach timing.
  await runHostHook("claude", input("claude", directory), { storage });
  await runHostHook(
    "claude",
    input("claude", otherDirectory, { session_id: "owner-two" }),
    { storage },
  );

  const { sleep, sleeps } = controllableSleep();
  const { gh, listCallCount } = lateFailureGithub({
    sha: shaA,
    databaseId: 501,
    branch: "feature/late",
  });
  worker = runMailboxWorker(directory, {
    storage,
    observe: (request) => watchCiExecution({ ...request, gh, sleep }),
  });
  const { sleep: otherSleep } = controllableSleep();
  otherWorker = runMailboxWorker(otherDirectory, {
    storage,
    observe: (request) =>
      watchCiExecution({
        ...request,
        gh: immediateFailureGithub({
          sha: shaOther,
          databaseId: 900,
          branch: "feature/other",
        }),
        sleep: otherSleep,
      }),
  });

  await waitFor(
    () => sleeps.length > 0 && listCallCount() === 1,
    "initial poll",
  );
  const advancePoll = async (expected) => {
    sleeps.shift().resolve();
    await waitFor(
      () => listCallCount() === expected && sleeps.length > 0,
      `poll ${expected}`,
    );
  };
  await advancePoll(2);
  await advancePoll(3);

  // The temporary discovery limitation: neither revision has a matching run
  // yet after the existing three-poll discovery window.
  assert.deepEqual(
    readRevisionCoverage(directory).map(({ sha, state }) => ({ sha, state })),
    [
      { sha: shaA, state: "uncovered" },
      { sha: shaB, state: "uncovered" },
    ],
  );
  const gapEvents = readMailboxEvents(directory).map(({ event }) => event);
  assert.deepEqual(
    gapEvents.map(({ type, sha }) => [type, sha]),
    [
      ["CI_COVERAGE_UNAVAILABLE", shaA],
      ["CI_COVERAGE_UNAVAILABLE", shaB],
    ],
  );
  assert.match(gapEvents[0].reason, /3 discovery polls/);

  await advancePoll(4); // exposes the running attempt for A only
  assert.equal(
    readRevisionCoverage(directory).find(({ sha }) => sha === shaA).state,
    "pending",
  );
  assert.equal(
    readRevisionCoverage(directory).find(({ sha }) => sha === shaB).state,
    "uncovered",
  );

  await advancePoll(5); // exposes the failed attempt for A; B never appears
  assert.equal(
    readRevisionCoverage(directory).find(({ sha }) => sha === shaA).state,
    "failure",
  );
  const events = readMailboxEvents(directory).map(({ event }) => event);
  assert.deepEqual(
    events.map(({ type, sha }) => [type, sha]),
    [
      ["CI_COVERAGE_UNAVAILABLE", shaA],
      ["CI_COVERAGE_UNAVAILABLE", shaB],
      ["CI_FAILURE", shaA],
    ],
  );
  assert.equal(events.at(-1).runId, 501);

  await waitFor(
    () =>
      readMailboxEvents(otherDirectory).some(
        ({ event }) => event.type === "CI_FAILURE",
      ),
    "other coordinator's real failure",
  );

  const delivered = await runHostHook("claude", input("claude"), { storage });
  const deliveredText = context(delivered);
  assert.match(deliveredText, /"type":"CI_FAILURE"/);
  assert.match(deliveredText, new RegExp(`"sha":"${shaA}"`));
  assert.doesNotMatch(deliveredText, new RegExp(shaOther));
  assert.doesNotMatch(deliveredText, /"runId":900/);

  const otherDelivered = await runHostHook(
    "claude",
    input("claude", undefined, { session_id: "owner-two" }),
    { storage },
  );
  const otherDeliveredText = context(otherDelivered);
  assert.match(otherDeliveredText, new RegExp(`"sha":"${shaOther}"`));
  assert.doesNotMatch(otherDeliveredText, new RegExp(shaA));
  assert.doesNotMatch(otherDeliveredText, new RegExp(shaB));

  requestMailboxStop(directory, { storage });
  requestMailboxStop(otherDirectory, { storage });
  await worker;
  await otherWorker;

  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  assert.deepEqual(terminal.coverage.unproved, [
    { sha: shaB, state: "uncovered" },
  ]);
  assert.equal(
    readRevisionCoverage(directory).find(({ sha }) => sha === shaA).state,
    "failure",
  );
});
