// GitHub-shaped provider facts for the integrated-state journey, answered by
// an instrumented `gh`: runs listed newest first, each completed attempt with
// its one `covered` job. Conclusions come only from actually executed covered
// commands; they never carry a completion verdict.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { apiJob, apiRun } from "./github-actions-api-test-fixtures.mjs";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";
import { workerPollingEnvironment } from "./ci-worker-poll-test-fixtures.mjs";

const runUrl = (id) => `https://github.test/owner/repo/actions/runs/${id}`;

// Observed GitHub run facts for one attempt; encode with `apiRun` at publish.
function observedCiRun(id, sha, overrides = {}) {
  return makeMe.aCiRun
    .with({
      databaseId: id,
      attempt: 1,
      headSha: sha,
      headBranch: "main",
      event: "push",
      workflowId: 7001,
      url: runUrl(id),
      createdAt: undefined,
      ...overrides,
    })
    .please();
}

// Covered attempt job as observed facts; encode with `apiJob` at publish.
const coveredJob = (runId, attempt, status, conclusion) =>
  makeMe.aGitHubJob
    .withFacts({
      databaseId: runId * 10 + attempt,
      name: "covered",
      status,
      conclusion,
      url: `${runUrl(runId)}/job/${runId * 10 + attempt}`,
    })
    .please();

export function integratedStateGithub(t) {
  const github = instrumentedGithubFixture(t, { runs: [], attempts: {} });
  const runs = new Map();
  const attemptJobs = {};
  let answers = {};
  const publishState = () =>
    github.set({
      // Newest first, as GitHub lists runs. Encode observed facts at publish.
      runs: [...runs.values()].reverse().map(apiRun),
      attempts: {},
      attemptJobs: Object.fromEntries(
        Object.entries(attemptJobs).map(([key, jobs]) => [
          key,
          jobs.map(apiJob),
        ]),
      ),
      answers,
    });

  let nextRun = 9001;
  let minute = 0;
  // Provider facts for one run: `executed` is a covered command's actual
  // result; a waiting or replaced run executes nothing.
  function recordRun(sha, { state, executed, attempt = 1, id } = {}) {
    const runId = id ?? nextRun++;
    const conclusion =
      state === "completed"
        ? executed.success
          ? "success"
          : "failure"
        : state === "cancelled"
          ? "cancelled"
          : null;
    const status = state === "cancelled" ? "completed" : state;
    const createdAt =
      runs.get(runId)?.createdAt ??
      `2026-10-14T12:${String(minute++).padStart(2, "0")}:00Z`;
    runs.set(
      runId,
      observedCiRun(runId, sha, {
        attempt,
        status,
        conclusion,
        createdAt,
      }),
    );
    // A replaced run has no jobs; a running one has its job in progress.
    attemptJobs[`${runId}/${attempt}`] =
      state === "cancelled"
        ? []
        : [coveredJob(runId, attempt, status, conclusion)];
    publishState();
    return runId;
  }

  return {
    ...github,
    recordRun,
    // The listed runs as the observer's GitHub reader reports them.
    observedRuns: () =>
      [...runs.values()].reverse().map((run) =>
        makeMe.aCiRun
          .with({
            databaseId: run.databaseId,
            attempt: run.attempt,
            headSha: run.headSha,
            headBranch: run.headBranch,
            event: run.event,
            status: run.status,
            conclusion: run.conclusion,
            createdAt: run.createdAt,
            url: run.url,
          })
          .please(),
      ),
    // Answers `route` with `answer` instead of its recorded facts.
    answer(route, answer) {
      answers = { ...answers, [route]: answer };
      publishState();
    },
    // How many run listings the observer has asked GitHub for so far.
    listings: () =>
      github.asked().filter((call) => call.includes("/runs?")).length,
  };
}

// The integrated-state journey provider (see createIntegratedStateJourney)
// for the GitHub default: no command adapter, only the declared policy.
export async function githubProvider(t, fixture, declared) {
  writeFileSync(
    join(fixture.execution, ".planning/open-dough.json"),
    JSON.stringify(declared ? { integratedStateCompletion: declared } : {}),
  );
  const github = integratedStateGithub(t);
  return {
    env: workerPollingEnvironment({
      ...github.env,
      DOUGH_CI_MAILBOX_ROOT: fixture.storage,
    }),
    // Each poll lists runs twice: its own runs and the candidate lookup.
    polls: () => github.listings() / 2,
    holdRequests: github.holdRequests,
    releaseRequests: github.releaseRequests,
    members: {
      github,
      recordRun: github.recordRun,
      observedRuns: github.observedRuns,
      answer: github.answer,
      listings: github.listings,
    },
  };
}
