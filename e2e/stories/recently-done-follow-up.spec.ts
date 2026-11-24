import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  parts,
  standaloneSessionName,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { publishFiles } from "../../dashboard/test-support/publishedOrigin.ts";
import { listed } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import {
  publishedFiles,
  repository,
  revision,
} from "../../dashboard/test-support/recentlyDoneRecords.ts";
import { stored } from "../../dashboard/test-support/support/codexLaunch.ts";
import {
  doneStoryRecords,
  otherStory,
  quietStorySessions,
  recoverStory,
  reopenableStory,
  storyContextOf,
  storyItems,
  storyNameOf,
} from "../../dashboard/test-support/support/followUpStories.ts";
import { radio } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { readFinalReportControl } from "../../dashboard/test-support/finalReportPages.ts";
import { attachStoryNotes } from "../../dashboard/test-support/support/attachStoryNotesPage.ts";
import { followUpComposer } from "../../dashboard/test-support/support/fileFollowUpPage.ts";
import { storyNotesPage } from "../../dashboard/test-support/support/storyNotesPage.ts";
import { seedStoryNotes } from "../../dashboard/test-support/support/storyNotesStore.ts";
import { storyNoteSentToFollowUp } from "../../dashboard/src/storyNote.ts";

test.use({ projectFolders: ["open-dough"] });

const cardOf = (page: Page, title: string) =>
  parts(page).recentlyDone.getByRole("article", { name: title, exact: true });

const followUp = (card: Locator, story: typeof recoverStory) =>
  card.getByRole("button", { name: `Follow up ${storyNameOf(story)}` });

const contextList = (dialog: Locator) =>
  dialog.getByRole("list", { name: "Follow-up context" }).getByRole("listitem");

test("a done story's Follow up sends only the retained session selected through the composer", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const completedAt = new Date(now - 60 * 60_000).toISOString();
  const doneAt = new Date(now - 30 * 60_000);
  const refinement = {
    instruction: "Compare the paste toolbar to mobile.",
    report: "Only the iPad path loses a line.",
  };
  const execution = {
    instruction: "Retain the terminal focus after paste.",
    report: "Implemented keyboard recovery.",
  };
  const quiet = quietStorySessions(dashboard.home, recoverStory, doneAt, {
    refinement,
    execution,
  });
  const reopenable = makeMe.aLaunchRecord
    .refining(reopenableStory)
    .inClaudeSession({
      sessionId: listed(dashboard, now, reopenableStory.title, 50 * 60_000),
      shortId: "reopen",
    })
    .launchedAt(new Date(now - 50 * 60_000).toISOString())
    .markedDoneAt(doneAt.toISOString())
    .please();
  keepLaunchRecords(dashboard, [...quiet, reopenable]);
  await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles({
      doneRecords: doneStoryRecords(
        [recoverStory, otherStory, reopenableStory],
        completedAt,
      ),
    }),
  });
  dashboard.claudeScenario("launched");
  await page.goto("/");
  const card = cardOf(page, recoverStory.title);
  const dialog = startSessionDialog(page, "Open Dough");
  const composer = followUpComposer(dialog);

  await test.step("a card holding a session that opens its terminal offers no Follow up", async () => {
    const held = cardOf(page, reopenableStory.title);
    await expect(openTerminalControl(held)).toBeVisible();
    await expect(followUp(held, reopenableStory)).toHaveCount(0);
  });

  await test.step("a done story holding no session lists its facts and says no session context is retained", async () => {
    await followUp(cardOf(page, otherStory.title), otherStory).click();
    await expect(dialog).toContainText(`Follows up ${storyNameOf(otherStory)}`);
    await expect(contextList(dialog)).toHaveText(
      storyItems(otherStory, completedAt, "no session"),
    );
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
  });

  await test.step("the card whose sessions cannot be reopened keeps Read final report and offers Follow up, which names the story and lists its context", async () => {
    // Both the refinement's and the execution's worktrees were retired.
    for (const workflow of ["Refinement", "Execution"])
      await expect(
        readFinalReportControl(
          card.getByRole("article", {
            name: `${workflow} session for ${recoverStory.title}`,
          }),
        ),
      ).toBeVisible();
    await expect(openTerminalControl(card)).toHaveCount(0);
    await followUp(card, recoverStory).click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      `Follows up ${storyNameOf(recoverStory)}`,
    );
    await expect(contextList(dialog)).toHaveText(
      storyItems(recoverStory, completedAt, "unselected"),
    );
    await expect(startSessionField(dialog)).toHaveValue("");
    for (const [group, name] of [
      ["Workspace", "Execution checkout"],
      ["After checks", "Wait for review"],
    ] as const)
      await expect(radio(dialog, group, name)).toBeChecked();
  });

  const text = "Paste drops the last line on iPad";
  const refined = composer.session(/-refined$/);
  const executed = composer.session(/-executed$/);
  await test.step("When I attach only the refinement", async () => {
    await composer.expectSessionChoices(2);
    await refined.toggleSelectionByKeyboard();
    await executed.expectSelection(false);
  });
  await test.step("Start sends the selection and the new session names the source story", async () => {
    await composer.start(text);
    const taken = parts(page).taken.getByRole("article", {
      name: standaloneSessionName("Ad hoc", text),
    });
    await expect(taken).toBeVisible();
    await expect(
      taken.getByRole("link", { name: recoverStory.title, exact: true }),
    ).toBeVisible();
    await expect(dialog).toBeHidden();
    const [started, ...others] = dashboard.claudeLaunches();
    expect(others).toEqual([]);
    expect(started?.instruction).toContain(
      storyContextOf(recoverStory, completedAt, "unselected", text),
    );
    expect(started?.instruction?.match(/^<session>$/gm)).toEqual(["<session>"]);
    expect(started?.instruction).toContain(refinement.instruction);
    expect(started?.instruction).toContain(refinement.report);
    expect(started?.instruction).not.toContain(execution.instruction);
    expect(started?.instruction).not.toContain(execution.report);
  });

  await test.step("the card stays in Recently done as it was, and its sessions as kept", async () => {
    await expect(sessionEntriesIn(card)).toHaveCount(2);
    await expect(followUp(card, recoverStory)).toBeVisible();
    expect(stored(dashboard.home).slice(0, 3)).toEqual([...quiet, reopenable]);
  });
});

test("starting a follow-up with attached notes marks them sent on the card and in Story notes", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const completedAt = new Date(now - 60 * 60_000).toISOString();
  const doneAt = new Date(now - 30 * 60_000);
  const quiet = quietStorySessions(dashboard.home, recoverStory, doneAt);
  keepLaunchRecords(dashboard, quiet);
  const waiting = makeMe.aStoryNote
    .identifiedAs("34840000-0000-4000-8000-000000000001")
    .withText("Card follow-up should mark this note sent.")
    .savedAt("2026-11-17T12:00:00.000Z")
    .please();
  seedStoryNotes(dashboard.home, { [recoverStory.identity]: [waiting] });
  await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles({
      doneRecords: doneStoryRecords([recoverStory], completedAt),
    }),
  });
  dashboard.claudeScenario("launched");
  await page.goto("/");
  const card = cardOf(page, recoverStory.title);
  const notes = storyNotesPage(page);
  const dialog = startSessionDialog(page, "Open Dough");
  const attach = attachStoryNotes(dialog);

  await notes.expectWaiting(card, 1);
  await followUp(card, recoverStory).click();
  await attach.expectChoice(false, 1, 1);
  await attach.select();
  const text = "Follow up with the waiting note";
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    parts(page).taken.getByRole("article", {
      name: standaloneSessionName("Ad hoc", text),
    }),
  ).toBeVisible();
  await expect(dialog).toBeHidden();

  // Notes refresh on the shared check interval; reload reads the delivered mark.
  await page.reload();
  await notes.expectWaiting(card, 0);
  await notes.expectCount(card, 1);
  await notes.open(card);
  await notes.expectNotes([waiting.text]);
  await notes.expectNoteState(0, storyNoteSentToFollowUp);
  await notes.expectEntryActions(0);
  await notes.close();
});
