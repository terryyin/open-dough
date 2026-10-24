import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  discoveryAdvisoryEmitted,
  discoveryAdvisoryMarkerName,
  discoveryDelayBoundMs,
} from "./ci-mailbox-revision-coverage.mjs";
import {
  createRevisionCoverageFixture,
  git,
} from "./ci-revision-coverage-test-fixtures.mjs";

test("one discovery-delay advisory names overdue revisions and never repeats", async (t) => {
  let clock = 1_000_000;
  const { project, storage, directory, mailbox, worker, deliver, advancePoll } =
    await createRevisionCoverageFixture(t, {
      now: () => clock,
      maxDurationMs: discoveryDelayBoundMs * 20,
    });

  const shaA = await deliver();
  writeFileSync(join(project, "application.txt"), "B\n");
  await git(project, "commit", "-am", "revision B");
  const shaB = await deliver();
  writeFileSync(join(project, "application.txt"), "C\n");
  await git(project, "commit", "-am", "revision C");
  const shaC = await deliver();

  await advancePoll();
  assert.deepEqual(mailbox.readMailboxEvents(directory), []);
  assert.equal(discoveryAdvisoryEmitted(directory), false);

  clock += discoveryDelayBoundMs + 1;
  await advancePoll();
  assert.deepEqual(
    mailbox.readMailboxEvents(directory).map(({ event }) => event),
    [
      {
        type: "CI_DISCOVERY_DELAYED",
        repo: "owner/project",
        branch: "feature/custom",
        revisions: [shaA, shaB, shaC].sort(),
      },
    ],
  );
  assert.equal(discoveryAdvisoryEmitted(directory), true);
  assert.ok(existsSync(join(directory, discoveryAdvisoryMarkerName)));

  writeFileSync(join(project, "application.txt"), "D\n");
  await git(project, "commit", "-am", "revision D");
  const shaD = await deliver();
  await advancePoll();
  clock += discoveryDelayBoundMs * 2;
  await advancePoll();
  assert.deepEqual(
    mailbox.readMailboxEvents(directory).map(({ event }) => event.type),
    ["CI_DISCOVERY_DELAYED"],
  );
  assert.equal(
    mailbox.readRevisionCoverage(directory).find(({ sha }) => sha === shaD)
      .state,
    "undiscovered",
  );

  mailbox.requestMailboxStop(directory, { root: project, storage });
  await worker;
});

test("a registration discovered before the bound produces no advisory", async (t) => {
  let clock = 2_000_000;
  const {
    project,
    storage,
    directory,
    mailbox,
    worker,
    deliver,
    advancePoll,
    setAttempts,
  } = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: discoveryDelayBoundMs * 20,
  });

  const sha = await deliver();
  await advancePoll();
  setAttempts([
    {
      runId: "run:early",
      attemptId: "attempt/success",
      sha,
      outcome: "success",
    },
  ]);
  await advancePoll();
  assert.equal(
    mailbox.readRevisionCoverage(directory).find(({ sha: s }) => s === sha)
      .state,
    "success",
  );
  assert.deepEqual(mailbox.readMailboxEvents(directory), []);

  clock += discoveryDelayBoundMs * 2;
  await advancePoll();
  assert.deepEqual(mailbox.readMailboxEvents(directory), []);
  assert.equal(discoveryAdvisoryEmitted(directory), false);

  mailbox.requestMailboxStop(directory, { root: project, storage });
  await worker;
});

test("fresh known queue suppresses missing-discovery advice until authoritative withdrawal", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
  });
  h.setSnapshot({ attempts: [] });
  const sha = await h.deliver();
  clock += discoveryDelayBoundMs + 1;
  h.setSnapshot({
    attempts: [],
    queue: [{ sha, branch: "feature/custom", state: "queued" }],
  });
  await h.advancePoll();
  assert.equal(
    h.mailbox.readRevisionCoverage(h.directory)[0].state,
    "undiscovered",
  );
  assert.deepEqual(h.mailbox.readMailboxEvents(h.directory), []);
  assert.equal(discoveryAdvisoryEmitted(h.directory), false);
  h.setSnapshot({ attempts: [], queue: [] });
  await h.advancePoll();
  assert.equal(
    h.mailbox.readMailboxEvents(h.directory)[0].event.type,
    "CI_DISCOVERY_DELAYED",
  );
});
