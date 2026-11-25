import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { storyNotes } from "../../dashboard/server/storyNotes.ts";
import {
  storyNotesFor,
  storyNoteSentToFollowUp,
  storyNoteVersion,
} from "../../dashboard/src/storyNote.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { openDoneStoryCard } from "../../dashboard/test-support/doneStoryReviewPage.ts";
import {
  expectNoLaunchDialog,
  startSessionDialog,
  storyLaunchChoices,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { repository } from "../../dashboard/test-support/recentlyDoneRecords.ts";
import { attachStoryNotes } from "../../dashboard/test-support/support/attachStoryNotesPage.ts";
import {
  expect,
  keptRecord,
  workingCursorTest as test,
} from "../../dashboard/test-support/support/cursorStart.ts";
import {
  fileFollowUp,
  followUpComposer,
} from "../../dashboard/test-support/support/fileFollowUpPage.ts";
import {
  doneStoryFiles,
  recoverStory,
  storyNameOf,
} from "../../dashboard/test-support/support/followUpStories.ts";
import { storyNotesPage } from "../../dashboard/test-support/support/storyNotesPage.ts";
import {
  seedStoryNotes,
  storyNotesFile,
} from "../../dashboard/test-support/support/storyNotesStore.ts";

async function keptStoryNote(home: string, id: string) {
  const stored = await storyNotes(storyNotesFile(home), "open-dough");
  return storyNotesFor(stored, recoverStory.identity).notes.find(
    (note) => note.id === id,
  );
}

test.use({ cursorHoldPaint: true, launchWaitEnd: true });

test("uncertain Cursor first input leaves notes waiting until later confirmation", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await test.step("Given a published done story", async () => {
    const revision = await origin.publishRevision({
      message: "Complete the follow-up story",
      files: doneStoryFiles([recoverStory], new Date().toISOString()),
    });
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      repository,
      revision,
      follows: true,
    });
  });
  const waiting = await test.step("And a saved story note", () => {
    const note = makeMe.aStoryNote
      .withText("Paste still drops the last line on iPad.")
      .please();
    seedStoryNotes(dashboard.home, { [recoverStory.identity]: [note] });
    return note;
  });
  const card = await test.step("When I open the done story", () =>
    openDoneStoryCard(page, recoverStory.title));
  await test.step("And I open its Follow up", () =>
    fileFollowUp(card, storyNameOf(recoverStory)).click());
  await test.step("And I choose Cursor", () =>
    storyLaunchChoices(startSessionDialog(page, "Open Dough")).chooseHost(
      "cursor",
    ));
  const dialog = await test.step("And I attach story notes", async () => {
    const composer = startSessionDialog(page, "Open Dough", "cursor");
    await attachStoryNotes(composer).select();
    return composer;
  });
  await test.step("And I start the follow-up", () =>
    followUpComposer(dialog).start("Investigate why Paste drops a line"));
  await test.step("And Start's wait ends while Cursor has yet to paint", async () => {
    await expect.poll(() => cursor.attaches()).toHaveLength(1);
    await dashboard.endLaunchWait();
    await expectNoLaunchDialog(page);
  });
  const uncertain =
    await test.step("Then Cursor keeps the uncertain input", () => {
      const record = keptRecord(dashboard.home);
      expect(record).toMatchObject({
        session: { host: "cursor", sessionId: cursor.sessionId },
        firstInput: {
          state: "uncertain",
          instruction: expect.stringContaining(waiting.text),
        },
      });
      return record;
    });
  await test.step("And it keeps the admitted note version", () => {
    expect(uncertain.request).toHaveProperty("followUp.notes", [
      { id: waiting.id, version: storyNoteVersion(waiting) },
    ]);
  });
  await test.step("And the attached note is still waiting in the store", async () => {
    const stored = await keptStoryNote(dashboard.home, waiting.id);
    expect(stored).toBeDefined();
    expect(stored?.delivered).toBeUndefined();
  });
  await test.step("And the card still shows one waiting note", () =>
    storyNotesPage(page).expectWaiting(card, 1));
  await test.step("When Cursor paints its prompt", () => {
    cursor.releasePaint();
  });
  await test.step("Then the same Cursor session confirms the kept input", async () => {
    await expect
      .poll(() => keptRecord(dashboard.home))
      .toMatchObject({
        session: uncertain.session,
        firstInput: {
          state: "confirmed",
          instruction: uncertain.firstInput?.instruction,
        },
      });
    expect(cursor.attaches()).toHaveLength(1);
  });
  await test.step("And the store marks the admitted version sent", async () => {
    await expect
      .poll(
        async () =>
          (await keptStoryNote(dashboard.home, waiting.id))?.delivered,
      )
      .toBe(storyNoteVersion(waiting));
  });
  const notes = await test.step("When I reopen the story's notes", async () => {
    const notes = storyNotesPage(page);
    await notes.open(await openDoneStoryCard(page, recoverStory.title));
    return notes;
  });
  await test.step("Then Story notes shows the note as sent", async () => {
    await notes.expectNotes([waiting.text]);
    await notes.expectNoteState(0, storyNoteSentToFollowUp);
  });
});
