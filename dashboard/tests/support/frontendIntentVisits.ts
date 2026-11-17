// Explicit services for whole-app visits; Git/source judgment stays Backend/E2E.
import { expect, type Page } from "@playwright/test";
import { expectStoryComparisonRead } from "./intentStoryPage.ts";
import {
  publishUnconfiguredDoughnut,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  putFrontendIntentStory,
  answerFrontendIntentChanges,
  frontendIntentChanges,
} from "./frontendIntentStory.ts";
import { frontendFileDiff } from "./frontendStoryReview.ts";
import { answerFrontendIntentCi } from "./frontendIntentCi.ts";
import { openStoryIntent, chooseStoryTab } from "../intentModePage.ts";

export async function selectTakenStoryInIntent(
  page: Page,
  services: FrontendServiceState,
) {
  putFrontendIntentStory(services);
  const path = "dashboard/tests/boundary/deep/long.spec.ts";
  const review = await answerFrontendIntentChanges(page, [
    ...frontendIntentChanges,
    makeMe.aReviewedFile.with({ kind: "added", path }).please(),
  ]);
  review.answerFile(
    frontendFileDiff(
      path,
      [...Array(120).keys()].map((n) => `+long ${n + 1}`),
    ),
    path,
  );
  await answerFrontendIntentCi(page, services.revision);
  await publishUnconfiguredDoughnut(page, services);
  const selected = await openStoryIntent(page, "Story A");
  await expect(selected.intent).toBeVisible();
  await chooseStoryTab(selected.intent, "Changed tests");
  await expectStoryComparisonRead(selected.intent);
  return selected;
}
