import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  chmodSync,
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
import { fileURLToPath } from "node:url";
import { createCommandRunAcquisition } from "./ci-command-adapter.mjs";
import { ciAttemptKey } from "./ci-failures.mjs";
import { watchCiExecution } from "./watch-ci.mjs";

const observer = fileURLToPath(new URL("./watch-ci.mjs", import.meta.url));
const checkedSha = "c".repeat(40);

function projectFixture(t, configuration) {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-test-"));
  const planning = join(root, ".planning");
  const bin = join(root, "bin");
  const requests = join(root, "adapter-requests.jsonl");
  const calls = join(root, "adapter-calls");
  const ghCalls = join(root, "gh-calls");
  mkdirSync(planning);
  mkdirSync(bin);
  const adapter = join(bin, "controlled-adapter.mjs");
  writeFileSync(
    adapter,
    `#!${process.execPath}
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync(${JSON.stringify(requests)}, JSON.stringify(request) + '\\n');
const path = ${JSON.stringify(calls)};
const call = existsSync(path) ? Number(readFileSync(path, 'utf8')) + 1 : 1;
writeFileSync(path, String(call));
if (call === 1) writeFileSync('.planning/open-dough.json', JSON.stringify({ ciAdapter: [] }));
const attempt = call === 1
  ? { runId: 'run:opaque', attemptId: 'attempt/first', sha: ${JSON.stringify(checkedSha)}, outcome: 'pending', url: 'https://ci.example/run', time: '2026-09-15T10:00:00Z' }
  : call === 2
    ? { runId: 'run:opaque', attemptId: 'attempt/retry', sha: ${JSON.stringify(checkedSha)}, outcome: 'success', url: 'https://ci.example/run', time: '2026-09-15T10:01:00Z' }
    : call === 3
      ? { runId: 'run:opaque', attemptId: 'attempt:failed', sha: ${JSON.stringify(checkedSha)}, outcome: 'failure' }
      : { runId: 'run:opaque', attemptId: 'attempt:incomplete', sha: ${JSON.stringify(checkedSha)}, outcome: 'incomplete' };
process.stdout.write(JSON.stringify({ attempts: [attempt] }));
`,
  );
  chmodSync(adapter, 0o700);
  writeFileSync(
    join(bin, "gh"),
    `#!${process.execPath}\nimport { existsSync, readFileSync, writeFileSync } from 'node:fs';\nconst path = ${JSON.stringify(ghCalls)};\nconst count = existsSync(path) ? Number(readFileSync(path, 'utf8')) + 1 : 1;\nwriteFileSync(path, String(count));\nprocess.stdout.write('[]');\n`,
  );
  chmodSync(join(bin, "gh"), 0o700);
  if (configuration !== null)
    writeFileSync(
      join(planning, "open-dough.json"),
      JSON.stringify(configuration(adapter)),
    );
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, adapter, requests, calls, ghCalls, bin };
}

async function waitForCalls(path, count) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (existsSync(path) && Number(readFileSync(path, "utf8")) >= count) return;
    await pause(10);
  }
  throw new Error(`Adapter did not reach ${count} calls`);
}

async function runObserverUntil(path, count, fixture) {
  const child = spawn(
    process.execPath,
    [observer, "--execution", "owner/project", "feature/custom", "60000"],
    {
      cwd: fixture.root,
      env: {
        ...process.env,
        PATH: `${fixture.bin}:${process.env.PATH}`,
      },
    },
  );
  const stdout = [];
  const stderr = [];
  child.stdout.on("data", (chunk) => stdout.push(chunk));
  child.stderr.on("data", (chunk) => stderr.push(chunk));
  try {
    await waitForCalls(path, count);
  } finally {
    child.kill("SIGTERM");
  }
  const [code] = await once(child, "exit");
  assert.equal(code, 0, Buffer.concat(stderr).toString());
  return Buffer.concat(stdout).toString();
}

test("normal observer CLI selects the configured command", async (t) => {
  const fixture = projectFixture(t, (adapter) => ({
    ciAdapter: [process.execPath, adapter],
  }));
  const stdout = await runObserverUntil(fixture.calls, 1, fixture);

  assert.equal(stdout, "");
  assert.equal(existsSync(fixture.ghCalls), false);
  assert.deepEqual(JSON.parse(readFileSync(fixture.requests, "utf8")), {
    operation: "discover",
    check: { repo: "owner/project", branch: "feature/custom" },
  });
});

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
    [pending, success, failure, incomplete].map(
      ({
        databaseId,
        attempt,
        headSha,
        status,
        conclusion,
        url,
        createdAt,
      }) => ({
        databaseId,
        attempt,
        headSha,
        status,
        conclusion,
        url,
        createdAt,
      }),
    ),
    [
      {
        databaseId: "run:opaque",
        attempt: "attempt/first",
        headSha: checkedSha,
        status: "in_progress",
        conclusion: null,
        url: "https://ci.example/run",
        createdAt: "2026-09-15T10:00:00Z",
      },
      {
        databaseId: "run:opaque",
        attempt: "attempt/retry",
        headSha: checkedSha,
        status: "completed",
        conclusion: "success",
        url: "https://ci.example/run",
        createdAt: "2026-09-15T10:01:00Z",
      },
      {
        databaseId: "run:opaque",
        attempt: "attempt:failed",
        headSha: checkedSha,
        status: "completed",
        conclusion: "failure",
        url: undefined,
        createdAt: undefined,
      },
      {
        databaseId: "run:opaque",
        attempt: "attempt:incomplete",
        headSha: checkedSha,
        status: "completed",
        conclusion: "cancelled",
        url: undefined,
        createdAt: undefined,
      },
    ],
  );
  assert.notEqual(
    ciAttemptKey("run:opaque", "attempt/first"),
    ciAttemptKey("run", "opaque:attempt/first"),
  );
});

for (const [name, configuration] of [
  ["absent", null],
  ["empty", () => ({ ciAdapter: [] })],
]) {
  test(`${name} ciAdapter retains GitHub discovery`, async (t) => {
    const fixture = projectFixture(t, configuration);
    const stdout = await runObserverUntil(fixture.ghCalls, 1, fixture);

    assert.equal(stdout, "");
    assert.ok(Number(readFileSync(fixture.ghCalls, "utf8")) >= 1);
    assert.equal(existsSync(fixture.calls), false);
  });
}
