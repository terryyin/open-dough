import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { showColumn } from "../../test-support/boardPage.ts";
import {
  parts,
  sessionEntryShowing,
  standaloneSessionName,
} from "../../test-support/dashboardPage.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { doneCard } from "../../test-support/doneStoryReviewPage.ts";
import { showRecentlyDone } from "../../test-support/recentlyDoneSessionsSidebarPage.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { advanceFrontendDoneProject } from "../../test-support/support/frontendDoneProjectRefresh.ts";
import {
  putFrontendDoneRecords,
  putFrontendPublishedSessions,
  type FrontendServiceState,
} from "../../test-support/support/frontendServiceState.ts";
import { installFrontendStoryReview } from "../../test-support/support/frontendStoryReview.ts";
import { openBoard } from "../../test-support/support/recentlyDoneFollowUpGrouping.ts";
import { preholdRevisionStreamSlots } from "../../test-support/support/revisionStreamSlots.ts";
import { sessionDetailsControl } from "../../test-support/support/sessionEntryDisclosure.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";

const source = "open-dough";
const originId = "1cb9c626-6bfb-4a59-a723-09560b26feda";
const identity = `ad-hoc#${originId}`;
const title = "Automate the release notes";
const close = () => {
  const original = makeMe.aSessionRecord
    .forSession(originId)
    .underStory(identity)
    .please();
  const followUp = makeMe.aSessionRecord.underStory(identity).please();
  const legacy = makeMe.aSessionRecord.please();
  return { original, followUp, legacy };
};

function putStory(services: FrontendServiceState, completedAt: string) {
  putFrontendDoneRecords(services, source, [
    makeMe.aDoneRecord.with({ identity, title, completedAt }).please(),
  ]);
}

const row = (scope: ReturnType<typeof doneCard>, id: string) =>
  scope.getByRole("article", { name: `Published session ${id}`, exact: true });

test("a second machine groups the follow-up as soon as the originating Done story is published", async ({
  page,
  frontendServices,
}) => {
  const { original, followUp, legacy } = close();
  const review = await installFrontendStoryReview(page);
  putFrontendPublishedSessions(frontendServices, source, [followUp, legacy]);
  await pausePageClockAt(page, new Date());
  await preholdRevisionStreamSlots(page);
  await openBoard(page, frontendServices, []);
  await showColumn(page, "Recently done");
  const recent = parts(page).recentlyDone;
  await expect(row(recent, followUp.sessionId)).toBeVisible();
  await expect(doneCard(page, title)).toHaveCount(0);

  putStory(frontendServices, original.closedAt);
  putFrontendPublishedSessions(frontendServices, source, [
    original,
    followUp,
    legacy,
  ]);
  await advanceFrontendDoneProject(page, frontendServices);
  const card = doneCard(page, title);
  await expect(card).toHaveCount(1);
  for (const close of [original, followUp]) {
    await expect(row(card, close.sessionId)).toBeVisible();
    await expect(row(recent, close.sessionId)).toHaveCount(1);
  }
  await expect(row(recent, legacy.sessionId)).toBeVisible();
  await expect(row(card, legacy.sessionId)).toHaveCount(0);
  await row(card, followUp.sessionId)
    .getByRole("button", { name: "Review changes" })
    .click();
  await expect
    .poll(() => review.queriesAsked(storyReviewEndpoint))
    .toContainEqual(
      expect.objectContaining({ source, published: followUp.sessionId }),
    );
});

test("a retained launch represents its linked published session and keeps its native controls", async ({
  page,
  frontendServices,
}) => {
  const { original, followUp } = close();
  const kept = makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId: "retained-origin", shortId: "retained" })
    .withDeclaredLanding({ reference: originId })
    .markedDoneAt(original.closedAt)
    .please();
  putStory(frontendServices, original.closedAt);
  putFrontendPublishedSessions(frontendServices, source, [original, followUp]);
  await openBoard(page, frontendServices, [kept]);
  await showColumn(page, "Recently done");

  const card = doneCard(page, title);
  const entry = sessionEntryShowing(card, "claude:retained-origin");
  await expect(entry).toHaveAccessibleName(
    standaloneSessionName("Ad hoc", title),
  );
  await expect(sessionDetailsControl(entry)).toBeVisible();
  await expect(row(parts(page).recentlyDone, originId)).toHaveCount(0);
  await expect(row(card, followUp.sessionId)).toBeVisible();
  const sidebar = await showRecentlyDone(page);
  await expect(sidebar.reviewCue(title)).toBeVisible();
  await sidebar.select(title).click();
  await expect(card).toHaveClass(/story-card-selected/);
});

test("a retained launch with competing published membership stays outside both cards", async ({
  page,
  frontendServices,
}) => {
  const { original } = close();
  const other = {
    identity: "ad-hoc#e10068e9-1ce8-483b-bd4d-c6ed43449d44",
    title: "Revise the notes",
  };
  const kept = makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId: "retained-conflict", shortId: "conflict" })
    .reportingThrough({
      origin: "http://localhost",
      reference: originId,
      command: "report",
    })
    .markedDoneAt(original.closedAt)
    .originatedDoneStory({ ...other, completedAt: original.closedAt })
    .please();
  putFrontendDoneRecords(frontendServices, source, [
    makeMe.aDoneRecord
      .with({ identity, title, completedAt: original.closedAt })
      .please(),
    makeMe.aDoneRecord
      .with({ ...other, completedAt: original.closedAt })
      .please(),
  ]);
  putFrontendPublishedSessions(frontendServices, source, [original]);
  await openBoard(page, frontendServices, [kept]);
  await showColumn(page, "Recently done");

  const key = "claude:retained-conflict";
  const recent = parts(page).recentlyDone;
  await expect(sessionEntryShowing(recent, key)).toHaveCount(1);
  await expect(row(recent, originId)).toHaveCount(0);
  for (const name of [title, other.title]) {
    await expect(sessionEntryShowing(doneCard(page, name), key)).toHaveCount(0);
  }
  await (await showRecentlyDone(page)).select(title).click();
  await expect(sessionEntryShowing(recent, key)).toContainText(
    "Selected session",
  );
});
