// Closed ad hoc story follow-ups move from Taken onto their source Recently
// done card, share that card across anchors, and return to Taken when reopened.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import {
  parts,
  sessionStateOf,
  storyCardSessions,
} from "../../test-support/dashboardPage.ts";
import { markDoneAnyway } from "../../test-support/support/markDone.ts";
import { installFrontendSessionActions } from "../../test-support/support/frontendSessionActions.ts";
import { doneCard } from "../../test-support/doneStoryReviewPage.ts";
import { takenAdHocSession } from "../../test-support/support/startedAdHocSession.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishSourceCard } from "../../test-support/support/followUpSourceCatalog.ts";
import { fileFollowUpDialog } from "../../test-support/support/fileFollowUpPage.ts";
import { frontendAttempt } from "../../test-support/support/frontendLaunchAttempts.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { putFrontendDoneRecords } from "../../test-support/support/frontendServiceState.ts";
import {
  adHocName,
  openBoard,
  sourceStory,
  storyFollowUp,
  revision,
} from "../../test-support/support/recentlyDoneFollowUpGrouping.ts";

for (const from of [
  "published card",
  "local card",
  "attached local session",
] as const) {
  test(`a follow-up from the ${from} is added to its original Done card`, async ({
    page,
    frontendServices,
  }) => {
    const reference = "22222222-2222-4222-8222-222222222222";
    const story = {
      identity: `ad-hoc#${reference}`,
      title: "Keep the drafted work",
      completedAt: new Date().toISOString(),
    };
    const original = makeMe.aLaunchRecord
      .adHoc({ title: story.title, instruction: "Draft the release notes" })
      .inClaudeSession({ sessionId: "original-draft", shortId: "original" })
      .markedDoneAt(story.completedAt)
      .originatedDoneStory(story)
      .please();
    if (from === "published card")
      putFrontendDoneRecords(frontendServices, "open-dough", [
        makeMe.aDoneRecord.with({ ...story, developer: "Terry Yin" }).please(),
      ]);
    await installFrontendSessionActions(page, frontendServices);
    await openBoard(page, frontendServices, [original], {
      unavailable: [original],
    });
    const attempt = frontendAttempt(
      frontendServices,
      frontendServices.machine?.records,
    );
    const boundary = await installFrontendLaunchBoundary(page, {
      accept: attempt.accept,
    });
    const card = doneCard(page, story.title);
    const byCard = from !== "attached local session";
    const request =
      from === "published card"
        ? makeMe.aFollowUp.ofStory(story, revision)
        : byCard
          ? makeMe.aFollowUp.ofLocalStory(story.identity)
          : makeMe.aFollowUp.ofSession(original);
    await card
      .getByRole("button", {
        name: `Follow up ${byCard ? `${story.identity} — ${story.title}` : story.title}`,
        exact: true,
      })
      .click();
    const dialog = fileFollowUpDialog(page);
    await expect(dialog).toContainText("Draft the release notes");
    await expect(dialog.getByText(/^Status: Done\./)).toHaveCount(
      byCard ? 1 : 0,
    );
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect
      .poll(() => boundary.acceptances)
      .toEqual([expect.objectContaining({ followUp: request.please() })]);

    const title = "Extend the notes";
    const parent = byCard ? request : request.underStory(story.identity);
    const started = makeMe.aLaunchRecord
      .adHoc({ title, followUp: parent.please() })
      .inClaudeSession({ sessionId: "draft-follow-up", shortId: "draft-fo" })
      .please();
    attempt.launch(started);
    await boundary.tellChanged();
    await showColumn(page, "Taken");
    await markDoneAnyway(takenAdHocSession(page, title));
    await showColumn(page, "Recently done");
    await expect(card).toHaveCount(1);
    await expect(storyCardSessions(card)).toHaveCount(2);
    await expect(
      storyCardSessions(card).filter({ hasText: title }),
    ).toBeVisible();
    await expect(
      storyCardSessions(card).filter({ hasText: story.title }),
    ).toBeVisible();
    await expect(doneCard(page, title)).toHaveCount(0);
  });
}

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
