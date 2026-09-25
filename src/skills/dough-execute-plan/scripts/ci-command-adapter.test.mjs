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
import { setTimeout as pause } from "node:timers/promises";
import { test } from "node:test";
import { createCommandRunAcquisition } from "./ci-command-adapter.mjs";
import {
  callsReached,
  checkedSha,
  projectFixture,
} from "./ci-command-adapter-test-fixtures.mjs";
import { ciAttemptKey } from "./ci-failures.mjs";
import { watchCiExecution } from "./watch-ci.mjs";

async function waitForCalls(path, count) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (callsReached(path, count)) return;
    await pause(10);
  }
  throw new Error(`Adapter did not reach ${count} calls`);
}

test("observer selects one configured command and stays quiet through pending then success", async (t) => {
  const fixture = projectFixture(t, (adapter) => ({
    ciAdapter: [process.execPath, adapter],
  }));
  const controller = new AbortController();
  const events = [];
  const observation = watchCiExecution({
    repo: "owner/project",
    branch: "feature/custom",
    root: fixture.root,
    signal: controller.signal,
    sleep: async () => undefined,
    emit: (event) => events.push(event),
  });
  try {
    await waitForCalls(fixture.calls, 2);
  } finally {
    controller.abort();
  }
  await observation;
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
  const acquire = createCommandRunAcquisition({
    command: [process.execPath, fixture.adapter],
    repo: "owner/project",
    branch: "feature/custom",
    root: fixture.root,
  });
  const signal = new AbortController().signal;

  const polls = [];
  for (let poll = 0; poll < 4; poll += 1) polls.push(await acquire(signal));
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
  const attempts = [
    { runId: 'r1', attemptId: '1', sha: ${JSON.stringify(oldFailure)}, outcome: 'failure', time: '2026-09-15T10:00:00Z' },
    { runId: 'r2', attemptId: '1', sha: ${JSON.stringify(oldIncomplete)}, outcome: 'incomplete', time: '2026-09-16T10:00:00Z' },
    { runId: 'r3', attemptId: '1', sha: ${JSON.stringify(newestSuccess)}, outcome: 'success', time: '2026-09-17T10:00:00Z' },
  ];
  if (call > 1) attempts.push({ runId: 'r4', attemptId: '1', sha: ${JSON.stringify(newFailure)}, outcome: 'failure', time: '2026-09-18T10:00:00Z' });
  process.stdout.write(JSON.stringify({ attempts }));
}
`,
  );
  mkdirSync(join(root, ".planning"));
  writeFileSync(
    join(root, ".planning/open-dough.json"),
    JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
  );
  const controller = new AbortController();
  const events = [];
  const observation = watchCiExecution({
    repo: "owner/project",
    branch: "feature/custom",
    root,
    signal: controller.signal,
    sleep: async () => undefined,
    emit: (event) => events.push(event),
  });
  try {
    await waitForCalls(discoveries, 4);
  } finally {
    controller.abort();
  }
  await observation;

  assert.deepEqual(
    events.map(({ type, sha, runId }) => ({ type, sha, runId })),
    [{ type: "CI_FAILURE", sha: newFailure, runId: "r4" }],
  );
});
