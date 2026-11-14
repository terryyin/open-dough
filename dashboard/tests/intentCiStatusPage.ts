// Intent's CI status homepage journeys (../../e2e/intent/intent-ci-status.spec.ts,
// ../../e2e/intent/intent-ci-status-reads.spec.ts, ./intent/intent-ci-status-homepage.spec.ts): a
// published project whose trunk the launch's base-CI rule judges
// (../server/baseCiJudgment.ts) from served CI answers, the homepage region
// in Intent's empty-selection reading, and the judgment's observed GitHub
// calls.

import { expect } from "./dashboardTest.ts";
import { type CatalogPublication } from "./catalogProjectRecords.ts";
import {
  intentModeTab,
  projectIntentFrame,
  storyTab,
} from "./intentModePage.ts";
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
  project: CatalogPublication,
  extra: Readonly<Record<string, string>> = {},
) {
  return publishMovingFiles(page, {
    repository: project.repository,
    ref: project.ref,
    revision: project.revision,
    files: { ...project.files, ...extra },
  });
}

// CI status as Intent's homepage region (empty selection / beside location
// explanations).
export function ciPanel(intent: Locator) {
  return intent.getByRole("region", { name: "CI status", exact: true });
}

// The answer, freshness and outstanding read currently visible in a CI region.
export function ciStatusReading(panel: Locator) {
  return {
    state: panel.locator(".intent-ci-state"),
    freshness: panel.getByRole("status"),
    checkedTime: panel.locator("time"),
    checking: panel.locator(".intent-ci-checking"),
    gap: panel.locator(".intent-ci-gap"),
  };
}

export async function expectCiAnswer(
  panel: Locator,
  state: string,
  message?: string,
) {
  await expect(ciStatusReading(panel).state, message).toHaveText(state);
}

export async function expectCiScope(panel: Locator, scope: string) {
  await expect(
    panel.getByRole("heading", { name: `CI status of ${scope}`, exact: true }),
  ).toBeVisible();
}

// Expected retained facts stay in the scenario; this performs no read or release.
export async function expectKeptCiAnswer(
  panel: Locator,
  answer: {
    readonly state: string;
    readonly freshness: string;
    readonly checking: string | true;
    readonly checkedAt?: string;
  },
) {
  const shown = ciStatusReading(panel);
  await expectCiAnswer(panel, answer.state);
  await expect(shown.freshness).toContainText(answer.freshness);
  if (answer.checkedAt !== undefined)
    await expect(shown.checkedTime).toHaveAttribute(
      "datetime",
      answer.checkedAt,
    );
  if (answer.checking === true) await expect(shown.checking).toBeVisible();
  else await expect(shown.checking).toContainText(answer.checking);
}

// The tab showing the CI status Intent reads: Project Intent's CI status
// while it shows, else the selected story's CI comparison view.
async function ciTab(intent: Locator) {
  const project = intentModeTab(intent, "CI status");
  return (await projectIntentFrame(intent).count()) > 0
    ? project
    : storyTab(intent, "CI comparison");
}

// Show the CI status Intent reads: with a selected story its CI comparison
// view, else Project Intent's CI status, so the empty-selection homepage (or
// explanation+status) shows; returns that region.
export async function chooseCiStatus(intent: Locator) {
  const tab = await ciTab(intent);
  if ((await tab.getAttribute("aria-selected")) !== "true") {
    await tab.click();
  }
  await expect(tab).toHaveAttribute("aria-selected", "true");
  const panel = ciPanel(intent);
  await expect(panel).toBeVisible();
  return panel;
}

// Return home by directly activating the CI tab, even while it is chosen: by
// click, or by Enter or Space with it focused. In Project Intent the browsing
// selection clears; with a selected story its CI comparison shows, its
// Changed tests reading kept. CI status shows; returns that region.
export async function activateIntentHome(
  intent: Locator,
  how: "click" | "Enter" | "Space" = "click",
) {
  const tab = await ciTab(intent);
  if (how === "click") {
    await tab.click();
  } else {
    await tab.focus();
    await tab.press(how);
  }
  // Already chosen, so the homepage check below never clicks for us.
  await expect(tab).toHaveAttribute("aria-selected", "true");
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
  await expect(ciStatusReading(panel).freshness).toContainText("Checked at");
  await expect(ciStatusReading(panel).checkedTime).toHaveAttribute(
    "datetime",
    /^\d{4}-\d\d-\d\dT/,
  );
}
