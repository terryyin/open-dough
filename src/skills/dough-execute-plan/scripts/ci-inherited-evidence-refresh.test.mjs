import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  latestCommandAttempts,
  targetCommandAttempts,
} from "./ci-command-attempts.mjs";
import { recordedCompletion } from "./ci-mailbox-await.mjs";
import {
  createMailbox,
  readRevisionCoverage,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import { observeRevisionCoverage } from "./ci-mailbox-revision-coverage.mjs";
import {
  acceptedWorkflow,
  commitAll,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";

async function history(t) {
  const root = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-inherited-refresh-"));
  t.after(fixtureTeardown(root, storage).cleanup);
  writeWorkflow(root, acceptedWorkflow);
  writeFileSync(join(root, "app.js"), "base\n");
  const a = await commitAll(root, "base");
  mkdirSync(join(root, "docs"));
  writeFileSync(join(root, "docs/b.md"), "B\n");
  const b = await commitAll(root, "metadata B");
  writeFileSync(join(root, "docs/c.md"), "C\n");
  const c = await commitAll(root, "metadata C");
  const request = { root, repo: "owner/project", branch: "main" };
  const mailbox = () => {
    const directory = createMailbox(
      { ...request, mode: "execution", maxDurationMs: 60_000 },
      { root, storage },
    );
    registerPushedRevision(directory, c);
    return directory;
  };
  const directory = mailbox();
  const normalize = (attempts) =>
    latestCommandAttempts(targetCommandAttempts(attempts, "main"));
  const observe = (current, retained, destination = directory) =>
    observeRevisionCoverage(
      destination,
      normalize(current),
      request,
      Date.now(),
      {
        discoverAncestorCandidates: async () => normalize(retained),
      },
    );
  return {
    a,
    b,
    c,
    directory,
    mailbox,
    observe,
    coverage: () => readRevisionCoverage(directory)[0],
  };
}

const attempt = (sha, outcome) => ({
  sha,
  outcome,
  branch: "main",
  runId: `provider/${sha}`,
  attemptId: "opaque/2",
  time: "2026-10-20T00:00:00Z",
});

test("a nearer retained failure replaces inherited success in the existing mailbox", async (t) => {
  const h = await history(t);
  const green = attempt(h.a, "success");
  await h.observe([], [green]);
  assert.equal(recordedCompletion(h.directory, h.c)?.verdict, "success");
  const failed = attempt(h.b, "failure");
  await h.observe([], [green, failed]);
  assert.deepEqual(h.coverage().basis, { sha: h.b, state: "failure" });
  assert.equal(recordedCompletion(h.directory, h.c)?.verdict, "failure");
  const fresh = h.mailbox();
  await h.observe([], [green, failed], fresh);
  assert.deepEqual(
    recordedCompletion(h.directory, h.c),
    recordedCompletion(fresh, h.c),
  );
});

test("disappearing retained evidence withdraws inherited successful completion", async (t) => {
  const h = await history(t);
  await h.observe([], [attempt(h.a, "success")]);
  assert.equal(recordedCompletion(h.directory, h.c)?.verdict, "success");
  await h.observe([], []);
  assert.equal(h.coverage().state, "undiscovered");
  assert.equal(h.coverage().basis, undefined);
  assert.equal(recordedCompletion(h.directory, h.c), undefined);
});

test("a nearer retained failure outranks a current running ancestor", async (t) => {
  const h = await history(t);
  const running = attempt(h.a, "pending");
  await h.observe([running], [running, attempt(h.b, "failure")]);
  assert.deepEqual(h.coverage().basis, { sha: h.b, state: "failure" });
  assert.equal(recordedCompletion(h.directory, h.c)?.verdict, "failure");
});

test("an exact candidate still takes precedence over inherited failure", async (t) => {
  const h = await history(t);
  const exact = attempt(h.c, "success");
  await h.observe([exact], [attempt(h.b, "failure"), exact]);
  assert.equal(h.coverage().state, "success");
  assert.equal(h.coverage().basis, undefined);
  assert.deepEqual(h.coverage().checkedBy, {
    runId: exact.runId,
    attemptId: exact.attemptId,
  });
});

test("inherited failure acquisition keeps the provider's real attempt provenance", async (t) => {
  const h = await history(t);
  const failed = attempt(h.b, "failure");
  const { ancestorRuns } = await h.observe([], [failed]);
  assert.deepEqual(
    ancestorRuns.map(({ databaseId, attempt: attemptId, headSha }) => ({
      runId: databaseId,
      attemptId,
      sha: headSha,
    })),
    [{ runId: failed.runId, attemptId: failed.attemptId, sha: h.b }],
  );
});
