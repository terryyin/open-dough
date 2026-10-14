// GitHub-shaped provider facts for the integrated-state journey, answered by
// an instrumented `gh`: runs listed newest first, each completed attempt with
// its one `covered` job. Conclusions come only from actually executed covered
// commands; they never carry a completion verdict.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";
import { workerPollingEnvironment } from "./ci-worker-poll-test-fixtures.mjs";

const runUrl = (id) => `https://github.test/owner/repo/actions/runs/${id}`;

// A GitHub run listing entry for one attempt, as the API reports it.
function githubRun(id, sha, overrides) {
  return {
    id,
    run_attempt: 1,
    head_sha: sha,
    head_branch: "main",
    event: "push",
    workflow_id: 7001,
    html_url: runUrl(id),
    ...overrides,
  };
}

export function integratedStateGithub(t) {
  const github = instrumentedGithubFixture(t, { runs: [], attempts: {} });
  const runs = new Map();
  const attemptJobs = {};
  let answers = {};
  const publishState = () =>
    github.set({
      // Newest first, as GitHub lists runs.
      runs: [...runs.values()].reverse(),
      attempts: {},
      attemptJobs,
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
    runs.set(
      runId,
      githubRun(runId, sha, {
        run_attempt: attempt,
        status: state === "cancelled" ? "completed" : state,
        conclusion,
        created_at:
          runs.get(runId)?.created_at ??
          `2026-10-14T12:${String(minute++).padStart(2, "0")}:00Z`,
      }),
    );
    if (state === "completed")
      attemptJobs[`${runId}/${attempt}`] = [
        {
          id: runId * 10 + attempt,
          name: "covered",
          status: "completed",
          conclusion,
          html_url: `${runUrl(runId)}/job/${runId * 10 + attempt}`,
        },
      ];
    publishState();
    return runId;
  }

  return {
    ...github,
    recordRun,
    // The listed runs as the observer's GitHub reader reports them.
    observedRuns: () =>
      [...runs.values()].reverse().map((run) => ({
        databaseId: run.id,
        attempt: run.run_attempt,
        headSha: run.head_sha,
        headBranch: run.head_branch,
        event: run.event,
        status: run.status,
        conclusion: run.conclusion,
        createdAt: run.created_at,
      })),
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
