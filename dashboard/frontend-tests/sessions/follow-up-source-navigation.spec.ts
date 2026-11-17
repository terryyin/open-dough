// A Taken story follow-up names its source and reveals that Recently done
// card through the page's story navigation and disposable range.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { takenAdHocSession } from "../../tests/support/startedAdHocSession.ts";
import { takenStory } from "../../tests/launchJourney.ts";
import { emptyArea, expectSelected } from "../../tests/storyCardSelection.ts";
import { storyCard } from "../../tests/storyCardControls.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendTerminalSubstitute.ts";
import { installFrontendSessionActions } from "../../tests/support/frontendSessionActions.ts";
import {
  openTerminalControl,
  terminalPanel,
} from "../../tests/terminalScreenPage.ts";
import { installFrontendDoneBodyReads } from "../../tests/support/frontendDoneBodyReads.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { putFrontendDoneRecords } from "../../tests/support/frontendServiceState.ts";
import { showColumn } from "../../tests/boardPage.ts";
import {
  followSource,
  followUpSourceLink,
  openBoard,
  publishOlderSource,
  publishRecentSourceBatch,
  showLatestTen,
  sourceDoneCard,
  sourceFileName,
  sourceNotice,
  sourceStory,
  storyFollowUp,
} from "../../tests/support/followUpSourceNavigation.ts";

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
  await expect(followUpSourceLink(taken, sourceStory.identity)).toBeVisible();
  await expect(followUpSourceLink(taken, sourceStory.title)).toHaveCount(0);

  held.release();
  await expect(followUpSourceLink(taken, sourceStory.title)).toBeVisible();
  await expect(followUpSourceLink(taken, sourceStory.identity)).toHaveCount(0);
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
  await expect(followUpSourceLink(taken, sourceStory.title)).toBeVisible();
  await expect(sourceDoneCard(page)).toHaveCount(0);

  const selected = storyCard(parts(page).taken, takenStory);
  await emptyArea(selected).click();
  await expectSelected(selected, true);

  await followSource(taken, sourceStory.title, "keyboard");
  const destination = sourceDoneCard(page);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(parts(page).recentlyDone).toContainText(
    "Showing 12 of 12 entries.",
  );
  await expectSelected(selected, true);
  await expect(showLatestTen(page)).toBeVisible();
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
  await expect(followUpSourceLink(taken, sourceStory.title)).toBeVisible();
  await expect(sourceDoneCard(page)).toHaveCount(0);

  const takenStoryCard = storyCard(parts(page).taken, takenStory);
  await expectSelected(takenStoryCard, false);

  await openTerminalControl(taken).click();
  const panel = terminalPanel(page);
  await expect(panel).toBeVisible();

  await followSource(taken, sourceStory.title, "keyboard");
  const destination = sourceDoneCard(page);
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
  await expect(sourceDoneCard(page)).toHaveCount(0);

  await followSource(taken, sourceStory.title);
  const destination = sourceDoneCard(page);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });

  await showLatestTen(page).click();
  await expect(sourceDoneCard(page)).toHaveCount(0);

  await followSource(taken, sourceStory.title);
  await expect(sourceDoneCard(page)).toBeFocused();
  await expect(sourceDoneCard(page)).toBeInViewport({ ratio: 0.5 });
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
  await expect(followUpSourceLink(taken, sourceStory.identity)).toBeVisible();
  await expect(taken).toBeVisible();

  // Fail the reveal's body read as well as the naming read.
  bodies.failNext(sourceFileName);
  await followSource(taken, sourceStory.identity);
  const destination = parts(page).recentlyDone.locator(
    `[data-done-story="${sourceStory.identity}"]`,
  );
  await expect(destination).toBeFocused();
  await expect(destination).toContainText("This done story could not be read.");
  await expect(taken).toBeVisible();
  await expect(followUpSourceLink(taken, sourceStory.identity)).toBeVisible();
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
  await expect(followUpSourceLink(taken, identity)).toBeVisible();

  await followSource(taken, identity);
  await expect(sourceNotice(page)).toContainText(
    `${identity} is unavailable in Open Dough's dashboard`,
  );
  await expect(
    parts(page).recentlyDone.locator(`[data-done-story="${identity}"]`),
  ).toHaveCount(0);
  await expect(taken).toBeVisible();
});
