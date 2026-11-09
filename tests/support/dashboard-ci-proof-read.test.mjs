// Intent's CI proof read on the dashboard server: the judged result names
// its GitHub Actions run's id and attempt, which key the read
// (../../dashboard/server/baseCiNearest.ts). An archive the local GitHub
// request owner passed on as text, as one an earlier Open Dough started
// does, is unreadable with what the developer can do
// (../../dashboard/server/ciProofArtifact.ts). The shared read's artifact
// choice, and the archive extraction and checks it names:
// ../../src/skills/dough-test-optimization/scripts/ci-proof-read.test.mjs.
// Summaries broken down by file: ./dashboard-ci-proof-breakdown-read.test.mjs.
// Query-shape refusals: ./dashboard-ci-proof-parse.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { judgeNearest } from "../../dashboard/server/baseCiNearest.ts";
import { zipOf } from "../../dashboard/tests/support/ciProofArtifacts.ts";
import {
  olderRequestOwnerDetail,
  unreadableBy,
} from "../../dashboard/server/ciProofArtifact.ts";
import { unavailableLine } from "../../dashboard/src/ciProofAbsenceWording.ts";
import { archiveBytes } from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";

const sha = (digit) => digit.repeat(40);
const commits = [
  {
    sha: sha("2"),
    commit: { message: "Running" },
    parents: [{ sha: sha("1") }],
  },
  { sha: sha("1"), commit: { message: "Done" }, parents: [] },
];
const run = (digit, status, conclusion, identity) => ({
  headSha: sha(digit),
  status,
  conclusion,
  url: `https://ci.invalid/${digit}`,
  createdAt: "2026-11-01T00:00:00Z",
  ...identity,
});

test("a judged result and a running result's completed ancestor name their run's id and attempt", () => {
  const judgment = judgeNearest(commits, [
    run("2", "in_progress", null, { databaseId: 22, attempt: 1 }),
    run("1", "completed", "failure", { databaseId: 11, attempt: 2 }),
  ]);
  assert.equal(judgment.state, "running");
  assert.equal(judgment.runId, 22);
  assert.equal(judgment.runAttempt, 1);
  assert.equal(judgment.revision, sha("2"));
  assert.deepEqual(judgment.completedAncestor, {
    revision: sha("1"),
    subject: "Done",
    state: "failed",
    runUrl: "https://ci.invalid/1",
    runId: 11,
    runAttempt: 2,
  });
});

test("a result whose run names no id and attempt names no run", () => {
  const judgment = judgeNearest(commits.slice(1), [
    run("1", "completed", "success", { databaseId: 11 }),
  ]);
  assert.equal(judgment.state, "pass");
  assert.equal("runId" in judgment, false);
  assert.equal("runAttempt" in judgment, false);
});

const summaryText = '{"schemaVersion":1}\n';

const route = "repos/o/r/actions/artifacts/9/zip";
const answerOf = (contentType, body, bodyEncoding) => ({
  status: 200,
  headers: new Map([["content-type", contentType]]),
  body,
  ...(bodyEncoding && { bodyEncoding }),
  failure: undefined,
  askedAt: "2026-11-04T00:00:00Z",
});
const unreadableOf = (answer) => {
  try {
    archiveBytes(route, answer);
  } catch (error) {
    return unreadableBy(error);
  }
  assert.fail("the answer was read as an archive");
};

test("an archive passed on as base64 keeps its bytes", () => {
  const bytes = zipOf("ci-proof-summary.json", summaryText);
  assert.deepEqual(
    archiveBytes(
      route,
      answerOf("application/zip", bytes.toString("base64"), "base64"),
    ),
    bytes,
  );
});

test("an archive the local GitHub request owner passed on as text is unreadable, saying what restarts the owner", () => {
  const proof = unreadableOf(answerOf("application/zip", "PK\u0003\u0004"));
  assert.deepEqual(proof, {
    kind: "unavailable",
    reason: "unreadable",
    detail: olderRequestOwnerDetail,
  });
  assert.equal(
    unavailableLine(proof),
    "This run's CI proof summary could not be read. This machine's local GitHub request owner was started by an earlier Open Dough and passes the summary on as text. Restart the Open Dough dashboards and CI observers on this machine; the next read starts a current one.",
  );
});

test("an answer GitHub does not label as an archive is unreadable as GitHub's", () => {
  assert.deepEqual(unreadableOf(answerOf("text/html", "<html></html>")), {
    kind: "unavailable",
    reason: "unreadable",
    detail: `GitHub request ${route} failed: GitHub's answer is not an archive`,
  });
});
