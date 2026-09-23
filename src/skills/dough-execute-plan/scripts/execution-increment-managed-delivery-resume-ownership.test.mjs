// Managed resume ownership gaps: ended, lost, ambiguous, or mismatched owners
// stay unobserved without replacement starts or duplicate pushes.
import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  mailboxWorkerLoss,
  readRevisionCoverage,
  readWorkerIdentity,
  startExecutionMailbox,
} from "./ci-mailbox.mjs";
import { messageCount } from "./publication-test-fixtures.mjs";
import {
  createManagedFixture,
  waitForPidExit,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("ended observer reports explicit unobserved gap without push or replacement", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const accepted = delivered.receipt.sha;
  const endedDirectory = delivered.observation.directory;
  await fixture.stopObserver(endedDirectory);
  const terminal = JSON.parse(
    readFileSync(join(endedDirectory, "result.json"), "utf8"),
  );
  assert.equal(terminal.coverage.state, "ended");
  assert.notEqual(terminal.coverage.state, "lost");
  const watchesBefore = watchCount(fixture.storage);
  const pushesBefore = await messageCount(
    fixture.origin,
    trunkTarget,
    "verified increment",
  );

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.ok, true);
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.observation.state, "unobserved");
  assert.equal(resumed.observation.pendingCi, "unobserved");
  assert.match(resumed.observation.reason, /ended/);
  assert.equal(resumed.observation.ownership, "ended");
  assert.equal(watchCount(fixture.storage), watchesBefore);
  assert.equal(
    await messageCount(fixture.origin, trunkTarget, "verified increment"),
    pushesBefore,
  );
  assert.equal(
    JSON.parse(readFileSync(join(endedDirectory, "result.json"), "utf8"))
      .coverage.state,
    "ended",
  );
});

test("dead worker reports coverage gap without duplicate push or replacement", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const accepted = delivered.receipt.sha;
  const directory = delivered.observation.directory;
  const { pid } = readWorkerIdentity(directory);
  process.kill(pid, "SIGKILL");
  assert.equal(await waitForPidExit(pid), true);
  const watchesBefore = watchCount(fixture.storage);

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.observation.state, "unobserved");
  assert.equal(resumed.observation.pendingCi, "unobserved");
  assert.equal(resumed.observation.ownership, "lost");
  assert.equal(watchCount(fixture.storage), watchesBefore);
  assert.equal(mailboxWorkerLoss(directory)?.coverage.state, "lost");
});

test("ambiguous matching owners return a gap and preserve existing state", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    for (const directory of fixture.observerDirectories ?? []) {
      await fixture.stopObserver(directory);
    }
    fixture.cleanup();
  });

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const accepted = delivered.receipt.sha;
  const second = await startExecutionMailbox(
    {
      mode: "execution",
      repo,
      branch: "main",
      maxDurationMs: 60_000,
    },
    {
      root: fixture.execution,
      storage: fixture.storage,
      env: fixture.env,
    },
  );
  fixture.observerDirectories = [delivered.observation.directory, second];
  const watchesBefore = watchCount(fixture.storage);
  const coverageBefore = readRevisionCoverage(
    delivered.observation.directory,
  ).map((entry) => entry.sha);

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.observation.state, "unobserved");
  assert.equal(resumed.observation.ownership, "ambiguous");
  assert.equal(resumed.pushCount, 0);
  assert.equal(watchCount(fixture.storage), watchesBefore);
  assert.deepEqual(
    readRevisionCoverage(delivered.observation.directory).map(
      (entry) => entry.sha,
    ),
    coverageBefore,
  );
});

test("mismatched owner leaves coverage unobserved without adopting it", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const accepted = delivered.receipt.sha;
  await fixture.stopObserver(delivered.observation.directory);
  rmSync(delivered.observation.directory, { recursive: true, force: true });
  // Only a mismatched live owner remains (different branch).
  fixture.observerDirectory = await startExecutionMailbox(
    {
      mode: "execution",
      repo,
      branch: "other-branch",
      maxDurationMs: 60_000,
    },
    {
      root: fixture.execution,
      storage: fixture.storage,
      env: fixture.env,
    },
  );

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.observation.state, "unobserved");
  assert.equal(resumed.observation.ownership, "missing");
  assert.equal(resumed.pushCount, 0);
  assert.equal(
    readRevisionCoverage(fixture.observerDirectory).length,
    0,
    "mismatched owner must not receive the accepted SHA",
  );
});
