import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  coverageStates,
  createRevisionCoverageFixture,
  git,
} from "./ci-revision-coverage-test-fixtures.mjs";

test("delivery registers exact pushed revisions and coverage stays silent until actionable", async (t) => {
  const {
    project,
    storage,
    directory,
    mailbox,
    worker,
    deliver,
    advancePoll,
    setAttempts,
  } = await createRevisionCoverageFixture(t);

  const shaA = await deliver();
  writeFileSync(join(project, "application.txt"), "B\n");
  await git(project, "commit", "-am", "revision B");
  const shaB = await deliver();
  writeFileSync(join(project, "application.txt"), "C\n");
  await git(project, "commit", "-am", "revision C");
  const shaC = await deliver();

  // Many polls with no matching run: stay quiet and undiscovered.
  for (let poll = 0; poll < 7; poll += 1) await advancePoll();
  assert.deepEqual(
    coverageStates(mailbox, directory),
    new Map([
      [shaA, "undiscovered"],
      [shaB, "undiscovered"],
      [shaC, "undiscovered"],
    ]),
  );
  assert.deepEqual(mailbox.readMailboxEvents(directory), []);

  setAttempts([
    {
      runId: "run:A",
      attemptId: "attempt/pending",
      sha: shaA,
      outcome: "pending",
    },
  ]);
  await advancePoll();
  const pendingA = mailbox
    .readRevisionCoverage(directory)
    .find(({ sha }) => sha === shaA);
  assert.equal(pendingA.state, "pending");
  assert.deepEqual(pendingA.checkedBy, {
    runId: "run:A",
    attemptId: "attempt/pending",
  });
  assert.equal(typeof pendingA.registeredAt, "number");
  assert.deepEqual(
    mailbox
      .readRevisionCoverage(directory)
      .filter(({ sha }) => sha !== shaA)
      .map(({ state }) => state)
      .sort(),
    ["undiscovered", "undiscovered"],
  );
  assert.deepEqual(mailbox.readMailboxEvents(directory), []);

  setAttempts([
    {
      runId: "run:A",
      attemptId: "attempt/success",
      sha: shaA,
      outcome: "success",
    },
    {
      runId: "run:B",
      attemptId: "attempt/success",
      sha: shaB,
      outcome: "success",
    },
    {
      runId: "run:C",
      attemptId: "attempt/success",
      sha: shaC,
      outcome: "success",
    },
  ]);
  await advancePoll();
  assert.deepEqual(
    coverageStates(mailbox, directory),
    new Map([
      [shaA, "success"],
      [shaB, "success"],
      [shaC, "success"],
    ]),
  );
  assert.deepEqual(mailbox.readMailboxEvents(directory), []);

  writeFileSync(join(project, "application.txt"), "D\n");
  await git(project, "commit", "-am", "repair D");
  const shaD = await deliver();
  setAttempts([
    {
      runId: "run:A",
      attemptId: "attempt/success",
      sha: shaA,
      outcome: "success",
    },
    {
      runId: "run:B",
      attemptId: "attempt/success",
      sha: shaB,
      outcome: "success",
    },
    {
      runId: "run:C",
      attemptId: "attempt/success",
      sha: shaC,
      outcome: "success",
    },
    {
      runId: "run:D",
      attemptId: "attempt/pending",
      sha: shaD,
      outcome: "pending",
    },
  ]);
  await advancePoll();
  mailbox.requestMailboxStop(directory, { root: project, storage });
  await worker;

  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  assert.deepEqual(terminal.coverage.unproved, [
    { sha: shaD, state: "pending" },
  ]);
  assert.equal(
    mailbox.readRevisionCoverage(directory).find(({ sha }) => shaA === sha)
      .state,
    "success",
  );
  assert.deepEqual(mailbox.readMailboxEvents(directory), []);
});
