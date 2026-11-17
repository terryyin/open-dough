// Closed story follow-ups join only their listed same-project source card;
// other story or project and unlisted sources stay apart. Follow up context
// still names the story's own sessions only.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts, storyCardSessions } from "../../tests/dashboardPage.ts";
import { putFrontendDoneRecords } from "../../tests/support/frontendServiceState.ts";
import {
  completedWords,
  storyNameOf,
} from "../../tests/support/followUpStories.ts";
import {
  fileFollowUpDialog,
  followUpContextList,
} from "../../tests/support/fileFollowUpPage.ts";
import { doneCard } from "../../tests/recentlyDoneReviewState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishSourceCard } from "../../tests/support/followUpSourceCatalog.ts";
import {
  adHocName,
  completedAt,
  openBoard,
  otherStory,
  ownStorySession,
  sourceStory,
  storyFollowUp,
} from "../../tests/support/recentlyDoneFollowUpGrouping.ts";

test("another story's and another project's closed follow-ups stay off the card", async ({
  page,
  frontendServices,
}) => {
  const ownTitle = "Own story follow-up";
  const otherTitle = "Other story follow-up";
  const otherProjectTitle = "Other project follow-up";
  const own = storyFollowUp(ownTitle, "follow-up-own", {
    doneAt: "2026-11-16T13:20:00.000Z",
  });
  const other = storyFollowUp(otherTitle, "follow-up-other-story", {
    identity: otherStory.identity,
    doneAt: "2026-11-16T13:21:00.000Z",
  });
  const otherProject = storyFollowUp(
    otherProjectTitle,
    "follow-up-other-project",
    {
      source: "doughnut",
      identity: sourceStory.identity,
      doneAt: "2026-11-16T13:22:00.000Z",
    },
  );
  frontendServices.listThreeProjects();
  putFrontendDoneRecords(frontendServices, "open-dough", [
    makeMe.aDoneRecord
      .with({
        ...sourceStory,
        completedAt,
        developer: "Terry Yin",
        agent: "viktor-chan",
        host: "codex",
      })
      .please(),
    makeMe.aDoneRecord
      .with({
        ...otherStory,
        completedAt: "2026-11-16T11:00:00.000Z",
        developer: "Terry Yin",
      })
      .please(),
  ]);
  putFrontendDoneRecords(frontendServices, "doughnut", [
    makeMe.aDoneRecord
      .with({
        ...sourceStory,
        completedAt,
        developer: "Terry Yin",
      })
      .please(),
  ]);
  await openBoard(page, frontendServices, [own, other, otherProject]);

  const sourceCard = doneCard(page, sourceStory.title);
  const nested = storyCardSessions(sourceCard);
  await expect(nested).toHaveCount(1);
  await expect(nested).toHaveAccessibleName(adHocName(ownTitle));
  await expect(
    storyCardSessions(doneCard(page, otherStory.title)),
  ).toHaveAccessibleName(adHocName(otherTitle));
  await expect(
    parts(page).recentlyDone.getByRole("article", {
      name: adHocName(otherProjectTitle),
      exact: true,
    }),
  ).toHaveCount(0);
});

test("a closed follow-up whose source card is not listed stays standalone", async ({
  page,
  frontendServices,
}) => {
  const title = "Follow-up of an unlisted source";
  const followUp = storyFollowUp(title, "follow-up-unlisted", {
    identity: "SEED-399#unlisted-source",
    doneAt: "2026-11-16T13:30:00.000Z",
  });
  putFrontendDoneRecords(frontendServices, "open-dough", [
    makeMe.aDoneRecord
      .with({
        ...sourceStory,
        completedAt,
        developer: "Terry Yin",
      })
      .please(),
  ]);
  await openBoard(page, frontendServices, [followUp]);

  await expect(
    parts(page).recentlyDone.getByRole("article", {
      name: adHocName(title),
      exact: true,
    }),
  ).toHaveCount(1);
  await expect(
    storyCardSessions(doneCard(page, sourceStory.title)),
  ).toHaveCount(0);
});

test("a card holding a closed follow-up still names the story's Follow up context", async ({
  page,
  frontendServices,
}) => {
  const followTitle = "Nested follow-up must not enter context";
  const own = ownStorySession(
    "source-own-session",
    "2026-11-16T11:50:00.000Z",
    "2026-11-16T11:55:00.000Z",
  );
  const followUp = storyFollowUp(followTitle, "follow-up-context", {
    doneAt: "2026-11-16T13:40:00.000Z",
    launchedAt: "2026-11-16T13:35:00.000Z",
  });
  publishSourceCard(frontendServices);
  await openBoard(page, frontendServices, [own, followUp], {
    unavailable: [own, followUp],
  });

  const card = doneCard(page, sourceStory.title);
  await expect(storyCardSessions(card)).toHaveCount(2);
  await card
    .getByRole("button", {
      name: `Follow up ${storyNameOf(sourceStory)}`,
      exact: true,
    })
    .click();
  const dialog = fileFollowUpDialog(page);
  await expect(dialog).toBeVisible();
  await expect(followUpContextList(dialog)).toHaveText([
    `Completed: ${completedWords(completedAt)}`,
    `Status: Done. Its seed and plan may have been removed; its records remain in the project's history under ${sourceStory.identity}.`,
    "Workflow: Execution",
    `Story: ${sourceStory.identity}`,
    "Original request: No request text was given.",
    "Final report: No final report was submitted.",
  ]);
  await expect(dialog).not.toContainText(followTitle);
});
