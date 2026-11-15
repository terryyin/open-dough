import { prepareFrontendDoneSelection } from "../../tests/support/frontendDoneSelection.ts";
import { filesColumn } from "../../tests/intentModePage.ts";
import { sourceRevision } from "../../tests/intentCodeBrowsePage.ts";
// Selecting another Done story while Intent stays mounted must not lend it
// the prior story's source during either comparison or locations reading.
// Explicit immutable completion answers provide the starting facts. The
// Sessions sidebar performs the ordinary selection without leaving Intent;
// real CLI selection remains in E2E intent-done-default-answer-selection.

import { storyB } from "../../../Distribution/tests/support/queued-repository.mjs";

import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { showColumn } from "../../tests/boardPage.ts";

import { parts } from "../../tests/dashboardPage.ts";
import { holdAuthenticatedReadsWhere } from "../../tests/holdAuthenticatedReads.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../tests/intentPerspectivePage.ts";
import { recentlyDoneParts } from "../../tests/recentlyDoneSessionsSidebarPage.ts";
import { openSessionsSidebar } from "../../tests/sessionsSidebarPage.ts";

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  chooseStoryTab,
  intentFile,
  storyTitle,
} from "../../tests/support/intentStoryPage.ts";

import { openUntilRead } from "../../tests/pageRequestNotes.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("a newly selected Done story shows only its own historical source after held comparison and locations reads", async ({
  page,
  frontendServices,
}) => {
  const { first, secondCompletion } = await prepareFrontendDoneSelection(
    page,
    frontendServices,
  );
  await openUntilRead(page);
  await showColumn(page, "Recently done");
  const { recentlyDone, intentChoice, intent } = parts(page);
  await recentlyDone
    .getByRole("article", { name: "Story A", exact: true })
    .getByRole("heading", { level: 3 })
    .click();
  await intentChoice.click();
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, "dashboard/tests/a.spec.ts").click();
  await expect(purposeRegion(intent)).toContainText("a 11");
  await expect(
    sourceRevision(intent, "dashboard/tests/a.spec.ts"),
  ).toContainText(first.completion.slice(0, 7));

  let releaseComparison: () => void = () => undefined;
  const comparisonReleased = new Promise<void>((resolve) => {
    releaseComparison = resolve;
  });
  releases.push(releaseComparison);
  let comparisonHeld = 0;
  await page.route(`**${storyReviewEndpoint}?*`, async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("identity") ===
      storyB.identity
    ) {
      comparisonHeld += 1;
      await comparisonReleased;
    }
    await route.fallback();
  });
  const locations = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("intent") === "locations" &&
      params.get("revision") === secondCompletion,
    releases,
  );
  await openSessionsSidebar(page);
  const sessions = recentlyDoneParts(page);
  await sessions.header.click();
  await sessions.select(storyB.title).click();
  await expect(intent).toHaveAttribute("data-selected-story", storyB.identity);
  await expect(storyTitle(intent)).toHaveText(storyB.title);
  await expect.poll(() => comparisonHeld).toBeGreaterThan(0);
  await chooseStoryTab(intent, "Changed tests");
  await expect(filesColumn(intent)).toHaveCount(0);
  await expect(
    intent.getByRole("tabpanel", { name: "Changed tests" }),
  ).toContainText("Reading the story's historical Intent locations…");
  await expect(purposeRegion(intent)).toHaveCount(0);

  releaseComparison();
  await expect.poll(() => locations.held()).toBeGreaterThan(0);
  await expect(filesColumn(intent)).toHaveCount(0);
  await expect(purposeRegion(intent)).toHaveCount(0);
  locations.release();
  await expandIntentGroup(intent, "second/tests");
  await expect(intentFile(intent, "dashboard/tests/a.spec.ts")).toHaveCount(0);
  await intentFile(intent, "Added second/tests/b.spec.ts").click();
  await expect(purposeRegion(intent)).toContainText(
    "Story B historical source",
  );
  await expect(purposeRegion(intent)).not.toContainText("a 11");
});
