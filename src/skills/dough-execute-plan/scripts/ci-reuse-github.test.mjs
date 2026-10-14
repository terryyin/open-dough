import assert from "node:assert/strict";
import { test } from "node:test";
import { readGitHubReuseFacts } from "./ci-reuse-github.mjs";
import { reusableValidation } from "./ci-reuse-policy.mjs";

import {
  sha,
  policy,
  time,
  run,
  observe,
} from "./ci-reuse-github-test-fixtures.mjs";

test("GitHub exact-SHA direct job output establishes inspectable current proof", async () => {
  const { query, decision, routes } = await observe();
  assert.equal(query.complete, true);
  assert.equal(decision.reuse, true);
  assert.equal(decision.source.runId, "opaque-z");
  assert.equal(
    routes.filter((route) => route.endsWith("/runs/opaque-z")).length,
    2,
  );
});

test("unreadable, bounded partial, capped or changing answers choose fresh", async () => {
  for (const options of [
    { thrown: true },
    { total: 101 },
    { total: 1000 },
    { jobs: { total_count: 2, jobs: [] } },
    {
      mutate: (r, route, routes) =>
        route.endsWith(`/runs/${r.id}`) &&
        routes.filter((q) => q === route).length > 1
          ? { ...r, run_attempt: 2 }
          : r,
    },
    { runs: [run({ head_repository: { full_name: "fork/project" } })] },
    { runs: [run({ head_sha: "b".repeat(40) })] },
  ])
    assert.equal((await observe(options)).decision.reuse, false);
});

test("green workflows, skipped jobs, echoed commands, duplicate markers and wrong context are insufficient", async () => {
  const proof = JSON.stringify({
    sha,
    unit: policy.unit,
    configuration: policy.configuration,
    context: policy.context,
  });
  for (const options of [
    {
      jobs: {
        total_count: 1,
        jobs: [
          { name: policy.unit, status: "completed", conclusion: "skipped" },
        ],
      },
    },
    { output: `echo 'DOUGH_CI_DIRECT ${proof}'\n` },
    { output: `${time(15)} echo 'DOUGH_CI_DIRECT ${proof}'\n` },
    { output: `DOUGH_CI_DIRECT ${proof}\nDOUGH_CI_DIRECT ${proof}\n` },
    { output: `DOUGH_CI_DIRECT ${proof.replace("inputs-v1", "different")}\n` },
    { output: "DOUGH_CI_DIRECT {broken}\n" },
    { output: "" },
  ])
    assert.equal((await observe(options)).decision.reuse, false);
});

test("an older run's pending rerun is current and newer; its later successful retry can qualify", async () => {
  const first = run();
  const rerun = run({
    id: "opaque-a",
    run_attempt: 2,
    run_started_at: time(18),
    status: "in_progress",
    conclusion: null,
    created_at: time(0),
  });
  assert.equal((await observe({ runs: [first, rerun] })).decision.reuse, false);
  const success = {
    ...rerun,
    run_attempt: 3,
    run_started_at: time(19),
    status: "completed",
    conclusion: "success",
  };
  const { decision } = await observe({ runs: [first, success] });
  assert.equal(decision.reuse, true);
  assert.equal(decision.source.runId, "opaque-a");
  assert.equal(decision.source.attemptId, "3");
  assert.equal(
    (await observe({ runs: [first, run({ id: "tie" })] })).decision.reason,
    "ambiguous-order",
  );
});

test("an aborted overall acquisition remains incomplete and chooses fresh", async () => {
  const controller = new AbortController();
  const query = await readGitHubReuseFacts(
    {
      sha,
      policy,
      currentRunId: "target",
      freshOverride: false,
      gh: async (...[, signal]) => {
        controller.abort(Error("overall acquisition deadline"));
        signal.throwIfAborted();
      },
    },
    controller.signal,
  );
  assert.equal(query.complete, false);
  assert.equal(
    reusableValidation({ sha, targetRef: "main", policy, query }).reuse,
    false,
  );
});

test("bounded listing exhaustion cannot certify complete relevant evidence", async () => {
  const runs = Array.from({ length: 301 }, (...[, index]) =>
    run({ id: `opaque-${index}` }),
  );
  const { query, routes } = await observe({ runs });
  assert.equal(query.complete, false);
  assert.equal(routes.filter((route) => route.includes("/runs?")).length, 3);
  assert.equal(
    routes.some((route) => route.includes("/attempts/")),
    false,
  );
});
