// A published trunk's CI as the launch's base-CI rule judges it
// (../../server/baseCiJudgment.ts): its history, workflow and runs as served
// answers, and the judgment's observed GitHub calls. Page-free, for browser
// journeys (../intentCiStatusPage.ts) and Backend boundary specs alike.

import type { OriginAnswer } from "../originAnswers.ts";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
  headCommitListAnswer,
  type CiAnswerer,
  type CiRunAnswer,
} from "./baseCiActions.ts";
import type { GhCall } from "./fakeGitHub.ts";

export const judged = `a1b2c3d${"0".repeat(33)}`;
const docsCommit = `d0c5${"1".repeat(36)}`;
export const runUrl = "https://ci.invalid/runs/41";

// The trunk's history the judgment lists: the published head, a docs
// commit, then the judged "Add login" commit, newest first.
function trunkHistory(head: string) {
  return headCommitListAnswer([
    { sha: head, message: "Plan the next story", parents: [docsCommit] },
    { sha: docsCommit, message: "Update docs", parents: [judged] },
    { sha: judged, message: "Add login\n\nBody text", parents: [] },
  ]);
}

// CI answers for a published trunk: its history by name, the workflow, and
// the runs `runs()` lists now (or the answer it gives instead).
export function trunkCi(
  head: string,
  runs: () => readonly CiRunAnswer[] | OriginAnswer,
): CiAnswerer {
  return ({ request }) => {
    if (request.kind === "commit-list" && request.revision === "main")
      return trunkHistory(head);
    if (request.kind === "actions-workflow") return actionsWorkflowAnswer();
    if (request.kind === "actions-runs") {
      const listed = runs();
      return Array.isArray(listed)
        ? actionsRunsAnswer(listed as readonly CiRunAnswer[])
        : (listed as OriginAnswer);
    }
    return undefined;
  };
}

// The judgment's GitHub calls among those observed: Actions calls and the
// trunk's history listing by name.
export function judgmentCalls(calls: readonly GhCall[]): string[] {
  return calls
    .flatMap(({ request }) =>
      request.kind.startsWith("actions-")
        ? [request.kind]
        : request.kind === "commit-list" && request.revision === "main"
          ? [`commit-list ${request.revision}`]
          : [],
    )
    .sort();
}
