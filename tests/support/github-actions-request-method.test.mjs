import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRequest } from "../../dashboard/tests/support/ghRequest.ts";

test("the synthetic GitHub recognizes a full workflow repeat only with its POST method and exact run route", () => {
  const route = "repos/owner/repo/actions/runs/71/rerun";
  assert.deepEqual(
    parseRequest(["api", "--include", "--method", "POST", route]),
    {
      kind: "actions-workflow-rerun",
      repository: "owner/repo",
      runId: 71,
      method: "POST",
    },
  );
  for (const argv of [
    ["api", route],
    ["api", "--method", "DELETE", route],
    [
      "api",
      "--method",
      "POST",
      "repos/owner/repo/actions/runs/71/rerun-failed-jobs",
    ],
    [
      "api",
      "--method",
      "POST",
      "repos/owner/repo/actions/workflows/ci.yml/dispatches",
    ],
    ["api", "--method", "POST", "repos/owner/repo/actions/workflows/ci.yml"],
  ])
    assert.deepEqual(parseRequest(argv), { kind: "unknown" });
  assert.deepEqual(
    parseRequest(["api", "repos/owner/repo/actions/workflows/ci.yml"]),
    {
      kind: "actions-workflow",
      repository: "owner/repo",
      workflow: "ci.yml",
    },
  );
});
