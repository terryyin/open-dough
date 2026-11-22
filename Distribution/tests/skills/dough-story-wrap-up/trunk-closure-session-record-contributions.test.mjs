// A wrapped-up Trunk Mode session's published record, read from a fresh
// default-branch-only clone, holds every accepted trunk contribution of the
// session in order: its increments and its closure, each range readable with
// its exact files. Another writer's changes, refused candidates, edits never
// published and the record commit itself are no session work.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { beginNativeSession } from "../../../src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs";
import {
  executionSessionWorkflow,
  sessionRecordRelativePath,
} from "../../../src/skills/dough-execute-plan/scripts/session-record.mjs";
import { advanceOriginFromAnotherWriter } from "../dough-execute-plan/publication-test-fixtures.mjs";
import { git } from "../dough-execute-plan/execution-increment-managed-delivery-test-fixtures.mjs";
import { commitIncrement } from "../dough-execute-plan/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";
import { sessionRecordFiles } from "./trunk-closure-session-record-test-fixtures.mjs";

const targetRef = "refs/heads/main";

// A fresh clone of only the origin's default branch, as a developer on
// another machine has it.
async function defaultBranchOnlyClone(t, origin) {
  const parent = mkdtempSync(join(tmpdir(), "session-reader-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const clone = join(parent, "clone");
  await promisify(execFile)("git", [
    "clone",
    "--quiet",
    "--no-local",
    "--single-branch",
    origin,
    clone,
  ]);
  const read = async (...args) => (await git(clone, ...args)).stdout.trim();
  const lines = async (...args) =>
    (await read(...args)).split("\n").filter(Boolean);
  return { read, lines };
}

// Delivers two increments in process, with another writer's change between
// them and the second refused once by a racing writer, then the before-cleanup
// increment through the installed `deliver`, and closes through `finish`
// with an uncommitted edit left in the execution worktree: the record is
// published and retirement preserves the dirty checkout.
async function wrapUpSessionWithTwoIncrements(t) {
  const fixture = await createTrunkClosureFixture(t);
  const { sessionId } = beginNativeSession(fixture.execution);
  const request = {
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    targetRef,
    repo: "owner/project",
  };
  const first = await fixture.deliverManagedExecutionIncrement({
    ...request,
    previouslyPublishedBase: fixture.trunkSha,
  });
  assert.equal(first.ok, true, JSON.stringify(first));
  await advanceOriginFromAnotherWriter(fixture.origin);
  await commitIncrement(fixture, "second");
  let refused, racing;
  const second = await fixture.deliverManagedExecutionIncrement({
    ...request,
    previouslyPublishedBase: first.receipt.sha,
    validate: async () => ({ ok: true }),
    beforePush: async ({ attempt, candidate }) => {
      if (attempt !== 0) return;
      refused = candidate;
      racing = await advanceOriginFromAnotherWriter(fixture.origin, {
        file: "racing.txt",
      });
    },
  });
  assert.equal(second.ok, true, JSON.stringify(second));
  assert.notEqual(second.receipt.sha, refused);
  // Their observers stop before finish retires the launcher they run from.
  for (const { observation } of [first, second])
    await fixture.stopObserver(observation.directory);
  await commitIncrement(fixture, "before-cleanup");
  const beforeCleanup = (
    await deliverBeforeCleanupThroughCli(fixture, { base: second.receipt.sha })
  ).receipt.sha;
  const final = await commitFinalClosure(fixture);
  writeFileSync(join(fixture.execution, "uncommitted.txt"), "uncommitted\n");
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
  const closed = await finishThroughCli(fixture, {
    beforeCleanup,
    final,
    extra: ["--created-for-work"],
  });
  assert.equal(
    closed.result.record?.status,
    "published",
    JSON.stringify(closed),
  );
  assert.equal(closed.result.cleanup.reason, "dirty checkout");
  return {
    fixture,
    sessionId,
    increments: [first.receipt.sha, second.receipt.sha, beforeCleanup, final],
    racing,
  };
}

test("a wrapped-up session's record read from a default-branch-only clone holds every accepted contribution in order and no other writer's, refused, unpublished or record work", async (t) => {
  const { fixture, sessionId, increments, racing } =
    await wrapUpSessionWithTwoIncrements(t);
  const clone = await defaultBranchOnlyClone(t, fixture.origin);

  const files = await clone.lines(
    "log",
    "--format=",
    "--name-only",
    "--diff-filter=A",
    "--",
    sessionRecordFiles,
  );
  assert.deepEqual(files, [
    `.planning/${sessionRecordRelativePath(sessionId)}`,
  ]);
  const published = JSON.parse(await clone.read("show", `HEAD:${files[0]}`));
  assert.equal(published.workflow, executionSessionWorkflow);
  assert.equal(Number.isNaN(Date.parse(published.closedAt)), false);

  const [first, second, beforeCleanup, final] = increments;
  assert.deepEqual(published.ranges, [
    { base: fixture.trunkSha, candidate: first },
    { base: racing, candidate: second },
    { base: second, candidate: beforeCleanup },
    { base: beforeCleanup, candidate: final },
  ]);
  const exactFiles = [
    ["increment.md"],
    ["second.txt"],
    ["before-cleanup.txt"],
    ["closure.txt"],
  ];
  const rangeCommits = new Set();
  for (const [index, { base, candidate }] of published.ranges.entries()) {
    assert.deepEqual(
      await clone.lines("diff", "--name-only", base, candidate),
      exactFiles[index],
    );
    for (const sha of await clone.lines("rev-list", `${base}..${candidate}`))
      rangeCommits.add(sha);
  }
  assert.deepEqual([...rangeCommits].sort(), [...increments].sort());
  assert.deepEqual(
    await clone.lines("log", "--all", "--format=%H", "--", "uncommitted.txt"),
    [],
  );
});
