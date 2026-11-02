// What the story CI status journeys (./intent-ci-status-story.spec.ts,
// ./intent-ci-status-story-gaps.spec.ts) publish: the board of
// ./intentCiStoryBoard.ts and, beside it, the CI the judgment reads: each
// published branch's history by name (any other name is not published,
// GitHub's `404`), the selected check's workflow, and its push runs per
// branch. A history can be held to answer late.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { ciPanel } from "./intentCiStatusPage.ts";
import {
  failing,
  planningOnly,
  running,
  storyBoardFiles,
} from "./intentCiStoryBoard.ts";
import { expectIntentModeChosen } from "./intentPerspectivePage.ts";
import { notFoundAnswer, type OriginAnswer } from "./originAnswers.ts";
import { publishMovingFiles, type MovingFiles } from "./publishedFiles.ts";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
  headCommitListAnswer,
  type CiAnswerer,
  type CiRunAnswer,
} from "./support/baseCiActions.ts";
import type { GhCall } from "./support/fakeGitHub.ts";

export const repository = "terryyin/open-dough";
export const revision = "e1".repeat(20);
const sha = (prefix: string) => prefix.padEnd(40, "0");

export const trunkHead = sha("e1e1e1e");
export const login = sha("4774f60");
export const signup = sha("d4e5f6a");
export const broken = sha("fa11ed0");
const planned = sha("91a0001");
const plannedAgain = sha("91a0002");
export const started = sha("70a0001");

export const mainRun = "https://ci.invalid/runs/main-login";
export const failedRun = "https://ci.invalid/runs/example-failed";
export const runningRun = "https://ci.invalid/runs/running";

type Commit = {
  readonly sha: string;
  readonly message: string;
  readonly parents: readonly string[];
};
const trunkHistory: readonly Commit[] = [
  { sha: trunkHead, message: "Plan the next story", parents: [login] },
  { sha: login, message: "Add login", parents: [signup] },
  { sha: signup, message: "Add signup", parents: [] },
];
// Each published branch's history, newest first.
const histories: Readonly<Record<string, readonly Commit[]>> = {
  main: trunkHistory,
  [failing.branch]: [
    { sha: broken, message: "Break the login", parents: [login] },
    ...trunkHistory.slice(1),
  ],
  [planningOnly.branch]: [
    { sha: plannedAgain, message: "Plan slice 2", parents: [planned] },
    { sha: planned, message: "Plan the story", parents: [login] },
    ...trunkHistory.slice(1),
  ],
  [running.branch]: [
    { sha: started, message: "Start the story", parents: [signup] },
    ...trunkHistory.slice(2),
  ],
};

export type StoryCi = {
  readonly published: MovingFiles;
  // Push runs per branch, as listed now.
  readonly runs: Record<string, readonly CiRunAnswer[]>;
  // Holds `branch`'s history listing until the returned release; `served`
  // says whether the held answer has since been given.
  hold(branch: string): { release: () => void; served: () => boolean };
};

// The board published for Open Dough with its CI served.
export function publishStoryCi(page: Page): StoryCi {
  const published = publishMovingFiles(page, {
    repository,
    revision,
    files: storyBoardFiles,
    branches: Object.fromEntries(
      [failing, planningOnly, running].map(({ branch }) => [
        branch,
        { revision: histories[branch]?.[0]?.sha ?? "", files: storyBoardFiles },
      ]),
    ),
  });
  const runs: Record<string, readonly CiRunAnswer[]> = {
    main: [
      { headSha: login, conclusion: "success", url: mainRun },
      { headSha: signup, conclusion: "success", url: mainRun },
    ],
    [failing.branch]: [
      { headSha: broken, conclusion: "failure", url: failedRun },
    ],
    [running.branch]: [
      { headSha: started, status: "in_progress", url: runningRun },
    ],
  };
  const held = new Map<string, Promise<void>>();
  const historyOf = async (branch: string): Promise<OriginAnswer> => {
    await held.get(branch);
    const history = histories[branch];
    return history === undefined
      ? notFoundAnswer()
      : headCommitListAnswer(history);
  };
  const answer: CiAnswerer = ({ request }) => {
    if (request.kind === "actions-workflow") return actionsWorkflowAnswer();
    if (request.kind === "actions-runs")
      return actionsRunsAnswer(runs[request.branch] ?? [], request.branch);
    return request.kind === "commit-list"
      ? historyOf(request.revision)
      : undefined;
  };
  published.serveCi(answer);
  return {
    published,
    runs,
    hold(branch) {
      let release: () => void = () => undefined;
      let served = false;
      held.set(
        branch,
        new Promise<void>((resolve) => {
          release = resolve;
        }).then(() => {
          served = true;
          held.delete(branch);
        }),
      );
      return { release, served: () => served };
    },
  };
}

// The judgment's GitHub calls among `calls`, each named by the branch asked:
// a history by name, a runs listing by its branch, and the workflow lookup.
export function branchJudgmentCalls(calls: readonly GhCall[]): string[] {
  return calls
    .flatMap(({ request }) => {
      if (request.kind === "actions-workflow") return [request.kind];
      if (request.kind === "actions-runs")
        return [`actions-runs ${request.branch}`];
      return request.kind === "commit-list" &&
        request.path === "" &&
        !/^[0-9a-f]{40}$/.test(request.revision)
        ? [`commit-list ${request.revision}`]
        : [];
    })
    .sort();
}

// The board's card of `title`, Taken, queued, or Recently done.
export function card(page: Page, title: string): Locator {
  return parts(page).board.getByRole("article", { name: title, exact: true });
}

// Toggles the selection of `title`'s card on Development by its empty area,
// then returns to Intent, where CI status is still chosen.
export async function toggleOnDevelopment(
  page: Page,
  title: string,
): Promise<Locator> {
  const { development, intentChoice, intent } = parts(page);
  await development.click();
  await card(page, title).locator("h3").first().click();
  await intentChoice.click();
  await expectIntentModeChosen(intent, "CI status");
  return ciPanel(intent);
}

export async function expectNamed(panel: Locator, branch: string) {
  await expect(
    panel.getByRole("heading", { name: `CI status of ${branch}`, exact: true }),
  ).toBeVisible();
}
