// Intent's CI status homepage journeys (./intent-ci-status.spec.ts,
// ./intent-ci-status-reads.spec.ts, ./intent-ci-status-homepage.spec.ts): a
// published project whose trunk the launch's base-CI rule judges
// (../server/baseCiJudgment.ts) from served CI answers, the homepage region
// in Intent's empty-selection reading, and the judgment's observed GitHub
// calls.

import { expect } from "./dashboardTest.ts";
import { filesOf, type Project } from "./catalogProjectRecords.ts";
import { intentModeTab } from "./intentModePage.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
  headCommitListAnswer,
  type CiAnswerer,
  type CiRunAnswer,
} from "./support/baseCiActions.ts";
import type { Locator, Page } from "@playwright/test";
import type { GhCall } from "./support/fakeGitHub.ts";

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

export function publishProject(
  page: Page,
  project: Project,
  extra: Readonly<Record<string, string>> = {},
) {
  return publishMovingFiles(page, {
    repository: project.repository,
    ref: project.ref,
    revision: project.revision,
    files: { ...filesOf(project), ...extra },
  });
}

// CI status as Intent's homepage region (empty selection / beside location
// explanations).
export function ciPanel(intent: Locator) {
  return intent.getByRole("region", { name: "CI status", exact: true });
}

// Ensure Intent mode so the empty-selection homepage (or explanation+status)
// shows CI status; returns that region.
export async function chooseCiStatus(intent: Locator) {
  const tab = intentModeTab(intent, "Intent");
  if ((await tab.getAttribute("aria-selected")) !== "true") {
    await tab.click();
  }
  await expect(tab).toHaveAttribute("aria-selected", "true");
  const panel = ciPanel(intent);
  await expect(panel).toBeVisible();
  return panel;
}

export async function returnToCiStatus(intent: Locator) {
  await intent.getByRole("button", { name: "Return to CI status" }).click();
  return chooseCiStatus(intent);
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

export async function expectChecked(panel: Locator) {
  await expect(panel.getByRole("status")).toContainText("Checked at");
  await expect(panel.locator("time")).toHaveAttribute(
    "datetime",
    /^\d{4}-\d\d-\d\dT/,
  );
}
