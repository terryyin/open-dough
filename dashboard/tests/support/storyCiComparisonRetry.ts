// Shared helpers for recovering an unavailable done-story CI timing
// comparison (../intent/intent-ci-comparison-retry.spec.ts): the Actions
// request a `gh` call asks, the comparison's Check again and the read it
// starts, the browser's comparison and proof reads, and a done Trunk Mode
// story whose Baseline listing a test answers.

import type { Locator, Page } from "@playwright/test";
import {
  authenticatedReadEndpoint,
  readWaitLimitMs,
} from "../../src/authenticatedReadRules.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import { actionsRunsAnswer, actionsWorkflowAnswer } from "./baseCiActions.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import { parseRequest } from "./ghRequest.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

// The revision a run listing asks for (`head_sha=`), if ARGV is one.
export function listedHeadSha(argv: readonly string[]): string | undefined {
  const request = parseRequest(argv);
  return request.kind === "actions-runs" && request.headSha !== ""
    ? request.headSha
    : undefined;
}

export const checkAgainOf = (panel: Locator) =>
  panel.getByRole("button", { name: "Check again", exact: true });

const intentOf = (url: string) =>
  url.includes(authenticatedReadEndpoint)
    ? new URL(url).searchParams.get("intent")
    : null;

// Clicks the comparison's Check again and returns the answer to the
// comparison read it starts. Like selecting the story
// (./selectDoneStoryForCiComparison.ts), a fresh read walks many head_sha
// lookups, so it waits through the shared read bound.
export async function checkComparisonAgain(page: Page, panel: Locator) {
  const answered = page.waitForResponse(
    (response) => intentOf(response.url()) === "ci-comparison",
    { timeout: readWaitLimitMs + 15_000 },
  );
  await checkAgainOf(panel).click();
  return await answered;
}

// Comparison and proof reads the browser finished, a hold on the next
// comparison reads until released, and a refusal of the next one.
export async function watchComparisonReads(page: Page) {
  const finished = { comparison: 0, proof: 0 };
  let held: Promise<void> | undefined;
  let refused = false;
  page.on("requestfinished", (request) => {
    const intent = intentOf(request.url());
    if (intent === "ci-comparison") finished.comparison += 1;
    if (intent === "ci-proof") finished.proof += 1;
  });
  await page.route(`**${authenticatedReadEndpoint}?*`, async (route) => {
    const comparison = intentOf(route.request().url()) === "ci-comparison";
    if (comparison && refused) {
      refused = false;
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "comparison unavailable for proof" }),
      });
      return;
    }
    if (comparison && held) await held;
    await route.continue();
  });
  return {
    finished,
    refuseNext(): void {
      refused = true;
    },
    hold(): () => void {
      let release = () => {};
      held = new Promise((resolve) => {
        release = resolve;
      });
      return () => {
        held = undefined;
        release();
      };
    },
  };
}

// A done Trunk Mode story whose Baseline listing BASELINE_ANSWER answers by
// its count; other listings have no runs.
export async function publishTrunkStoryWithBaseline(
  page: Page,
  origin: StartOrigin,
  baselineAnswer: (listing: number) => OriginAnswer,
) {
  writeAt(origin.project, "src/built.ts", "built before claim\n");
  commitAll(origin.project, "ship a built revision");
  const baseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);
  await completedPublishedStory(origin, "trunk");
  advanceCompletedTrunk(origin);
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const listings = { baseline: 0 };
  committed.serveActions((argv) => {
    if (parseRequest(argv).kind === "actions-workflow")
      return actionsWorkflowAnswer();
    const headSha = listedHeadSha(argv);
    if (headSha === undefined) return undefined;
    if (headSha !== baseline) return actionsRunsAnswer([]);
    listings.baseline += 1;
    return baselineAnswer(listings.baseline);
  });
  return { baseline, listings };
}
