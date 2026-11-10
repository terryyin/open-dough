import assert from "node:assert/strict";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { apiJob, apiRun } from "./github-actions-api-test-fixtures.mjs";
import { readGitHubReuseFacts } from "./ci-reuse-github.mjs";
import { reusableValidation } from "./ci-reuse-policy.mjs";

export const sha = "a".repeat(40);
export const policy = {
  repo: "owner/project",
  workflow: "ci.yml",
  unit: "covered",
  configuration: "checks-v1",
  context: "inputs-v1",
  targetRef: "main",
  refs: ["exec/story"],
  events: ["push"],
  maxAgeMs: 60000,
};
export const time = (seconds) =>
  `2026-10-14T01:00:${String(seconds).padStart(2, "0")}.000Z`;

// API source run from observed facts. Timing overlays stay API-shaped so
// incidental MakeMe `createdAt` can stay absent while attempt times are stated.
export const sourceRun = (observed, timing = {}) => ({
  ...apiRun(
    makeMe.aCiRun
      .with({
        createdAt: undefined,
        ...observed,
      })
      .please(),
  ),
  ...(timing.startedAt === undefined
    ? {}
    : { run_started_at: timing.startedAt }),
  ...(timing.completedAt === undefined
    ? {}
    : { updated_at: timing.completedAt }),
});

// Qualifying exact-revision source run as the Actions API answers it.
// Call sites state observed facts; `apiRun` owns transport names and ownership.
export const run = (overrides = {}) =>
  apiRun(
    makeMe.aCiRun
      .with({
        databaseId: "opaque-z",
        attempt: 1,
        headSha: sha,
        headBranch: "exec/story",
        event: "push",
        status: "completed",
        conclusion: "success",
        url: "https://github.test/source",
        createdAt: time(0),
        startedAt: time(10),
        completedAt: time(15),
        workflowId: 7,
        headRepository: { full_name: policy.repo },
        ...overrides,
      })
      .please(),
  );

// Covered attempt job as the Actions API answers it.
export const coveredJob = (overrides = {}) =>
  apiJob(
    makeMe.aGitHubJob
      .withFacts({
        databaseId: 9,
        name: policy.unit,
        status: "completed",
        conclusion: "success",
        completed_at: time(15),
        ...overrides,
      })
      .please(),
  );

export async function observe({
  runs = [run()],
  jobs,
  output,
  mutate,
  total = runs.length,
  thrown = false,
} = {}) {
  const routes = [];
  const gh = async ([, route]) => {
    routes.push(route);
    if (thrown) throw Error("unreadable");
    if (route.endsWith("workflows/ci.yml")) return { id: 7 };
    if (route.includes("/runs?")) {
      const query = new URLSearchParams(route.split("?")[1]);
      assert.equal(query.get("head_sha"), sha);
      assert.equal(query.has("status"), false);
      assert.equal(query.has("branch"), false);
      const page = Number(query.get("page"));
      return {
        total_count: total,
        workflow_runs: runs.slice((page - 1) * 100, page * 100),
      };
    }
    const item = runs.find((r) => route.includes(`/runs/${r.id}`));
    if (route.includes("/jobs?"))
      return (
        jobs ?? {
          total_count: 1,
          jobs: [coveredJob()],
        }
      );
    return mutate ? mutate(item, route, routes) : item;
  };
  const log = async () =>
    output ??
    `${time(15)} DOUGH_CI_DIRECT ${JSON.stringify({ sha, unit: policy.unit, configuration: policy.configuration, context: policy.context })}\n`;
  const query = await readGitHubReuseFacts({
    sha,
    policy,
    currentRunId: "target-opaque",
    freshOverride: false,
    gh,
    log,
  });
  return {
    query,
    decision: reusableValidation({
      sha,
      targetRef: "main",
      policy,
      query,
      now: Date.parse(time(20)),
    }),
    routes,
  };
}
