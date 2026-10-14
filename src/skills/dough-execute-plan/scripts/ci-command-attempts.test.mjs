import assert from "node:assert/strict";
import { test } from "node:test";
import {
  currentCommandAttempt,
  latestCommandAttempts,
  targetCommandAttempts,
} from "./ci-command-attempts.mjs";

const [b, c] = ["b", "c"].map((digit) => digit.repeat(40));
const attempt = (overrides) => ({
  runId: "run",
  attemptId: "1",
  sha: c,
  outcome: "success",
  ...overrides,
});

test("a provider branch is kept, another target's attempt is dropped, and a legacy attempt stays unattested", () => {
  const runs = targetCommandAttempts(
    [
      attempt({ runId: "main", branch: "main", check: "ci", context: "push" }),
      attempt({ runId: "feature", branch: "feature/other" }),
      attempt({ runId: "legacy" }),
    ],
    "main",
  );
  assert.deepEqual(
    runs.map(({ databaseId, headBranch, providerBranch }) => ({
      databaseId,
      headBranch,
      providerBranch,
    })),
    [
      { databaseId: "main", headBranch: "main", providerBranch: "main" },
      { databaseId: "legacy", headBranch: "main", providerBranch: undefined },
    ],
  );
  assert.deepEqual(Object.keys(runs[1]).sort(), [
    "attempt",
    "conclusion",
    "databaseId",
    "headBranch",
    "headSha",
    "status",
  ]);
  assert.equal(currentCommandAttempt(runs, runs[1]).headBranch, undefined);
  for (const field of ["branch", "check", "context"])
    assert.throws(
      () => targetCommandAttempts([attempt({ [field]: "" })], "main"),
      /invalid attempt/,
    );
});

test("a later attempt of another check never supersedes the required check", () => {
  const runs = targetCommandAttempts(
    [
      attempt({ runId: "lint", check: "lint", time: "2026-10-14T12:02:00Z" }),
      attempt({ runId: "ci", check: "ci", time: "2026-10-14T12:01:00Z" }),
      attempt({ runId: "old", check: "ci", time: "2026-10-14T12:00:00Z" }),
    ],
    "main",
  );
  assert.deepEqual(
    latestCommandAttempts(runs).map(({ databaseId }) => databaseId),
    ["lint", "ci"],
  );
  assert.equal(currentCommandAttempt(runs, runs[1]).contradicted, undefined);
  assert.equal(currentCommandAttempt(runs, runs[2]).contradicted, true);
});

test("an equal or missing time never resolves a check's current attempt to an older green", () => {
  const facts = (attempts) => {
    const runs = targetCommandAttempts(attempts, "main");
    return runs.map((run) => currentCommandAttempt(runs, run).contradicted);
  };
  const at = (minute) => `2026-10-14T12:0${minute}:00Z`;
  // Provider order alone, newest first.
  assert.deepEqual(
    facts([
      attempt({ runId: "new", outcome: "pending" }),
      attempt({ runId: "old" }),
    ]),
    [undefined, true],
  );
  // Equal times: neither is current.
  assert.deepEqual(
    facts([
      attempt({ runId: "green", time: at(1) }),
      attempt({ runId: "rerun", outcome: "pending", time: at(1) }),
    ]),
    [true, true],
  );
  // The first listed lacks a time another attempt has.
  assert.deepEqual(
    facts([
      attempt({ runId: "green" }),
      attempt({ runId: "rerun", outcome: "failure", time: at(1) }),
    ]),
    [true, true],
  );
  // Times contradicting provider order.
  assert.deepEqual(
    facts([
      attempt({ runId: "green", time: at(1) }),
      attempt({ runId: "rerun", outcome: "failure", time: at(2) }),
    ]),
    [true, true],
  );
  // Another snapshot's attempt is no rival.
  assert.deepEqual(
    facts([
      attempt({ runId: "b", sha: b, time: at(2) }),
      attempt({ time: at(1) }),
    ]),
    [undefined, undefined],
  );
});
