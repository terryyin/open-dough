import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { watchCiExecution } from "./watch-ci.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import { endProcess } from "./process-lifetime-test-fixtures.mjs";
import { waitForFile, waitForPidExit } from "./watch-ci-test-fixtures.mjs";

const observer = fileURLToPath(new URL("./watch-ci.mjs", import.meta.url));
const checkedSha = "e".repeat(40).toUpperCase();

function unavailableFixture(t, mode) {
  const root = mkdtempSync(join(tmpdir(), "ci-adapter-unavailable-test-"));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const planning = join(root, ".planning");
  const adapter = join(root, "adapter.mjs");
  const requests = join(root, "requests.jsonl");
  const pids = join(root, "adapter.pids");
  // Each hanging adapter appends its pid. The product ends them; any it failed
  // to end is ended here, after the test observed that, before the root it
  // runs from is removed.
  teardown.defer(async () => {
    if (!existsSync(pids)) return;
    for (const line of readFileSync(pids, "utf8").trim().split("\n"))
      await endProcess(Number(line), adapter);
  });
  const discovered = join(root, "failure-discovered");
  mkdirSync(planning);
  writeFileSync(
    adapter,
    `#!${process.execPath}
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync(${JSON.stringify(requests)}, JSON.stringify(request) + '\\n');
const mode = ${JSON.stringify(mode)};
if (mode === 'invalid-json') process.stdout.write('{');
else if (mode === 'unknown-status') process.stdout.write(JSON.stringify({ attempts: [{ runId: 'run', attemptId: 'attempt', sha: ${JSON.stringify(checkedSha)}, outcome: 'mystery' }] }));
else if (mode === 'malformed-sha') process.stdout.write(JSON.stringify({ attempts: [{ runId: 'run', attemptId: 'attempt', sha: 'not-a-full-sha', outcome: 'failure' }] }));
else if (mode === 'failed-command') { process.stderr.write('endpoint unavailable '.repeat(100)); process.exitCode = 2; }
else if (mode === 'timeout' || mode === 'blocking') {
  appendFileSync(${JSON.stringify(pids)}, process.pid + '\\n');
  setInterval(() => {}, 1000);
} else if (request.operation === 'discover') {
  const discoveries = readFileSync(${JSON.stringify(requests)}, 'utf8').split('\\n').filter((line) => line.includes('"discover"')).length;
  if (mode === 'diagnose-fails-then-discovery-lost' && discoveries === 3) {
    appendFileSync(${JSON.stringify(pids)}, process.pid + '\\n');
    setInterval(() => {}, 1000);
  }
  const first = !existsSync(${JSON.stringify(discovered)});
  writeFileSync(${JSON.stringify(discovered)}, '');
  process.stdout.write(JSON.stringify({ attempts: first ? [{ runId: 'known-run', attemptId: 'known-attempt', sha: ${JSON.stringify(checkedSha)}, outcome: 'failure' }] : [] }));
} else { process.stderr.write('diagnostic endpoint unavailable '.repeat(100)); process.exitCode = 3; }
`,
  );
  chmodSync(adapter, 0o700);
  writeFileSync(
    join(planning, "open-dough.json"),
    JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
  );
  return { root, requests, pids };
}

// A hanging adapter records its request, then never answers, so only these
// modes rely on the adapter timeout. It must outlast the adapter's own Node
// start and request record, which a loaded machine can stretch past 250 ms.
// Every other mode answers, and keeps the product's default timeout.
const hangingModes = new Set(["timeout", "diagnose-fails-then-discovery-lost"]);
const hangTimeoutMs = 2_000;

async function observeUnavailable(t, mode) {
  const fixture = unavailableFixture(t, mode);
  const events = [];
  let ghCalls = 0;
  let coverageCalls = 0;
  await watchCiExecution({
    repo: "owner/project",
    branch: "feature/custom",
    root: fixture.root,
    adapterTimeoutMs: hangingModes.has(mode) ? hangTimeoutMs : undefined,
    sleep: async () => undefined,
    emit: (event) => events.push(event),
    observeCoverage: () => {
      coverageCalls += 1;
      return [];
    },
    gh: async () => {
      ghCalls += 1;
      return [];
    },
  });
  return { ...fixture, events, ghCalls, coverageCalls };
}

for (const mode of [
  "invalid-json",
  "unknown-status",
  "malformed-sha",
  "failed-command",
  "timeout",
]) {
  test(`${mode} loses custom observation once without fallback`, async (t) => {
    const { events, ghCalls, coverageCalls, requests } =
      await observeUnavailable(t, mode);
    assert.deepEqual(
      events.map(({ type }) => type),
      ["CI_MONITOR_UNAVAILABLE"],
    );
    assert.ok(events[0].reason.length <= 600);
    assert.equal("workflow" in events[0], false);
    assert.equal(ghCalls, 0);
    assert.equal(coverageCalls, 0);
    assert.equal(readFileSync(requests, "utf8").trim().split("\n").length, 3);
  });
}

test("diagnostic failure preserves the known CI failure and names its gap", async (t) => {
  const { events, requests } = await observeUnavailable(t, "diagnose-fails");
  assert.deepEqual(
    events.map(({ type }) => type),
    ["CI_FAILURE", "CI_MONITOR_UNAVAILABLE"],
  );
  assert.equal(events[0].sha, checkedSha);
  assert.equal(events[0].runId, "known-run");
  assert.match(events[0].diagnostic.unavailable, /diagnostic/i);
  assert.equal(events[0].diagnostic.truncated, true);
  assert.ok(JSON.stringify(events[0]).length < 1200);
  const operations = readFileSync(requests, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line).operation);
  assert.deepEqual(operations, [
    "discover",
    "diagnose",
    "discover",
    "diagnose",
    "discover",
    "diagnose",
  ]);
});

test("discovery loss after a diagnostic failure still preserves the known CI failure", async (t) => {
  const { events, requests } = await observeUnavailable(
    t,
    "diagnose-fails-then-discovery-lost",
  );
  assert.deepEqual(
    events.map(({ type }) => type),
    ["CI_FAILURE", "CI_MONITOR_UNAVAILABLE"],
  );
  assert.equal(events[0].runId, "known-run");
  assert.match(events[0].diagnostic.unavailable, /diagnostic/i);
  const operations = readFileSync(requests, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line).operation);
  assert.deepEqual(operations, [
    "discover",
    "diagnose",
    "discover",
    "diagnose",
    "discover",
  ]);
});

test("observer cancellation terminates its blocking adapter child", async (t) => {
  const fixture = unavailableFixture(t, "blocking");
  const child = spawn(
    process.execPath,
    [observer, "--execution", "owner/project", "feature/custom", "60000"],
    { cwd: fixture.root },
  );
  const stdout = [];
  child.stdout.on("data", (chunk) => stdout.push(chunk));
  try {
    await waitForFile(fixture.pids);
  } finally {
    child.kill("SIGTERM");
  }
  const [code, signal] = await once(child, "exit");
  const adapterPid = Number(readFileSync(fixture.pids, "utf8"));
  assert.equal(code, 0, signal);
  assert.equal(Buffer.concat(stdout).toString(), "");
  assert.equal(await waitForPidExit(adapterPid), true);
  assert.equal(existsSync(fixture.requests), true);
});
