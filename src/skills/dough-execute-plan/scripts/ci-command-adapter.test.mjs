import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { createCommandAcquisition } from "./ci-command-adapter.mjs";
import {
  answeredUnitAttempts,
  callsReached,
  checkedSha,
  historyDiscoverAttempts,
  projectFixture,
} from "./ci-command-adapter-test-fixtures.mjs";
import { ciAttemptKey } from "./ci-failures.mjs";
import {
  awaitSignalWhileRunning,
  settledProbe,
} from "./process-lifetime-test-fixtures.mjs";
import { watchCiExecution } from "./watch-ci.mjs";

// Observes `watchCiExecution` with a 60 s execution budget until the adapter
// counting its calls in `path` reaches `count`, then stops it and returns the
// events it emitted.
async function observeUntilCalls(root, path, count) {
  const controller = new AbortController();
  const events = [];
  const observation = watchCiExecution({
    repo: "owner/project",
    branch: "feature/custom",
    root,
    maxDurationMs: 60_000,
    signal: controller.signal,
    sleep: async () => undefined,
    emit: (event) => events.push(event),
  });
  try {
    await awaitSignalWhileRunning(
      () => callsReached(path, count),
      settledProbe(observation),
      () => `observation ended before ${path} reached ${count} calls`,
    );
  } finally {
    controller.abort();
  }
  await observation;
  return events;
}

test("observer selects one configured command and stays quiet through pending then success", async (t) => {
  const fixture = projectFixture(t, (adapter) =>
    makeMe.projectCiSettings
      .with({
        ciAdapter: [process.execPath, adapter],
        ciWorkflow: { unusedNativeSetting: true },
      })
      .please(),
  );
  const events = await observeUntilCalls(fixture.root, fixture.calls, 2);
  const requests = readFileSync(fixture.requests, "utf8")
    .trim()
    .split("\n")
    .map(JSON.parse);

  assert.deepEqual(events, []);
  assert.equal(existsSync(fixture.ghCalls), false);
  assert.ok(requests.length >= 2);
  assert.deepEqual(
    JSON.parse(
      readFileSync(join(fixture.root, ".planning/open-dough.json"), "utf8"),
    ),
    { ciAdapter: [] },
  );
  assert.deepEqual(
    new Set(requests.map(({ operation }) => operation)),
    new Set(["discover"]),
  );
  assert.deepEqual(requests[0], {
    operation: "discover",
    check: { repo: "owner/project", branch: "feature/custom" },
  });
});

test("command acquisition retains opaque run and attempt identities across polls", async (t) => {
  const fixture = projectFixture(t, () => ({}));
  const { acquireRuns } = createCommandAcquisition({
    command: [process.execPath, fixture.adapter],
    repo: "owner/project",
    branch: "feature/custom",
    root: fixture.root,
  });
  const signal = new AbortController().signal;

  const polls = [];
  for (let poll = 0; poll < 4; poll += 1) polls.push(await acquireRuns(signal));
  const [[pending], [success], [failure], [incomplete]] = polls;

  assert.deepEqual(
    [pending, success, failure, incomplete],
    [
      {
        databaseId: "run:opaque",
        attempt: "attempt/first",
        headSha: checkedSha,
        headBranch: "feature/custom",
        status: "in_progress",
        conclusion: null,
        url: "https://ci.example/run",
        createdAt: "2026-09-15T10:00:00Z",
      },
      {
        databaseId: "run:opaque",
        attempt: "attempt/retry",
        headSha: checkedSha,
        headBranch: "feature/custom",
        status: "completed",
        conclusion: "success",
        url: "https://ci.example/run",
        createdAt: "2026-09-15T10:01:00Z",
      },
      {
        databaseId: "run:opaque",
        attempt: "attempt:failed",
        headSha: checkedSha,
        headBranch: "feature/custom",
        status: "completed",
        conclusion: "failure",
      },
      {
        databaseId: "run:opaque",
        attempt: "attempt:incomplete",
        headSha: checkedSha,
        headBranch: "feature/custom",
        status: "completed",
        conclusion: "cancelled",
      },
    ],
  );
  assert.notEqual(
    ciAttemptKey("run:opaque", "attempt/first"),
    ciAttemptKey("run", "opaque:attempt/first"),
  );
});

test("command acquisition keeps every discover answer beside newest-per-check retained candidates", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-answered-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const adapter = join(root, "answered-adapter.mjs");
  writeFileSync(
    adapter,
    `process.stdout.write(JSON.stringify({ attempts: ${JSON.stringify(answeredUnitAttempts)} }));
`,
  );
  const acquisition = createCommandAcquisition({
    command: [process.execPath, adapter],
    repo: "owner/project",
    branch: "main",
    root,
  });
  await acquisition.acquireRuns(new AbortController().signal);
  assert.deepEqual(
    (await acquisition.discoverAncestorCandidates()).map(
      ({ databaseId }) => databaseId,
    ),
    ["r2"],
  );
  assert.deepEqual(
    (await acquisition.discoverAnsweredAttempts()).map(
      ({ databaseId }) => databaseId,
    ),
    ["r2", "r1"],
  );
});

test("command observer treats retained older completed attempts as startup history", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-history-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const discoveries = join(root, "discoveries");
  const adapter = join(root, "history-adapter.mjs");
  const [oldFailure, oldIncomplete, newestSuccess, newFailure] = [
    "a",
    "b",
    "c",
    "d",
  ].map((digit) => digit.repeat(40));
  const { startup, laterFailure } = historyDiscoverAttempts({
    oldFailure,
    oldIncomplete,
    newestSuccess,
    newFailure,
  });
  writeFileSync(
    adapter,
    `import { existsSync, readFileSync, writeFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
if (request.operation === 'diagnose') {
  process.stdout.write(JSON.stringify({ excerpt: 'failed' }));
} else {
  const path = ${JSON.stringify(discoveries)};
  const call = existsSync(path) ? Number(readFileSync(path, 'utf8')) + 1 : 1;
  writeFileSync(path, String(call));
  const attempts = ${JSON.stringify(startup)};
  if (call > 1) attempts.push(${JSON.stringify(laterFailure)});
  process.stdout.write(JSON.stringify({ attempts }));
}
`,
  );
  mkdirSync(join(root, ".planning"));
  writeFileSync(
    join(root, ".planning/open-dough.json"),
    JSON.stringify(
      makeMe.projectCiSettings
        .with({ ciAdapter: [process.execPath, adapter] })
        .please(),
    ),
  );
  const events = await observeUntilCalls(root, discoveries, 4);

  assert.deepEqual(
    events.map(({ type, sha, runId }) => ({ type, sha, runId })),
    [{ type: "CI_FAILURE", sha: newFailure, runId: "r4" }],
  );
});
