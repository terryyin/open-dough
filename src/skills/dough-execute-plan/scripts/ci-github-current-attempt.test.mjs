// The GitHub default's current-attempt read for integrated-state evidence,
// through `createGitHubAcquisition` and an instrumented `gh`: the check is the
// selected workflow, the context the triggering event, required jobs come
// from the current attempt, and a rerun starting while they are read marks
// the facts contradicted.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  apiCall,
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";
import { createGitHubAcquisition } from "./ci-runs.mjs";

const sha = "c".repeat(40);
const url = "https://github.test/owner/repo/actions/runs/9001";

const githubRun = (overrides = {}) => ({
  id: 9001,
  run_attempt: 1,
  head_sha: sha,
  head_branch: "main",
  event: "push",
  workflow_id: 7001,
  status: "completed",
  conclusion: "success",
  html_url: url,
  ...overrides,
});
const job = {
  id: 90011,
  name: "covered",
  status: "completed",
  conclusion: "success",
  html_url: `${url}/job/90011`,
};
// The listed run as the observer's candidate lookup reports it.
const listed = {
  databaseId: 9001,
  attempt: 1,
  headSha: sha,
  headBranch: "main",
};

function readerOver(t, run, answers = {}) {
  const github = instrumentedGithubFixture(t, {
    runs: [run],
    attempts: {},
    attemptJobs: { "9001/1": [job], "9001/2": [] },
    answers,
  });
  github.enter();
  const { readCurrentAttempt } = createGitHubAcquisition({
    repo: "owner/repo",
    branch: "main",
    startedAt: Date.now(),
  });
  return { github, readCurrentAttempt };
}

const currentFacts = {
  databaseId: 9001,
  attempt: 1,
  headSha: sha,
  headBranch: "main",
  event: "push",
  status: "completed",
  conclusion: "success",
  url,
  workflowId: 7001,
  check: "ci.yml",
  context: "push",
};

test("the selected workflow's run is the declared check, its event the context, and its current attempt's jobs are read", async (t) => {
  const { github, readCurrentAttempt } = readerOver(t, githubRun());
  assert.deepEqual(await readCurrentAttempt(listed, { jobs: ["covered"] }), {
    ...currentFacts,
    jobs: [
      {
        name: "covered",
        status: "completed",
        conclusion: "success",
        databaseId: 90011,
        url: `${url}/job/90011`,
      },
    ],
  });
  assert.deepEqual(github.asked(), [
    apiCall("workflows/ci.yml"),
    apiCall("runs/9001"),
    apiCall("runs/9001/attempts/1/jobs?per_page=100&page=1"),
    apiCall("runs/9001"),
  ]);
});

test("another workflow's run names no check, a dispatched run its event, and no declared jobs reads none", async (t) => {
  const { github, readCurrentAttempt } = readerOver(
    t,
    githubRun({ workflow_id: 7002, event: "workflow_dispatch" }),
  );
  assert.deepEqual(await readCurrentAttempt(listed), {
    ...currentFacts,
    workflowId: 7002,
    event: "workflow_dispatch",
    check: undefined,
    context: "workflow_dispatch",
  });
  assert.deepEqual(github.asked(), [
    apiCall("workflows/ci.yml"),
    apiCall("runs/9001"),
  ]);
});

test("a rerun starting while the current attempt's jobs are read contradicts that read", async (t) => {
  const jobs = "runs/9001/attempts/1/jobs";
  const { github, readCurrentAttempt } = readerOver(t, githubRun(), {
    [jobs]: {
      head: "HTTP/2.0 200 OK",
      body: JSON.stringify({ total_count: 1, jobs: [job] }),
      holdLogs: true,
    },
  });
  const reading = readCurrentAttempt(listed, { jobs: ["covered"] });
  await until(
    () => github.asked().includes(apiCall(`${jobs}?per_page=100&page=1`)),
    "the current attempt's jobs read in flight",
  );
  github.set({
    runs: [
      githubRun({ run_attempt: 2, status: "in_progress", conclusion: null }),
    ],
    attempts: {},
    attemptJobs: {},
    answers: {
      [jobs]: {
        head: "HTTP/2.0 200 OK",
        body: JSON.stringify({ total_count: 1, jobs: [job] }),
        holdLogs: true,
      },
    },
  });
  github.releaseLogs();
  const facts = await reading;
  assert.equal(facts.contradicted, true);
  assert.deepEqual(
    [facts.attempt, facts.status, facts.conclusion],
    [1, "completed", "success"],
  );
});
