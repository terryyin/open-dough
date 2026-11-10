// Selection at one full revision through the real adapter discovery command.
// Older completed attempts can replace a later incomplete attempt only
// within the same check and context.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { adapterRevisionLookup } from "../../dashboard/server/baseCiAdapterRevisionLookup.ts";
import { nearestRevisionBuild } from "../../dashboard/server/baseCiRevisionNearest.ts";
import { asSlot } from "../../dashboard/server/revisionBuildSlot.ts";
import { revisionLookupOrGap } from "../../dashboard/server/baseCiRevisionLookupSource.ts";
import { checkoutRoot } from "../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import {
  configureAdapter,
  selectAdapterComparisonEndpoint,
} from "./dashboardCiAdapterComparisonEndpoint.mjs";
import { makeMe } from "./makeMe.mjs";

const source = { repository: "owner/repo", ref: "main" };
const sha = "a".repeat(40);
const makeAttempt = (
  attemptId,
  outcome,
  minute,
  check = "test",
  context = "push",
) =>
  makeMe.aCiAdapterAttempt
    .with({
      sha,
      runId: attemptId,
      attemptId,
      outcome,
      check,
      context,
      time: `2026-11-05T09:${minute}:00Z`,
    })
    .please();

async function chosenAttempt(attempts) {
  const response = JSON.stringify({ attempts });
  const command = [
    process.execPath,
    "-e",
    `process.stdout.write(${JSON.stringify(response)})`,
  ];
  const signal = new AbortController().signal;
  const lookup = await adapterRevisionLookup(
    source,
    undefined,
    checkoutRoot,
    command,
    { maxBuffer: 1024 * 1024, signal },
    signal,
  );
  const [run] = await lookup.listRunsAt(sha);
  return run?.adapterAttempt?.attemptId;
}

test("newest time selects a successful retry independent of listing order", async () => {
  const first = makeAttempt("first", "failure", "00");
  const retry = makeAttempt("retry", "success", "20");
  assert.equal(await chosenAttempt([retry, first]), "retry");
});

test("a newer incomplete attempt falls back to the most recent completed attempt of its check and context", async () => {
  const first = makeAttempt("first", "failure", "00");
  const retry = makeAttempt("retry", "success", "20");
  const check = makeAttempt("other-check", "success", "24", "lint");
  const context = makeAttempt(
    "other-context",
    "success",
    "25",
    "test",
    "pull_request",
  );
  const incomplete = makeAttempt("incomplete", "incomplete", "30");
  assert.equal(
    await chosenAttempt([incomplete, check, retry, context, first]),
    "retry",
  );
  assert.equal(
    await chosenAttempt([incomplete, check, context, first]),
    "first",
  );
  assert.equal(await chosenAttempt([incomplete, check, context]), "incomplete");
});

test("the comparison deadline gives a discovery reason when it expires first", async (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-adapter-comparison-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  configureAdapter(root, [
    process.execPath,
    "-e",
    "require('node:net').createServer().listen(0, '127.0.0.1')",
  ]);
  const signal = AbortSignal.timeout(200);
  const answer = await revisionLookupOrGap(
    source,
    root,
    { cwd: root, maxBuffer: 1024 * 1024, signal },
    signal,
    undefined,
  );
  assert.equal(answer.state, "unread");
  assert.equal(
    answer.reason,
    "The CI adapter did not answer discovery before the comparison deadline.",
  );
});
for (const timedOut of [false, true]) {
  test(`adapter discovery ${timedOut ? "timeout" : "failure"} keeps its own endpoint reason`, async (t) => {
    const root = mkdtempSync(path.join(tmpdir(), "dough-adapter-discovery-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const program = timedOut
      ? "require('node:net').createServer().listen(0, '127.0.0.1')"
      : "process.stderr.write('adapter CI service has no discovery access'); process.exit(2)";
    configureAdapter(root, [process.execPath, "-e", program]);
    if (timedOut) {
      const prior = process.env.DOUGH_CI_ADAPTER_TIMEOUT_MS;
      process.env.DOUGH_CI_ADAPTER_TIMEOUT_MS = "10";
      t.after(() => {
        if (prior === undefined) {
          delete process.env.DOUGH_CI_ADAPTER_TIMEOUT_MS;
        } else {
          process.env.DOUGH_CI_ADAPTER_TIMEOUT_MS = prior;
        }
      });
    }
    const signal = new AbortController().signal;
    const answer = await revisionLookupOrGap(
      source,
      root,
      { cwd: root, maxBuffer: 1024 * 1024, signal },
      signal,
      undefined,
    );
    assert.equal(answer.state, "unread");
    if (timedOut) {
      assert.equal(
        answer.reason,
        "The CI adapter did not answer discovery within 0.01 seconds.",
      );
    } else {
      assert.match(answer.reason, /adapter CI service has no discovery access/);
    }
  });
}
const attempt = makeMe.aCiAdapterAttempt
  .passed({
    sha,
    runId: "selected",
    attemptId: "retry",
    branch: "main",
    startedAt: "2026-11-05T09:00:00Z",
    completedAt: "2026-11-05T09:04:00Z",
  })
  .please();
async function selectedEndpointTiming(jobResponse, signal) {
  const { slot, lookup } = await selectAdapterComparisonEndpoint(
    attempt,
    jobResponse,
    signal,
  );
  return () => lookup.timeWithoutRunnerWaitsOf(slot);
}
test("the selected endpoint keeps precise malformed, oversized, unsupported and unavailable job-graph reasons", async () => {
  for (const [answer, reason] of [
    [
      "{",
      /^The CI adapter answered no job graph: CI adapter returned invalid JSON: .+\.$/,
    ],
    [
      JSON.stringify({ jobs: [], padding: "x".repeat(64 * 1024) }),
      /^The CI adapter answered no job graph: its answer is longer than 64 KiB\.$/,
    ],
    [
      "unsupported",
      /^The CI adapter answered no job graph: it exited with status 2 \(unsupported CI adapter operation\)\.$/,
    ],
    [
      JSON.stringify({ unavailable: "Job history expired!" }),
      /^The CI adapter gave no job graph: Job history expired!$/,
    ],
  ]) {
    const readTiming = await selectedEndpointTiming(
      answer,
      new AbortController().signal,
    );
    assert.match((await readTiming()).reason, reason);
  }
});

test("the selected endpoint reports its adapter timeout as a timing reason", async (t) => {
  const readTiming = await selectedEndpointTiming(
    "hold",
    new AbortController().signal,
  );
  const setting = "DOUGH_CI_ADAPTER_TIMEOUT_MS";
  const prior = process.env[setting];
  t.after(() => {
    if (prior === undefined) {
      delete process.env[setting];
    } else {
      process.env[setting] = prior;
    }
  });
  process.env[setting] = "300";
  assert.deepEqual(await readTiming(), {
    reason:
      "The CI adapter answered no job graph: it gave no answer within 0.3 seconds.",
  });
});

test("a cancelled comparison does not receive a timing reason as its answer", async () => {
  const controller = new AbortController();
  const readTiming = await selectedEndpointTiming("hold", controller.signal);
  const pending = readTiming();
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});
test("an attempt id shared by another discovered run explains unavailable timing without asking jobs", async () => {
  const attempts = [
    attempt,
    makeMe.aCiAdapterAttempt
      .passed({ ...attempt, runId: "other", check: "lint" })
      .please(),
  ];
  const command = [
    process.execPath,
    "-e",
    `process.stdout.write(${JSON.stringify(JSON.stringify({ attempts }))})`,
  ];
  const signal = new AbortController().signal;
  const lookup = await adapterRevisionLookup(
    source,
    undefined,
    checkoutRoot,
    command,
    { maxBuffer: 1024 * 1024, signal },
    signal,
  );
  const slot = asSlot(await nearestRevisionBuild([sha], lookup), "No build");
  assert.equal(slot.kind, "build");
  assert.deepEqual(await lookup.timeWithoutRunnerWaitsOf(slot), {
    reason:
      "The CI adapter listed another discovered attempt as attempt retry at aaaaaaa.",
  });
});
