// A done story card in Recently done carries its story's review state: an
// unreviewed card offers Mark as reviewed among its Story actions; a reviewed
// card offers Reviewed, which asks before undoing review. Either saved change
// keeps the card, its place, its sessions, the column's count, the Selected
// story and the Side panel as they were, keeps the keyboard on the card, and
// is announced once. Repository passivity and persistence across reload and restart: ../../../e2e/stories/recently-done-review-state-persistence.spec.ts.
// Project refresh and a second page of the same server:
// ../../../e2e/stories/recently-done-review-state-refresh.spec.ts.
// Cards whose record is not read, and touch input:
// ./recently-done-review-state-offer.spec.ts.
// Saves that fail: ../../../e2e/stories/recently-done-review-state-failed-save.spec.ts.
// Request refusals: ../../backend-tests/review/story-review-state-admission.spec.ts.

import path from "node:path";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  doneStories,
  openFrontendBoardReview,
  storyA,
  storyB,
  storyC,
} from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { parts, storyCardSessions } from "../../test-support/dashboardParts.ts";
import { readFinalReportControl } from "../../test-support/finalReportPages.ts";
import { doneStoryReview } from "../../test-support/doneStoryReviewPage.ts";
import { expectEntries } from "../../test-support/recentlyDoneColumn.ts";
import { sidePanelContents } from "../../test-support/support/sidePanelContents.ts";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import { installFrontendFinalReport } from "../../test-support/support/frontendFinalReportSubstitutes.ts";

const titles = doneStories.map(({ title }) => title);

test("Mark as reviewed keeps the card, selection and announcement as they were", async ({
  page,
  frontendServices,
}) => {
  const { recent, review } = await openFrontendBoardReview(
    page,
    frontendServices,
  );
  const cards = doneStoryReview(page);
  const a = cards.card(storyA.title);
  const b = cards.card(storyB.title);
  const c = cards.card(storyC.title);
  const count = recent.getByText("3 entries", { exact: true });

  await test.step("stories completed elsewhere are all unreviewed", async () => {
    await expectEntries(recent, titles);
    for (const card of [a, b, c]) await card.expectReviewed(false);
    expect(review.reviewed("open-dough")).toEqual([]);
    await expect(parts(page).backlog.getByRole("article")).not.toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Mark as reviewed", exact: true }),
    ).toHaveCount(3);
  });

  await test.step("Mark as reviewed on A, by keyboard, with C selected: A says Reviewed with focus on Reviewed, once announced; B, the order, the count, the selection and the Side panel stay", async () => {
    await emptyArea(c.article).click();
    await expectSelected(c.article, true);
    await expect(sidePanelContents(page)).toHaveCount(0);
    const actionsOfA = await a.actions.getByRole("button").allTextContents();
    await a.markAsReviewed.focus();
    await page.keyboard.press("Enter");
    await a.expectReviewed(true);
    await expect(a.reviewedButton).toBeFocused();
    await expect(a.actions.getByRole("status")).toHaveText(
      "Marked as reviewed.",
    );
    await expect(page.getByText("Marked as reviewed.")).toHaveCount(1);
    expect(await a.actions.getByRole("button").allTextContents()).toEqual(
      actionsOfA.map((name) =>
        name === "Mark as reviewed" ? "Reviewed" : name,
      ),
    );
    await b.expectReviewed(false);
    await c.expectReviewed(false);
    await expectEntries(recent, titles);
    await expect(count).toBeVisible();
    await expectSelected(c.article, true);
    await expectSelected(a.article, false);
    await expect(sidePanelContents(page)).toHaveCount(0);
    expect(review.reviewed("open-dough")).toEqual([storyA.identity]);
  });

  await test.step("Cancel leaves A reviewed, with focus on Reviewed and C still selected", async () => {
    await a.reviewedButton.click();
    const question = a.unreviewQuestion("Unreview this story?");
    await expect(question.cancel).toBeFocused();
    const saved = review.reviewed("open-dough");
    await question.cancel.click();
    await expect(question.group).toHaveCount(0);
    await a.expectReviewed(true);
    await expect(a.reviewedButton).toBeFocused();
    await expectSelected(c.article, true);
    await expectSelected(a.article, false);
    expect(review.reviewed("open-dough")).toEqual(saved);
  });

  await test.step("Escape closes the prompt and leaves A reviewed", async () => {
    await a.reviewedButton.press("Enter");
    const question = a.unreviewQuestion("Unreview this story?");
    await expect(question.cancel).toBeFocused();
    await question.cancel.press("Escape");
    await expect(question.group).toHaveCount(0);
    await a.expectReviewed(true);
    await expect(a.reviewedButton).toBeFocused();
  });
});

test("Marking and unreviewing a story keep the card's sessions as they were", async ({
  page,
  frontendServices,
}) => {
  const now = Date.now();
  const doneAt = new Date(now - 30 * 60_000);
  const slug = storyA.identity.split("#")[1] ?? "story";
  const sessions = [
    makeMe.aLaunchRecord
      .refining(storyA)
      .inClaudeSession({ sessionId: `${slug}-refined`, shortId: "refined" })
      .onStoryBranch({
        workspace: path.join("/tmp", "retired", `${slug}-refinement`),
        branch: `claude/${slug}-refinement`,
      })
      .launchedAt(new Date(doneAt.getTime() - 120_000).toISOString())
      .completedWith({ message: "" })
      .markedDoneAt(doneAt.toISOString())
      .please(),
    makeMe.aLaunchRecord
      .executing(storyA)
      .inClaudeSession({ sessionId: `${slug}-executed`, shortId: "executed" })
      .onStoryBranch({
        workspace: path.join("/tmp", "retired", slug),
        branch: `claude/${slug}`,
      })
      .launchedAt(new Date(doneAt.getTime() - 60_000).toISOString())
      .completedWith({ message: "" })
      .markedDoneAt(doneAt.toISOString())
      .please(),
  ];
  const reports = await installFrontendFinalReport(page, {
    kind: "available",
    turnId: "board-review-report",
    text: "",
  });
  for (const record of sessions) {
    reports.answerNext(
      {
        kind: "available",
        turnId: record.session.sessionId,
        text: "",
      },
      record.session.sessionId,
    );
  }
  await openFrontendBoardReview(page, frontendServices, {
    now,
    observed: sessions.map((record) =>
      makeMe.anObservedLaunch
        .of(record)
        .withSessionState(makeMe.aSessionState.retained("review").please())
        .withWorkspace("missing")
        .please(),
    ),
  });
  const a = doneStoryReview(page).card(storyA.title);
  const nested = storyCardSessions(a.article);
  const names = [
    `Execution session for ${storyA.title}`,
    `Refinement session for ${storyA.title}`,
  ];
  const expectSessions = async () => {
    await expect(nested).toHaveCount(names.length);
    for (const name of names)
      await expect(
        readFinalReportControl(
          a.article.getByRole("article", { name, exact: true }),
        ),
      ).toBeVisible();
  };
  await expectSessions();
  await a.markAsReviewed.click();
  await a.expectReviewed(true);
  await expectSessions();
  await a.unreview("Unreview this story?", "mouse");
  await a.expectReviewed(false);
  await expectSessions();
});
