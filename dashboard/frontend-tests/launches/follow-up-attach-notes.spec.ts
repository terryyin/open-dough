// Done story Follow up offers Attach story notes from the card, file header
// and line menu: checked with waiting/total when notes wait; unavailable when
// none wait or notes cannot be read; Start while checked names notes: true;
// uncheck or cancel names none. Built frontend with notes and launch
// substitutes. Delivery marking is a later slice.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { installFrontendStoryNotes } from "../../test-support/support/frontendStoryNotes.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { openFrontendDoneStoryReview } from "../../test-support/support/frontendStoryReviewOpen.ts";
import {
  frontendFileDiff,
  frontendPublishedReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { attachStoryNotes } from "../../test-support/support/attachStoryNotesPage.ts";
import { storyNotesPage } from "../../test-support/support/storyNotesPage.ts";
import {
  fileFollowUp,
  fileFollowUpDialog,
} from "../../test-support/support/fileFollowUpPage.ts";
import {
  expectLineMenuOpen,
  lineNumberControl,
  openLineMenu,
} from "../../test-support/support/diffLineFollowUpPage.ts";
import { fileDiff } from "../../test-support/support/reviewTreeRows.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { parts } from "../../test-support/dashboardParts.ts";
import { startSessionDialog } from "../../test-support/launchStoryCardPage.ts";
import { takenIdentity, takenStory } from "../../test-support/launchJourney.ts";
import { lineNumberLabel } from "../../src/diffLineSide.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";

const storyLabel = `${storyA.identity} — ${storyA.title}`;
const path = "story.txt";

const waitingNote = () =>
  makeMe.aStoryNote
    .withText("Still waiting")
    .identifiedAs("34810000-0000-4000-8000-000000000201")
    .please();

const sentNote = () =>
  makeMe.aStoryNote
    .withText("Already sent")
    .identifiedAs("34810000-0000-4000-8000-000000000202")
    .savedAt("2026-11-17T00:10:00.000Z")
    .deliveredAs("2026-11-17T00:10:00.000Z")
    .please();

const followUpOnCard = (page: Parameters<typeof parts>[0]) =>
  parts(page)
    .recentlyDone.getByRole("article", { name: storyA.title, exact: true })
    .getByRole("button", { name: `Follow up ${storyLabel}` });

const storyFollowUpOf = (request: AgentLaunchRequest | undefined) => {
  expect(request?.workflow).toBe("ad-hoc");
  if (request?.workflow !== "ad-hoc") return undefined;
  const followUp = request.followUp;
  expect(followUp).toBeDefined();
  expect(followUp && "story" in followUp).toBe(true);
  return followUp && "story" in followUp ? followUp.story : undefined;
};

test("card Follow up checks Attach when notes wait; Start names notes: true; uncheck and cancel name none", async ({
  page,
  frontendServices,
}) => {
  const notes = await installFrontendStoryNotes(page);
  notes.answer("open-dough", {
    [storyA.identity]: [waitingNote(), sentNote()],
  });
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendBoardReview(page, frontendServices);
  const dialog = startSessionDialog(page, "Open Dough");
  const attach = attachStoryNotes(dialog);

  await followUpOnCard(page).click();
  await expect(dialog).toBeVisible();
  await attach.expectChecked(1, 2);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect.poll(() => boundary.acceptances.length).toBe(1);
  expect(storyFollowUpOf(boundary.acceptances[0])).toMatchObject({
    identity: storyA.identity,
    notes: true,
  });

  await followUpOnCard(page).click();
  await attach.expectChecked(1, 2);
  await attach.uncheck();
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect.poll(() => boundary.acceptances.length).toBe(2);
  const without = storyFollowUpOf(boundary.acceptances[1]);
  expect(without).toMatchObject({ identity: storyA.identity });
  expect(without).not.toHaveProperty("notes");

  await followUpOnCard(page).click();
  await attach.expectChecked(1, 2);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(boundary.acceptances).toHaveLength(2);
});

test("Attach is unavailable with No waiting notes; unreadable says so and Start still works", async ({
  page,
  frontendServices,
}) => {
  const notes = await installFrontendStoryNotes(page);
  notes.answer("open-dough", { [storyA.identity]: [sentNote()] });
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendBoardReview(page, frontendServices);
  const dialog = startSessionDialog(page, "Open Dough");
  const attach = attachStoryNotes(dialog);

  await followUpOnCard(page).click();
  await attach.expectUnavailableNone();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();

  notes.unreadable("open-dough");
  await page.reload();
  await showColumn(page, "Recently done");
  await followUpOnCard(page).click();
  await attach.expectUnavailableUnreadable();
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect.poll(() => boundary.acceptances.length).toBe(1);
  const story = storyFollowUpOf(boundary.acceptances[0]);
  expect(story).toMatchObject({ identity: storyA.identity });
  expect(story).not.toHaveProperty("notes");
});

test("file header and line menu Follow up offer Attach story notes", async ({
  page,
  frontendServices,
}) => {
  const notes = await installFrontendStoryNotes(page);
  notes.answer("open-dough", { [storyA.identity]: [waitingNote()] });
  await installFrontendLaunchBoundary(page);
  const { review } = await openFrontendDoneStoryReview(
    page,
    frontendServices,
    frontendPublishedReview([
      {
        kind: "added",
        path,
        lines: { added: 1, removed: 0 },
      },
    ]),
    (answers) => {
      answers.answerFile(frontendFileDiff(path, ["+changed"]), path);
    },
  );
  const diff = fileDiff(review, `Added ${path}`, { exact: true });
  const dialog = fileFollowUpDialog(page);
  const attach = attachStoryNotes(dialog);

  await fileFollowUp(diff, storyLabel).click();
  await expect(dialog).toBeVisible();
  await attach.expectChecked(1, 1);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();

  const label = lineNumberLabel("new", 1);
  await openLineMenu(lineNumberControl(diff, "new", 1), "pointer");
  const menu = await expectLineMenuOpen(page, label);
  await menu.getByRole("menuitem", { name: "Follow up", exact: true }).click();
  await expect(dialog).toBeVisible();
  await attach.expectChecked(1, 1);
});

test("Taken card shows notes waiting and offers no Follow up to attach them", async ({
  page,
  frontendServices,
}) => {
  const notes = await installFrontendStoryNotes(page);
  notes.answer("open-dough", {
    [storyA.identity]: [waitingNote()],
    [takenIdentity]: [waitingNote()],
  });
  await openFrontendBoardReview(page, frontendServices);
  await showColumn(page, "Taken");
  const taken = parts(page).taken.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  await storyNotesPage(page).expectWaiting(taken, 1);
  await expect(taken.getByRole("button", { name: /Follow up/ })).toHaveCount(0);
});
