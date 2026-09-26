import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { whileObserving } from "./ci-mailbox-await-test-fixtures.mjs";
import {
  createMailbox,
  readRevisionCoverage,
  registerPushedRevision,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";

const pushed = "d".repeat(40);

// The real in-process mailbox worker observing a project through a controlled
// command adapter that reports `attempts.json`, polling every `pollMs`.
async function startObservedProject(t, pollMs) {
  const project = mkdtempSync(join(tmpdir(), "ci-await-wake-"));
  const storage = join(project, "mailboxes");
  const teardown = fixtureTeardown(project);
  t.after(teardown.cleanup);
  const attempts = join(project, "attempts.json");
  const calls = join(project, "adapter-calls");
  const adapter = join(project, "adapter.mjs");
  writeFileSync(
    adapter,
    `import { readFileSync, writeFileSync } from 'node:fs';
const calls = Number(readFileSync(${JSON.stringify(calls)}, 'utf8')) + 1;
writeFileSync(${JSON.stringify(calls)}, String(calls));
process.stdout.write(readFileSync(${JSON.stringify(attempts)}, 'utf8'));
`,
  );
  writeFileSync(calls, "0");
  mkdirSync(join(project, ".planning"));
  writeFileSync(
    join(project, ".planning/open-dough.json"),
    JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
  );
  // Published whole: the adapter may read it while a poll is in flight, and
  // a partial read would be a poll error, which waits a full interval.
  const setAttempt = (outcome) =>
    publishJson(project, "attempts.json", {
      attempts: outcome
        ? [{ runId: "run", attemptId: "1", sha: pushed, outcome }]
        : [],
    });
  setAttempt(undefined);
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: "feature/wake",
      maxDurationMs: 60_000,
      pollMs,
    },
    { root: project, storage },
  );
  const worker = runMailboxWorker(directory, { root: project, storage });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: project, storage }),
  );
  const pollCount = () => Number(readFileSync(calls, "utf8"));
  const awaitObserved = whileObserving(worker);
  await awaitObserved(() => pollCount() === 1, "initial poll");
  const awaitPushed = () =>
    awaitRevision(directory, pushed, {
      root: project,
      storage,
      deadlineMs: 5_000,
      workerLiveness: () => "alive",
    });
  return { directory, setAttempt, pollCount, awaitPushed, awaitObserved };
}

test("registering a revision whose CI already finished delivers its verdict without waiting for the next poll", async (t) => {
  // No scheduled poll can happen while this test runs.
  const observed = await startObservedProject(t, 10 * 60 * 1000);
  observed.setAttempt("success");
  registerPushedRevision(observed.directory, pushed);
  const result = await observed.awaitPushed();
  assert.equal(result.verdict, "success", JSON.stringify(result));
  assert.equal(result.effectiveEvidence.source, "exact");
});

test("a registered revision still in CI gets its verdict from a later poll", async (t) => {
  const observed = await startObservedProject(t, 50);
  observed.setAttempt("pending");
  registerPushedRevision(observed.directory, pushed);
  await observed.awaitObserved(
    () => readRevisionCoverage(observed.directory)[0]?.state === "pending",
    "revision in CI",
  );
  observed.setAttempt("success");
  const result = await observed.awaitPushed();
  assert.equal(result.verdict, "success");
});
