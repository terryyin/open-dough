// A Taken story follow-up names its source and reveals that Recently done
// card through the page's story navigation and disposable range.

import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { takenAdHocSession } from "../../test-support/support/startedAdHocSession.ts";
import { takenStory } from "../../test-support/launchJourney.ts";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import { storyCard } from "../../test-support/storyCardControls.ts";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendTerminalSubstitute.ts";
import { installFrontendSessionActions } from "../../test-support/support/frontendSessionActions.ts";
import {
  openTerminalControl,
  terminalPanel,
} from "../../test-support/terminalScreenPage.ts";
import { installFrontendDoneBodyReads } from "../../test-support/support/frontendDoneBodyReads.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { putFrontendDoneRecords } from "../../test-support/support/frontendServiceState.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { showLatestAction } from "../../test-support/recentlyDoneColumn.ts";
import {
  doneDestination,
  followStoryReferenceLink,
  referenceNotice,
  storyReferenceLink,
} from "../../test-support/storyReference.ts";
import {
  publishOlderSource,
  publishRecentSourceBatch,
  sourceFileName,
} from "../../test-support/support/followUpSourceCatalog.ts";
import {
  openBoard,
  sourceStory,
  storyFollowUp,
} from "../../test-support/support/recentlyDoneFollowUpGrouping.ts";

const sourceDestination = (page: Page) =>
  doneDestination(parts(page).recentlyDone, sourceStory.identity);

const instruction = "Tighten the source reveal wording";

test("a Taken follow-up names its source by title when read, and by identity while unread", async ({
  page,
  frontendServices,
}) => {
  // Keep the source outside the default recent window so only this Taken
  // reference asks for its body while naming it.
  publishOlderSource(frontendServices, {
    olderCompletedAt: new Date(
      Date.now() - 31 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    recentFillers: 3,
  });
  const bodies = await installFrontendDoneBodyReads(page, frontendServices);
  const held = bodies.hold(sourceFileName);
  const followUp = storyFollowUp(instruction, "follow-up-source-title");
  await openBoard(page, frontendServices, [followUp]);

  const taken = takenAdHocSession(page, instruction);
  await expect(storyReferenceLink(taken, sourceStory.identity)).toBeVisible();
  await expect(storyReferenceLink(taken, sourceStory.title)).toHaveCount(0);

  held.release();
  await expect(storyReferenceLink(taken, sourceStory.title)).toBeVisible();
  await expect(storyReferenceLink(taken, sourceStory.identity)).toHaveCount(0);
});

test("keyboard source reveal beyond ten on a narrow reduced-motion viewport focuses the card and keeps the selected story", async ({
  page,
  frontendServices,
}) => {
  // No covering Side panel: the Board stays observable for destination focus.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  publishRecentSourceBatch(frontendServices, { sourceAt: 11, fillers: 11 });
  const followUp = storyFollowUp(instruction, "follow-up-source-beyond-ten");
  await openBoard(page, frontendServices, [followUp]);

  await showColumn(page, "Taken");
  const taken = takenAdHocSession(page, instruction);
  await expect(storyReferenceLink(taken, sourceStory.title)).toBeVisible();
  await expect(sourceDestination(page)).toHaveCount(0);

  const selected = storyCard(parts(page).taken, takenStory);
  await emptyArea(selected).click();
  await expectSelected(selected, true);

  await followStoryReferenceLink(taken, sourceStory.title, "keyboard");
  const destination = sourceDestination(page);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(parts(page).recentlyDone).toContainText(
    "Showing 12 of 12 entries.",
  );
  await expectSelected(selected, true);
  await expect(showLatestAction(parts(page).recentlyDone)).toBeVisible();
});

test("keyboard source reveal beyond ten keeps an open Side panel and leaves selection alone under reduced motion", async ({
  page,
  frontendServices,
}) => {
  // Board and Side panel must share the row: a covering narrow panel hides the
  // Board (aria-hidden), so destination focus cannot be observed there.
  await page.setViewportSize({ width: 1280, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  publishRecentSourceBatch(frontendServices, {
    sourceAt: 11,
    fillers: 11,
  });
  const followUp = storyFollowUp(
    instruction,
    "follow-up-source-beyond-ten-panel",
  );
  await installAttachedTerminalSubstitute(page);
  await installFrontendSessionActions(page, frontendServices);
  await openBoard(page, frontendServices, [followUp]);

  const taken = takenAdHocSession(page, instruction);
  await expect(storyReferenceLink(taken, sourceStory.title)).toBeVisible();
  await expect(sourceDestination(page)).toHaveCount(0);

  const takenStoryCard = storyCard(parts(page).taken, takenStory);
  await expectSelected(takenStoryCard, false);

  await openTerminalControl(taken).click();
  const panel = terminalPanel(page);
  await expect(panel).toBeVisible();

  await followStoryReferenceLink(taken, sourceStory.title, "keyboard");
  const destination = sourceDestination(page);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expectSelected(takenStoryCard, false);
  await expect(panel).toBeVisible();
});

test("an older catalogued source reveals on demand, restores with Show latest 10, and reveals again", async ({
  page,
  frontendServices,
}) => {
  const olderCompletedAt = new Date(
    Date.now() - 31 * 24 * 60 * 60 * 1000,
  ).toISOString();
  publishOlderSource(frontendServices, { olderCompletedAt });
  const followUp = storyFollowUp(instruction, "follow-up-source-older");
  await openBoard(page, frontendServices, [followUp]);

  const taken = takenAdHocSession(page, instruction);
  await expect(sourceDestination(page)).toHaveCount(0);

  await followStoryReferenceLink(taken, sourceStory.title);
  const destination = sourceDestination(page);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });

  await showLatestAction(parts(page).recentlyDone).click();
  await expect(sourceDestination(page)).toHaveCount(0);

  await followStoryReferenceLink(taken, sourceStory.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
});

test("a failed source body keeps the Taken entry naming the identity and still reveals the gap card", async ({
  page,
  frontendServices,
}) => {
  publishOlderSource(frontendServices, {
    olderCompletedAt: new Date(
      Date.now() - 31 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    recentFillers: 3,
  });
  const bodies = await installFrontendDoneBodyReads(page, frontendServices);
  bodies.failNext(sourceFileName);
  const followUp = storyFollowUp(instruction, "follow-up-source-failed");
  await openBoard(page, frontendServices, [followUp]);

  const taken = takenAdHocSession(page, instruction);
  await expect(storyReferenceLink(taken, sourceStory.identity)).toBeVisible();
  await expect(taken).toBeVisible();

  // Fail the reveal's body read as well as the naming read.
  bodies.failNext(sourceFileName);
  await followStoryReferenceLink(taken, sourceStory.identity);
  const destination = sourceDestination(page);
  await expect(destination).toBeFocused();
  await expect(destination).toContainText("This done story could not be read.");
  await expect(taken).toBeVisible();
  await expect(storyReferenceLink(taken, sourceStory.identity)).toBeVisible();
});

test("an absent source keeps the Taken entry accessible with honest unavailable feedback", async ({
  page,
  frontendServices,
}) => {
  putFrontendDoneRecords(
    frontendServices,
    "open-dough",
    Array.from({ length: 3 }, (...[, index]) =>
      makeMe.aDoneRecord
        .with({
          identity: `SEED-390#absent-filler-${index}`,
          title: `Absent filler ${index}`,
          completedAt: new Date().toISOString(),
          developer: "Terry Yin",
        })
        .please(),
    ),
  );
  const identity = "SEED-390#missing-source";
  const followUp = storyFollowUp(instruction, "follow-up-source-absent", {
    identity,
  });
  await openBoard(page, frontendServices, [followUp]);

  const taken = takenAdHocSession(page, instruction);
  await expect(storyReferenceLink(taken, identity)).toBeVisible();

  await followStoryReferenceLink(taken, identity);
  await expect(referenceNotice(page)).toContainText(
    `${identity} is unavailable in Open Dough's dashboard`,
  );
  await expect(doneDestination(parts(page).recentlyDone, identity)).toHaveCount(
    0,
  );
  await expect(taken).toBeVisible();
});
