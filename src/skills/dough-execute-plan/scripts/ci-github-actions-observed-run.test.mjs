// observedRun carries the listed attempt's start and completion for CI wall
// time (Intent homepage), without changing ordering's createdAt.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createGitHubActions, observedRun } from "./ci-github-actions.mjs";
import { scriptedGithub } from "./github-actions-api-test-fixtures.mjs";

const sha = "a".repeat(40);

test("observedRun maps run_started_at and updated_at, and drops them when absent", () => {
  assert.deepEqual(
    observedRun(
      {
        id: 41,
        run_attempt: 1,
        head_sha: sha,
        head_branch: "main",
        event: "push",
        status: "completed",
        conclusion: "success",
        html_url: "https://ci.invalid/41",
        created_at: "2026-11-05T09:59:00Z",
        run_started_at: "2026-11-05T10:00:00Z",
        updated_at: "2026-11-05T10:03:00Z",
      },
      "CI",
    ),
    {
      databaseId: 41,
      attempt: 1,
      headSha: sha,
      headBranch: "main",
      workflowName: "CI",
      event: "push",
      status: "completed",
      conclusion: "success",
      url: "https://ci.invalid/41",
      createdAt: "2026-11-05T09:59:00Z",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:03:00Z",
    },
  );
  assert.equal(
    observedRun(
      {
        id: 42,
        run_attempt: 1,
        head_sha: sha,
        head_branch: "main",
        event: "push",
        status: "completed",
        conclusion: "success",
        html_url: "https://ci.invalid/42",
        created_at: "2026-11-05T10:00:00Z",
      },
      "CI",
    ).startedAt,
    undefined,
  );
});

test("listRuns carries start and completion from the Actions listing", async () => {
  const github = createGitHubActions({
    repo: "owner/repo",
    gh: scriptedGithub([
      [
        {
          databaseId: 41,
          attempt: 1,
          headSha: sha,
          headBranch: "main",
          event: "push",
          status: "completed",
          conclusion: "success",
          url: "https://ci.invalid/41",
          createdAt: "2026-11-05T09:59:00Z",
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:03:00Z",
        },
      ],
    ]),
  });
  const [run] = await github.listRuns(
    { branch: "main", limit: 1 },
    new AbortController().signal,
  );
  assert.equal(run.startedAt, "2026-11-05T10:00:00Z");
  assert.equal(run.completedAt, "2026-11-05T10:03:00Z");
  assert.equal(run.createdAt, "2026-11-05T09:59:00Z");
});
