// Revision nearest-result rule (`../../dashboard/server/baseCiNearest.ts`):
// exact and ancestor selection, cancelled→completed fallback, and the
// story-start bound for result endpoints.
import assert from "node:assert/strict";
import test from "node:test";
import { selectRevisionAttempt } from "../../dashboard/server/baseCiRevisionAttempt.ts";
import { nearestRevisionBuild } from "../../dashboard/server/baseCiRevisionNearest.ts";

const sha = (n) => n.padEnd(40, "0");
const a = sha("a");
const b = sha("b");
const c = sha("c");
const start = sha("s");

test("selectRevisionAttempt prefers a completed timed attempt over a cancelled latest", () => {
  const cancelled = {
    databaseId: 9,
    attempt: 2,
    headSha: a,
    status: "completed",
    conclusion: "cancelled",
    createdAt: "2026-11-05T12:01:00Z",
  };
  const passed = {
    databaseId: 9,
    attempt: 1,
    headSha: a,
    status: "completed",
    conclusion: "success",
    createdAt: "2026-11-05T12:00:00Z",
    startedAt: "2026-11-05T12:00:00Z",
    completedAt: "2026-11-05T12:03:00Z",
  };
  assert.equal(selectRevisionAttempt([cancelled], a, [passed])?.attempt, 1);
});

test("nearestRevisionBuild labels an ancestor and stops at the story-start bound", async () => {
  const runs = {
    [a]: [
      {
        databaseId: 1,
        attempt: 1,
        headSha: a,
        status: "completed",
        conclusion: "success",
        createdAt: "2026-11-05T12:00:00Z",
        startedAt: "2026-11-05T12:00:00Z",
        completedAt: "2026-11-05T12:03:00Z",
      },
    ],
  };
  const lookup = {
    listRunsAt: async (revision) => runs[revision] ?? [],
    subjectOf: async () => "subject",
  };
  const exact = await nearestRevisionBuild([c, b, a], lookup);
  assert.equal(exact?.revision, a);
  assert.equal(exact?.selection, "ancestor");
  assert.equal(exact?.laterWithoutResult, 2);

  const bounded = await nearestRevisionBuild([c, b, a, start], lookup, start);
  assert.equal(bounded?.revision, a);
  const stopped = await nearestRevisionBuild([start, a], lookup, start);
  assert.equal(stopped, undefined);
});

test("nearestRevisionBuild walks past a timed build whose proof is not usable", async () => {
  const runs = {
    [b]: [
      {
        databaseId: 2,
        attempt: 1,
        headSha: b,
        status: "completed",
        conclusion: "success",
        createdAt: "2026-11-05T12:30:00Z",
        startedAt: "2026-11-05T12:30:00Z",
        completedAt: "2026-11-05T12:33:00Z",
      },
    ],
    [a]: [
      {
        databaseId: 1,
        attempt: 1,
        headSha: a,
        status: "completed",
        conclusion: "success",
        createdAt: "2026-11-05T12:00:00Z",
        startedAt: "2026-11-05T12:00:00Z",
        completedAt: "2026-11-05T12:03:00Z",
      },
    ],
  };
  const lookup = {
    listRunsAt: async (revision) => runs[revision] ?? [],
    subjectOf: async () => "subject",
  };
  const chosen = await nearestRevisionBuild([c, b, a], lookup, undefined, {
    proofUsable: async (build) => build.revision === a,
  });
  assert.equal(chosen?.revision, a);
  assert.equal(chosen?.selection, "ancestor");
  assert.equal(chosen?.laterWithoutResult, 2);

  const fallback = await nearestRevisionBuild([c, b], lookup, undefined, {
    proofUsable: async () => false,
  });
  assert.equal(fallback?.revision, b);
  assert.equal(fallback?.laterWithoutResult, 1);
});
