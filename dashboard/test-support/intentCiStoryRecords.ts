// What the story CI status journeys (../../e2e/intent/intent-ci-status-story.spec.ts,
// ../../e2e/intent/intent-ci-status-story-gaps.spec.ts) publish: the board of
// ./intentCiStoryBoard.ts and, beside it, the CI the judgment reads: each
// published branch's history by name (any other name is not published,
// GitHub's `404`), the selected check's workflow, and its push runs per
// branch. A history can be held to answer late, and a commit pushed to a
// branch moves its published head.

import type { Locator, Page, Request } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { parts } from "./dashboardPage.ts";
import {
  chooseCiStatus,
  expectCiScope,
  expectKeptCiAnswer,
} from "./intentCiStatusPage.ts";
import {
  failing,
  planningOnly,
  running,
  storyCiHistory,
} from "./intentCiStoryBoard.ts";
import { notFoundAnswer } from "./originAnswers.ts";
import { commitOf } from "./committedOriginRepo.ts";
import { publishCommittedFileHistory } from "./committedFiles.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
  targetHistoryAnswer,
  type CiAnswerer,
  type CiRunAnswer,
} from "./support/baseCiActions.ts";
import type { GhCall } from "./support/fakeGitHub.ts";

export const repository = "terryyin/open-dough";
export const mainRun = "https://ci.invalid/runs/main-login";
export const failedRun = "https://ci.invalid/runs/example-failed";
export const runningRun = "https://ci.invalid/runs/running";

// The board and its judgments read one published Git history.
export async function publishStoryCi(
  page: Page,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
  extra: Readonly<Record<string, string>> = {},
) {
  const branches = {
    [failing.branch]: "broken",
    [planningOnly.branch]: "plannedAgain",
    [running.branch]: "started",
  } as const;
  const published = await publishCommittedFileHistory(
    page,
    storyCiHistory(extra),
    {
      repository,
      trunk: "trunkHead",
      branches,
      afterGitHubStops,
    },
  );
  const { revisions, repoDir } = published;
  const { broken, login, signup, started } = revisions;
  const ciRun = (facts: Parameters<(typeof makeMe.aCiRun)["with"]>[0]) =>
    makeMe.aCiRun.with(facts).please();
  const runs: Record<string, readonly CiRunAnswer[]> = {
    main: [
      ciRun({ headSha: login, conclusion: "success", url: mainRun }),
      ciRun({ headSha: signup, conclusion: "success", url: mainRun }),
    ],
    [failing.branch]: [
      ciRun({ headSha: broken, conclusion: "failure", url: failedRun }),
    ],
    [running.branch]: [
      ciRun({ headSha: started, status: "in_progress", url: runningRun }),
    ],
  };
  const held = new Map<string, Promise<void>>();
  const historyOf = async (branch: string, perPage?: number) => {
    await held.get(branch);
    const tip = commitOf(repoDir, `refs/heads/${branch}`);
    return tip === undefined
      ? notFoundAnswer()
      : targetHistoryAnswer(repoDir, tip, perPage);
  };
  const answer: CiAnswerer = ({ request }) => {
    if (request.kind === "actions-workflow") return actionsWorkflowAnswer();
    if (request.kind === "actions-runs")
      return actionsRunsAnswer(runs[request.branch] ?? [], request.branch);
    return request.kind === "commit-list"
      ? historyOf(request.revision, request.perPage)
      : undefined;
  };
  published.serveCi(answer);
  return {
    published,
    revisions,
    answer,
    runs,
    hold(branch: string) {
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
    push(branch: string, name: "fixed" | "tidied" | "nextTrunk" | "nextStory") {
      const at = published.at(name);
      if (branch === "main") published.moveTrunk(at);
      else published.moveBranch(branch, at);
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
// then returns to Intent, where CI status shows: a newly selected story's CI
// comparison, or with none Project Intent's empty-selection homepage.
export async function toggleOnDevelopment(
  page: Page,
  title: string,
): Promise<Locator> {
  const { development, intentChoice, intent } = parts(page);
  await development.click();
  await card(page, title).locator("h3").first().click();
  await intentChoice.click();
  return chooseCiStatus(intent);
}

export async function expectKeptStoryCi(
  panel: Locator,
  branch: string,
  state: string,
) {
  await expectCiScope(panel, branch);
  await expectKeptCiAnswer(panel, {
    state,
    freshness: "Previously retrieved",
    checking: true,
  });
}

// Observe only the fresh CI read's completion or cancellation. The trunk's
// configured ref omits `judged`; kept=1 reads must not settle this promise.
export function freshCiStatusReadSettled(
  page: Page,
  judged?: string,
): Promise<void> {
  return new Promise<void>((resolve) => {
    const settled = (request: Request) => {
      const url = new URL(request.url());
      if (
        url.pathname !== authenticatedReadEndpoint ||
        url.searchParams.get("intent") !== "ci-status" ||
        url.searchParams.has("kept") ||
        url.searchParams.get("judged") !== (judged ?? null)
      )
        return;
      page.off("requestfinished", settled);
      page.off("requestfailed", settled);
      resolve();
    };
    page.on("requestfinished", settled);
    page.on("requestfailed", settled);
  });
}
