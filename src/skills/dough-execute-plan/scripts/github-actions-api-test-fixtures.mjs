// The observer's `gh` seam answering in-process as GitHub's Actions API does:
// what a `gh api` route asks, and GitHub's answer in its own field names from
// what a test says GitHub holds in the observed fields `run` names
// (`./watch-ci-test-fixtures.mjs`).
import assert from "node:assert/strict";

// What one `gh api` request asks of GitHub Actions, read from its route.
export function githubRequest(args) {
  assert.equal(args[0], "api", `not a gh api request: ${JSON.stringify(args)}`);
  assert.equal(args.length, 2);
  const { pathname, searchParams: query } = new URL(
    args[1],
    "https://api.github.test/",
  );
  const route = /^\/repos\/([^/]+\/[^/]+)\/actions\/(.+)$/.exec(pathname);
  assert.ok(route, `not a GitHub Actions route: ${args[1]}`);
  const [, repo, asked] = route;
  const page = query.has("page") ? Number(query.get("page")) : undefined;
  let found;
  if ((found = /^workflows\/([^/]+)$/.exec(asked)))
    return { kind: "workflow", repo, workflow: decodeURIComponent(found[1]) };
  if ((found = /^workflows\/([^/]+)\/runs$/.exec(asked)))
    return {
      kind: "runs",
      repo,
      workflowId: found[1],
      branch: query.get("branch") ?? undefined,
      commit: query.get("head_sha") ?? undefined,
      event: query.get("event") ?? undefined,
      created: query.get("created") ?? undefined,
      limit: Number(query.get("per_page")),
      page,
    };
  if ((found = /^runs\/(\d+)$/.exec(asked)))
    return { kind: "run", repo, runId: Number(found[1]) };
  if ((found = /^runs\/(\d+)\/attempts\/(\d+)$/.exec(asked)))
    return {
      kind: "attempt",
      repo,
      runId: Number(found[1]),
      attempt: Number(found[2]),
    };
  if ((found = /^runs\/(\d+)\/attempts\/(\d+)\/jobs$/.exec(asked)))
    return {
      kind: "jobs",
      repo,
      runId: Number(found[1]),
      attempt: Number(found[2]),
      limit: Number(query.get("per_page")),
      page,
    };
  if ((found = /^jobs\/(\d+)\/logs$/.exec(asked)))
    return { kind: "log", repo, jobId: Number(found[1]) };
  throw new Error(`unexpected GitHub Actions route ${args[1]}`);
}

const present = (fields) =>
  Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );

// A run as GitHub's API answers it, from the fields `run` names.
export const apiRun = (observed) =>
  present({
    id: observed.databaseId,
    run_attempt: observed.attempt,
    head_sha: observed.headSha,
    head_branch: observed.headBranch,
    event: observed.event,
    status: observed.status,
    conclusion: observed.conclusion,
    html_url: observed.url,
    created_at: observed.createdAt,
  });

export const apiJob = ({ databaseId, ...job }) =>
  present({ id: databaseId, ...job });

export const apiWorkflow = (file, name = "CI", id = 7001) => ({
  id,
  name,
  path: `.github/workflows/${file}`,
  state: "active",
});

// GitHub's API answer to `request`, from what a test says GitHub holds: runs
// for a listing, a run for a run, `{ status, conclusion }` for an attempt and
// `{ jobs }` for an attempt's jobs, in the fields `run` names.
export function apiAnswer(request, held) {
  if (request.kind === "runs")
    return { total_count: held.length, workflow_runs: held.map(apiRun) };
  if (request.kind === "run") return apiRun(held);
  if (request.kind === "jobs")
    return { total_count: held.jobs.length, jobs: held.jobs.map(apiJob) };
  return held;
}

// The observer's `gh` seam answering as GitHub's API does. The selected
// workflow resolves by itself, displayed as "CI"; every other request is
// answered by `holds(request, signal)`, called with what the route asks.
export const githubApi = (holds) => async (args, signal) => {
  const request = githubRequest(args);
  if (request.kind === "workflow") return apiWorkflow(request.workflow);
  return apiAnswer(request, await holds(request, signal));
};

// Answers each request after the workflow's resolution with the next scripted
// response; `calls` records every request asked, the resolution included.
export const scriptedGithub = (responses, calls = []) => {
  const github = githubApi(async () => {
    if (!responses.length) throw new Error("unexpected GitHub request");
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return response;
  });
  return async (args, signal) => {
    calls.push(githubRequest(args));
    return github(args, signal);
  };
};
