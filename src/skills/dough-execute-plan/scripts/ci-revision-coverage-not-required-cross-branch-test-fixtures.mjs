import assert from "node:assert/strict";
import { githubApi } from "./github-actions-api-test-fixtures.mjs";

// Cross-branch ignored-only inheritance: the story-branch listing is empty
// while the ancestor ran only on another branch (typically main). The fake
// answers branch-scoped history and the all-branch listing separately so the
// case fails under today's branch-only discovery.
export function crossBranchHistoryGithub({
  storyBranch,
  storyBranchHistory = [],
  allBranchHistory,
  regularRuns = () => [],
}) {
  let regularCalls = 0;
  let storyHistoryCalls = 0;
  let allBranchHistoryCalls = 0;
  const gh = githubApi((request) => {
    if (request.kind === "runs") {
      if (request.limit === 100 && request.created === undefined) {
        if (request.branch === undefined) {
          allBranchHistoryCalls += 1;
          return typeof allBranchHistory === "function"
            ? allBranchHistory()
            : allBranchHistory;
        }
        assert.equal(request.branch, storyBranch);
        storyHistoryCalls += 1;
        return typeof storyBranchHistory === "function"
          ? storyBranchHistory()
          : storyBranchHistory;
      }
      regularCalls += 1;
      assert.equal(request.branch, storyBranch);
      return regularRuns();
    }
    if (request.kind === "jobs") return { jobs: [] };
    throw new Error(`unexpected gh call ${JSON.stringify(request)}`);
  });
  return {
    gh,
    regularCallCount: () => regularCalls,
    storyHistoryCallCount: () => storyHistoryCalls,
    allBranchHistoryCallCount: () => allBranchHistoryCalls,
  };
}
