// Selecting another Done story while Intent stays mounted must not lend it
// the prior story's source during either comparison or locations reading.
// Both stories complete through the real CLI; the Sessions sidebar provides
// the ordinary selection transition without leaving Intent.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { storyB } from "../../../tests/support/queued-repository.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { showColumn } from "../boardPage.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { holdAuthenticatedReadsWhere } from "../holdAuthenticatedReads.ts";
import { expandIntentGroup, purposeRegion } from "../intentPerspectivePage.ts";
import { recentlyDoneParts } from "../recentlyDoneSessionsSidebarPage.ts";
import { openSessionsSidebar } from "../sessionsSidebarPage.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "../support/completedPublishedStory.ts";
import { publishCompletedStory } from "../support/completedStoryPublication.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  chooseStoryTab,
  intentFile,
  storyTitle,
} from "../support/intentStoryPage.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { commitAll, git } from "../support/storyReviewWorktree.ts";
import { pull, push } from "../support/storyReviewTrunkCommits.ts";
import { openUntilRead } from "../pageRequestNotes.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("a newly selected Done story shows only its own historical source after held comparison and locations reads", async ({
  page,
  origin,
  dashboard,
}) => {
  publishIntentTrunk(origin.project);
  const first = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    undefined,
    undefined,
    { interleaved: false },
  );
  pull(origin.project);
  const second = await origin.publishTake({
    agent: "Yui",
    story: storyB,
    queued: [],
    mode: "trunk",
    slug: "completed-b",
  });
  const secondLocation = makeMe.anIntentLocation
    .at("second/tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .please();
  const secondSettings = makeMe.intentSettings
    .withLocations(secondLocation)
    .please();
  const secondImplementation = makeMe.aRepository
    .withRevision("story-b", {
      backlog: null,
      files: {
        ".planning/open-dough.json": JSON.stringify(secondSettings),
        "second/tests/b.spec.ts": "Story B historical source\n",
      },
    })
    .please().revisions[0];
  writeRevisionFiles(second.workspace, secondImplementation);
  commitAll(second.workspace, "Story B configures its own test location");
  push(second.workspace);
  const secondCompletion = publishCompletedStory(origin, {
    ...second,
    mode: "trunk",
    identity: storyB.identity,
    missingAgent: false,
    completionConflict: false,
  });
  advanceCompletedTrunk(origin);
  const now = new Date().toISOString();
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: storyB.identity, title: storyB.title })
      .inClaudeSession({ sessionId: "completed-story-b", shortId: "story-b" })
      .launchedAt(now)
      .markedDoneAt(now)
      .please(),
  ]);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
    follows: true,
  });
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
    purposeRegion(intent).locator(".intent-source-meta"),
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
  await sessions.entry(storyB.title).click();
  await expect(intent).toHaveAttribute("data-selected-story", storyB.identity);
  await expect(storyTitle(intent)).toHaveText(storyB.title);
  await expect.poll(() => comparisonHeld).toBeGreaterThan(0);
  await chooseStoryTab(intent, "Changed tests");
  await expect(intent.locator(".intent-locations")).toHaveCount(0);
  await expect(
    intent.getByRole("tabpanel", { name: "Changed tests" }),
  ).toContainText("Reading the story's historical Intent locations…");
  await expect(purposeRegion(intent)).toHaveCount(0);

  releaseComparison();
  await expect.poll(() => locations.held()).toBeGreaterThan(0);
  await expect(intent.locator(".intent-locations")).toHaveCount(0);
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
