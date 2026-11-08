// Selection at one full revision through the real adapter discovery command.
// Older completed attempts can replace a later incomplete attempt only
// within the same check and context.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { adapterRevisionLookup } from "../../dashboard/server/baseCiAdapterRevisionLookup.ts";
import { revisionLookupOrGap } from "../../dashboard/server/baseCiRevisionLookupSource.ts";
import { checkoutRoot } from "../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import { selectAdapterComparisonEndpoint } from "./dashboardCiAdapterComparisonEndpoint.mjs";
import { makeMe } from "./makeMe.mjs";

const source = { repository: "owner/repo", ref: "main" };
const sha = "a".repeat(40);
const makeAttempt = (
  attemptId,
  outcome,
  minute,
  check = "test",
  context = "push",
) => ({
  sha,
  runId: attemptId,
  attemptId,
  outcome,
  check,
  context,
  time: `2026-11-05T09:${minute}:00Z`,
});

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
  mkdirSync(path.join(root, ".planning"));
  writeFileSync(
    path.join(root, ".planning", "open-dough.json"),
    JSON.stringify({
      ciAdapter: [
        process.execPath,
        "-e",
        "require('node:net').createServer().listen(0, '127.0.0.1')",
      ],
    }),
  );
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

test("the selected endpoint gives the same malformed and oversized answer reasons as proof", async () => {
  for (const [answer, reason] of [
    [
      "{",
      /^The CI adapter answered no job graph: CI adapter returned invalid JSON: .+\.$/,
    ],
    [
      JSON.stringify({ jobs: [], padding: "x".repeat(64 * 1024) }),
      /^The CI adapter answered no job graph: its answer is longer than 64 KiB\.$/,
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
    if (prior === undefined) delete process.env[setting];
    else process.env[setting] = prior;
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
