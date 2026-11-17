// Closed ad hoc story follow-ups move from Taken onto their source Recently
// done card, share that card across anchors, and return to Taken when reopened.

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  parts,
  sessionStateOf,
  storyCardSessions,
} from "../../tests/dashboardPage.ts";
import { markDoneAnyway } from "../../tests/support/markDone.ts";
import { installFrontendSessionActions } from "../../tests/support/frontendSessionActions.ts";
import { doneCard } from "../../tests/recentlyDoneReviewState.ts";
import { takenAdHocSession } from "../../tests/support/startedAdHocSession.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishSourceCard } from "../../tests/support/followUpSourceCatalog.ts";
import {
  adHocName,
  openBoard,
  sourceStory,
  storyFollowUp,
} from "../../tests/support/recentlyDoneFollowUpGrouping.ts";

test("marking a follow-up Done moves it from Taken onto its source card", async ({
  page,
  frontendServices,
}) => {
  const title = "Tighten the pause wording";
  const followUp = storyFollowUp(title, "follow-up-card-open");
  publishSourceCard(frontendServices);
  await installFrontendSessionActions(page, frontendServices);
  await openBoard(page, frontendServices, [followUp]);

  const taken = takenAdHocSession(page, title);
  await expect(taken).toBeVisible();
  await expect(
    storyCardSessions(doneCard(page, sourceStory.title)),
  ).toHaveCount(0);

  await markDoneAnyway(taken);

  await expect(takenAdHocSession(page, title)).toHaveCount(0);
  const nested = storyCardSessions(doneCard(page, sourceStory.title));
  await expect(nested).toHaveCount(1);
  await expect(nested).toHaveAccessibleName(adHocName(title));
  await expect(sessionStateOf(nested)).toHaveText("Done");
});

test("card and file follow-ups of one story share its Done card", async ({
  page,
  frontendServices,
}) => {
  const cardTitle = "Card follow-up of the pause";
  const fileTitle = "File follow-up of the pause";
  const cardFollowUp = storyFollowUp(cardTitle, "follow-up-card-done", {
    doneAt: "2026-11-16T13:00:00.000Z",
    launchedAt: "2026-11-16T12:50:00.000Z",
  });
  const fileFollowUp = storyFollowUp(fileTitle, "follow-up-file-done", {
    file: { path: "dashboard/src/ciPause.ts", line: 12, side: "new" },
    doneAt: "2026-11-16T13:05:00.000Z",
    launchedAt: "2026-11-16T12:55:00.000Z",
  });
  publishSourceCard(frontendServices);
  await openBoard(page, frontendServices, [cardFollowUp, fileFollowUp]);

  const nested = storyCardSessions(doneCard(page, sourceStory.title));
  await expect(nested).toHaveCount(2);
  await expect(nested.nth(0)).toHaveAccessibleName(adHocName(fileTitle));
  await expect(nested.nth(1)).toHaveAccessibleName(adHocName(cardTitle));
  await expect(
    parts(page).recentlyDone.getByRole("article", {
      name: adHocName(cardTitle),
      exact: true,
    }),
  ).toHaveCount(1);
  await expect(
    parts(page).recentlyDone.getByRole("article", {
      name: adHocName(fileTitle),
      exact: true,
    }),
  ).toHaveCount(1);

  await page.reload();
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
  await expect(
    storyCardSessions(doneCard(page, sourceStory.title)),
  ).toHaveCount(2);
});

test("reopening a closed follow-up returns it to Taken", async ({
  page,
  frontendServices,
}) => {
  const title = "Reopen the pause follow-up";
  const closed = storyFollowUp(title, "follow-up-reopen", {
    doneAt: "2026-11-16T13:10:00.000Z",
  });
  publishSourceCard(frontendServices);
  await openBoard(page, frontendServices, [closed]);

  await expect(
    storyCardSessions(doneCard(page, sourceStory.title)),
  ).toHaveCount(1);

  // Native reopen clears the Done mark; the next sessions read shows it open.
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observingOpen(storyFollowUp(title, "follow-up-reopen"))
      .please(),
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();

  await expect(takenAdHocSession(page, title)).toBeVisible();
  await expect(
    storyCardSessions(doneCard(page, sourceStory.title)),
  ).toHaveCount(0);
});
