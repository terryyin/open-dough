import { run } from "./watch-ci-test-fixtures.mjs";

// Controlled GitHub provider responses only: these never inject the expected
// CI_FAILURE, coverage transition, or host delivery directly. They drive the
// real createGitHubRunAcquisition/createGitHubFailureAcquisition/
// observeRevisionCoverage functions through watchCiExecution's own `gh` seam,
// the same seam watch-ci-execution-coverage.test.mjs and
// watch-ci-execution-startup.test.mjs already use for "GitHub acquisition",
// and reuse that seam's shared `run()` response shape rather than a parallel
// one.

// An ignored-only descendant's applicable ancestor A is not itself
// registered in this mailbox (ordinary branch history the worker discovers,
// same premise as ci-revision-coverage-not-required.test.mjs's
// ignoredOnlyGithub) and starts pending before later failing, so the worker
// must keep following A's real attempt across polls — discovered only
// through the bounded-history candidate search, distinguished from the
// ordinary per-poll listing the same way ignoredOnlyGithub tells them apart
// (limit 100 with no `--created` vs. the ordinary short-window listing) —
// rather than waiting for a descendant run that never exists.
export function lateFailureWithIgnoredOnlyDescendantsGithub({
  branch,
  shaA,
  databaseIdA,
}) {
  let regularCalls = 0;
  let historyCalls = 0;
  let stage = "pending";
  const gh = async (args) => {
    if (args[0] === "run" && args[1] === "list") {
      const limit = Number(args[args.indexOf("--limit") + 1]);
      const hasCreated = args.includes("--created");
      if (limit === 100 && !hasCreated) {
        historyCalls += 1;
        return [
          run({
            headSha: shaA,
            headBranch: branch,
            databaseId: databaseIdA,
            workflowName: "CI",
            event: "push",
            status: stage === "pending" ? "in_progress" : "completed",
            conclusion: stage === "pending" ? null : "failure",
            url: `https://github.com/owner/project/actions/runs/${databaseIdA}`,
          }),
        ];
      }
      // Ordinary poll: never discovers A, B, C, or D directly — none of
      // these registered ignored-only descendants ever gets its own CI run
      // (that is the whole point), and A itself is deliberately absent from
      // the short-window listing, same as ignoredOnlyGithub.
      regularCalls += 1;
      return [];
    }
    if (args[0] === "run" && args[1] === "view" && args.at(-1) === "jobs")
      return {
        jobs: [
          {
            databaseId: databaseIdA * 10,
            name: "build",
            conclusion: stage === "pending" ? null : "failure",
          },
        ],
      };
    throw new Error(`unexpected gh call ${JSON.stringify(args)}`);
  };
  return {
    gh,
    regularCallCount: () => regularCalls,
    historyCallCount: () => historyCalls,
    failNow: () => {
      stage = "failed";
    },
  };
}
