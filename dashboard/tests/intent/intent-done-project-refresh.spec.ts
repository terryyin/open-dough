// A real Done story keeps landing evidence while Project Intent independently
// updates its source. The paused page clock observes an actual later push;
// no historical locations or comparison answer is fabricated.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  pausePageClock,
  passTimeUntilCheckedAfterSettled,
} from "../autoRefreshJourney.ts";
import {
  backToStory,
  openProjectIntent,
  projectIntentLink,
  returnToStory,
} from "../intentModePage.ts";
import {
  expandIntentGroup,
  expandIntentFolders,
  fileReadingTab,
  intentReadingScroll,
  proofRegion,
  purposeRegion,
  revisionNotice,
  scrollIntentReadingHalfway,
} from "../intentPerspectivePage.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { selectCompletedStoryInIntent } from "../support/intentCompletedStory.ts";
import {
  chooseStoryTab,
  intentFile,
  storySummary,
} from "../support/intentStoryPage.ts";
import { commitAll, git, lines } from "../support/storyReviewWorktree.ts";
import { push } from "../support/storyReviewTrunkCommits.ts";
import { expect, test } from "../support/preparationPage.ts";

test("all Done tabs ignore project freshness and project refresh returns the same historical file, Proof and reading place", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClock(page);
  const longFile = "dashboard/tests/boundary/deep/long.spec.ts";
  const implementation = makeMe.aRepository
    .withRevision("story", {
      backlog: null,
      files: { [longFile]: lines("historical", 120) },
    })
    .please().revisions[0];
  const report =
    "Outcome: Caught\nEvidence: The saved historical assessment.\n";
  const intentCoverage = makeMe.aDoneRecord
    .withIntentCoverage({ report })
    .please().intentCoverage;
  if (intentCoverage === undefined)
    throw new Error("The completed story fixture needs its saved assessment.");
  const locations: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations"
    )
      locations.push(url.searchParams.get("revision") ?? "");
  });
  const { intent, completion, published } = await selectCompletedStoryInIntent(
    page,
    origin,
    {
      implementation,
      intentCoverage,
    },
  );
  await expect.poll(() => locations).toEqual([completion]);
  await chooseStoryTab(intent, "Changed tests");
  await expect(intent.locator(".intent-locations")).toBeVisible();
  expect(locations).toEqual([completion]);

  // Establish Project Intent's own shown revision before trunk advances.
  await openProjectIntent(intent);
  await expect(intent.locator(".intent-locations")).toBeVisible();
  expect(locations).toEqual([completion, published]);
  await returnToStory(intent);
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  const selected = `Added ${longFile}`;
  await intentFile(intent, selected).click();
  await expect(
    purposeRegion(intent).locator(".story-review-code"),
  ).toHaveAttribute("aria-busy", "false");
  const offset = await scrollIntentReadingHalfway(intent);
  const originalDiff = await purposeRegion(intent)
    .locator(".story-review-code")
    .innerText();
  const revisions = storySummary(intent).locator(".intent-story-revisions");
  const endpoints = await revisions.innerText();
  expect(endpoints).toContain(completion.slice(0, 7));

  const later = makeMe.aRepository
    .withRevision("planning-only", {
      backlog: null,
      files: {
        ".planning/later-planning.md": "A later project planning update.\n",
      },
    })
    .please().revisions[0];
  writeRevisionFiles(origin.project, later);
  commitAll(origin.project, "planning only after the story");
  push(origin.project);
  const laterRevision = git(origin.origin, "rev-parse", "main");
  await passTimeUntilCheckedAfterSettled(page);
  await untilPageReadsAnswered(page);

  for (const tab of [
    "CI comparison",
    "Intent coverage",
    "Changed tests",
  ] as const) {
    await chooseStoryTab(intent, tab);
    await expect(revisionNotice(intent)).toHaveCount(0);
    await expect(
      intent.getByRole("button", { name: "Show latest", exact: true }),
    ).toHaveCount(0);
    await expect(revisions).toHaveText(endpoints);
    if (tab === "Intent coverage")
      await expect(intent.locator(".intent-story-coverage-text")).toHaveText(
        report,
      );
  }

  await openProjectIntent(intent);
  await expect(revisionNotice(intent)).toBeVisible();
  await revisionNotice(intent)
    .getByRole("button", { name: "Show latest", exact: true })
    .click();
  await expect(revisionNotice(intent)).toHaveCount(0);
  expect(locations).toEqual([completion, published, laterRevision]);
  await backToStory(intent).focus();
  await page.keyboard.press("Enter");
  await expect(projectIntentLink(intent)).toBeFocused();
  await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
  await expect(intentFile(intent, selected)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  expect(
    await purposeRegion(intent).locator(".story-review-code").innerText(),
  ).toBe(originalDiff);
  await expect(revisions).toHaveText(endpoints);

  await fileReadingTab(intent, "Proof").click();
  await expect(proofRegion(intent)).toBeVisible();
  await openProjectIntent(intent);
  await returnToStory(intent);
  await expect(intentFile(intent, selected)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(proofRegion(intent)).toBeVisible();
  await chooseStoryTab(intent, "Intent coverage");
  await expect(intent.locator(".intent-story-coverage-text")).toHaveText(
    report,
  );
});
