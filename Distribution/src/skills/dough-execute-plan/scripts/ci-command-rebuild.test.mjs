// Rebuild uses the bounded selected-attempt transport, outside observation.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { requestCommandRebuild } from "./ci-command-attempt.mjs";
import { attemptAdapter } from "./ci-command-attempt-test-fixtures.mjs";
import { checkedSha } from "./ci-command-adapter-test-fixtures.mjs";

test("rebuild preserves original opaque identity and accepts the new named attempt from its project folder", async (t) => {
  const { root, ask } = attemptAdapter(t, requestCommandRebuild);
  const reply = {
    result: "accepted",
    attempt: { runId: "new/run", attemptId: 2, sha: checkedSha },
  };
  assert.deepEqual(await ask(JSON.stringify(reply)), reply);
  assert.deepEqual(
    JSON.parse(readFileSync(join(root, "request.json"), "utf8")),
    {
      operation: "rebuild",
      check: { repo: "owner/project", branch: "main" },
      attempt: { runId: "r1", attemptId: "9f1c", sha: checkedSha },
    },
  );
});

test("rebuild preserves refusal and uncertainty reasons without inventing an attempt", async (t) => {
  const { ask } = attemptAdapter(t, requestCommandRebuild);
  for (const result of ["refused", "uncertain"]) {
    const answer = { result, reason: "Provider cannot admit another attempt" };
    assert.deepEqual(await ask(JSON.stringify(answer)), answer);
  }
});

test("a rebuild answer outside its three result shapes is uncertain", async (t) => {
  const { ask } = attemptAdapter(t, requestCommandRebuild);
  for (const answer of [
    null,
    [],
    { accepted: true },
    { result: "accepted" },
    {
      result: "accepted",
      attempt: { runId: "r2", attemptId: 2, sha: "short" },
    },
    {
      result: "accepted",
      attempt: { runId: "", attemptId: 2, sha: checkedSha },
    },
    {
      result: "accepted",
      attempt: { runId: "r2", attemptId: 2, sha: checkedSha },
      reason: "both",
    },
    { result: "refused" },
    { result: "refused", reason: " " },
    { result: "uncertain", reason: 1 },
    {
      result: "uncertain",
      reason: "lost",
      attempt: { runId: "r2", attemptId: 2, sha: checkedSha },
    },
  ]) {
    const actual = await ask(JSON.stringify(answer));
    assert.equal(actual.result, "uncertain", JSON.stringify(answer));
    assert.match(actual.reason, /CI rebuild must return/);
    assert.equal(actual.attempt, undefined);
  }
});

test("nonzero, held timeout, oversized stdout and malformed JSON rebuild answers are uncertain", async (t) => {
  const { root, ask } = attemptAdapter(t, requestCommandRebuild);
  for (const [answer, options, reason] of [
    ["exit", {}, /admission unknown/],
    ["hold", { timeoutMs: 1000 }, /Command failed/],
    [
      JSON.stringify({ result: "uncertain", reason: "x".repeat(65536) }),
      {},
      /maxBuffer/,
    ],
    ["{broken", {}, /CI adapter returned invalid JSON/],
  ]) {
    const actual = await ask(answer, options);
    assert.equal(actual.result, "uncertain");
    assert.match(actual.reason, reason);
    assert.equal(actual.attempt, undefined);
    assert.equal(
      JSON.parse(readFileSync(join(root, "request.json"), "utf8")).operation,
      "rebuild",
    );
  }
});

test("execution observation with a declared rebuild keeps its command requests read-only", async (t) => {
  const { makeMe } = await import("../../../../tests/support/makeMe.mjs");
  const { projectFixture } =
    await import("./ci-command-adapter-test-fixtures.mjs");
  const { watchCiExecution } = await import("./watch-ci.mjs");
  const fixture = projectFixture(t, (adapter) =>
    makeMe.projectCiSettings
      .with({
        ciAdapter: [process.execPath, adapter],
        ciRebuild: [process.execPath, adapter],
      })
      .please(),
  );
  const controller = new AbortController(),
    events = [];
  await watchCiExecution({
    repo: "owner/project",
    branch: "feature/custom",
    root: fixture.root,
    signal: controller.signal,
    maxDurationMs: 60000,
    sleep: async () => controller.abort(),
    emit: (event) => events.push(event),
  });
  const requests = readFileSync(fixture.requests, "utf8")
    .trim()
    .split("\n")
    .map(JSON.parse);
  assert.ok(requests.length > 0);
  assert.deepEqual(
    new Set(requests.map((request) => request.operation)),
    new Set(["discover"]),
  );
  assert.deepEqual(events, []);
});
