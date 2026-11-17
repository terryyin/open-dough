// Built frontend, explicit notes service substitute. The real store's keeping
// and refusals are proved in ../../backend-tests/review/story-notes-*.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import { parts } from "../../tests/dashboardParts.ts";
import { showColumn } from "../../tests/boardPage.ts";
import {
  readyIdentity,
  readyStory,
  takenIdentity,
  takenStory,
} from "../../tests/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendTerminalSubstitute.ts";
import { sessionsSidebarParts } from "../../tests/sessionsSidebarPage.ts";
import {
  expectTerminalText,
  terminalPanel,
  terminalScreenParts,
} from "../../tests/terminalScreenPage.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
} from "../../src/storyNote.ts";

test("all card kinds offer general notes, blank is unsaved, newest first", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  await openFrontendBoardReview(page, frontendServices);
  const notes = storyNotesPage(page);
  const done = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await notes.expectCount(done, 0);
  await notes.open(done);
  await notes.expectContext(storyA.title, storyA.identity);
  await notes.close();
  await showColumn(page, "Taken");
  await notes.expectCount(
    parts(page).taken.getByRole("article", { name: takenStory, exact: true }),
    0,
  );
  await showColumn(page, "Backlog");
  const card = parts(page).backlog.getByRole("article", {
    name: readyStory,
    exact: true,
  });
  await notes.open(card);
  await notes.expectContext(readyStory, readyIdentity);
  await notes.add();
  await notes.type("   ");
  await notes.save();
  await notes.expectComposing("   ");
  expect(service.asked().filter(({ method }) => method === "POST")).toEqual([]);
  await notes.cancel();
  await notes.addNote("First observation");
  await notes.expectSaved();
  await notes.expectNotes(["First observation"]);
  await notes.expectNoteContext(
    "First observation",
    `${readyStory} · ${readyIdentity}`,
  );
  await notes.addNote("Later observation");
  await notes.expectSaved();
  await notes.expectNotes(["Later observation", "First observation"]);
  expect(service.changes()).toEqual([
    { action: "add", identity: readyIdentity, text: "First observation" },
    { action: "add", identity: readyIdentity, text: "Later observation" },
  ]);
  await notes.close();
  await notes.expectCount(card, 2);
  await expect(
    card.getByRole("button", { name: "Notes (2)", exact: true }),
  ).toBeFocused();
  await showColumn(page, "Recently done");
  await notes.open(done);
  await notes.expectNotes([]);
  await notes.close();
});

type NotesService = Awaited<ReturnType<typeof installFrontendStoryNotes>>;
const saveFailures: readonly (readonly [
  string,
  (service: NotesService) => void,
])[] = [
  [
    "a refused save",
    (service) => {
      service.failNextChange();
    },
  ],
  [
    "a save that cannot reach the dashboard",
    (service) => {
      service.loseNextChange();
    },
  ],
];
for (const [failure, failNext] of saveFailures)
  test(`${failure} keeps its draft and says so; saving again saves and clears it`, async ({
    page,
    frontendServices,
  }) => {
    const service = await installFrontendStoryNotes(page);
    await openFrontendBoardReview(page, frontendServices);
    const notes = storyNotesPage(page);
    const card = parts(page).recentlyDone.getByRole("article", {
      name: storyA.title,
      exact: true,
    });
    await notes.open(card);
    await notes.add();
    await notes.type("Keep the observation when saving fails.");
    failNext(service);
    await notes.save();
    await notes.expectProblem("The note could not be saved.");
    await notes.expectComposing("Keep the observation when saving fails.");
    await notes.save();
    await notes.expectSaved();
    await notes.expectNotes(["Keep the observation when saving fails."]);
  });

test("waiting and sent notes show their state; the card counts only waiting notes", async ({
  page,
  frontendServices,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  const service = await installFrontendStoryNotes(page);
  const waiting = makeMe.aStoryNote
    .withText("Still waiting")
    .identifiedAs("34810000-0000-4000-8000-000000000101")
    .please();
  const sent = makeMe.aStoryNote
    .withText("Already sent")
    .identifiedAs("34810000-0000-4000-8000-000000000102")
    .savedAt("2026-11-17T00:10:00.000Z")
    .deliveredAs("2026-11-17T00:10:00.000Z")
    .please();
  service.answer("open-dough", {
    [storyA.identity]: [waiting, sent],
    [takenIdentity]: [waiting],
  });
  await openFrontendBoardReview(page, frontendServices);
  const notes = storyNotesPage(page);
  const done = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await notes.expectCount(done, 2);
  await notes.expectWaiting(done, 1);
  await notes.open(done);
  await notes.expectNotes(["Already sent", "Still waiting"]);
  await notes.expectNoteState(0, storyNoteSentToFollowUp);
  await notes.expectNoteState(1, storyNoteWaitingForFollowUp);
  await notes.expectEntryActions(0);
  await notes.close();
  service.answer("open-dough", {
    [storyA.identity]: [sent],
    [takenIdentity]: [waiting],
  });
  await page.clock.runFor(checkIntervalMs);
  await notes.expectCount(done, 1);
  await notes.expectWaiting(done, 0);
  await notes.open(done);
  await notes.expectNoteState(0, storyNoteSentToFollowUp);
  await notes.expectEntryActions(0);
  await notes.close();
  await showColumn(page, "Taken");
  const taken = parts(page).taken.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  await notes.expectCount(taken, 1);
  await notes.expectWaiting(taken, 1);
});

test("next project read updates the count and open list; an older read cannot replace a save", async ({
  page,
  frontendServices,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  const service = await installFrontendStoryNotes(page);
  await openFrontendBoardReview(page, frontendServices);
  const notes = storyNotesPage(page);
  const card = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await notes.open(card);
  await notes.expectNotes([]);
  const remote = makeMe.aStoryNote.withText("Saved on another page").please();
  service.answer("open-dough", { [storyA.identity]: [remote] });
  await page.clock.runFor(checkIntervalMs);
  await notes.expectNotes(["Saved on another page"]);
  await notes.close();
  await notes.expectCount(card, 1);
  await notes.open(card);
  const old = service.holdNext();
  await page.clock.runFor(checkIntervalMs);
  await old.received;
  await notes.addNote("Saved here afterwards");
  await notes.expectSaved();
  old.release();
  await old.delivered;
  await notes.expectNotes(["Saved here afterwards", "Saved on another page"]);
  await notes.close();
  await notes.expectCount(card, 2);
});

test("Story notes leaves an attached terminal mounted and connected", async ({
  page,
  frontendServices,
}) => {
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Terminal kept during notes" })
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer.observingOpen(record).please(),
  );
  let attachments = 0;
  let print: (output: string) => void = () => {
    throw new Error("No terminal attachment.");
  };
  await installAttachedTerminalSubstitute(page, {
    application: {
      opening: "Terminal before notes\r\n",
      answer: (input) => input,
      attached: (attachment) => {
        attachments += 1;
        print = (output) => {
          attachment.print(output);
        };
      },
    },
  });
  await openFrontendBoardReview(page, frontendServices);
  const sidebar = sessionsSidebarParts(page);
  await sidebar.button.click();
  await sidebar.entry("Terminal kept during notes").click();
  const panel = terminalPanel(page);
  await expectTerminalText(panel, "Terminal before notes");
  const originalScreen =
    await terminalScreenParts(panel).screen.elementHandle();
  const notes = storyNotesPage(page);
  const card = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await notes.open(card, "keyboard");
  await notes.expectContext(storyA.title, storyA.identity);
  print("Terminal while notes open\r\n");
  await notes.close();
  await expectTerminalText(panel, "Terminal before notes");
  await expectTerminalText(panel, "Terminal while notes open");
  expect(await originalScreen.evaluate((element) => element.isConnected)).toBe(
    true,
  );
  expect(attachments).toBe(1);
  await expect(
    card.getByRole("button", { name: "Notes", exact: true }),
  ).toBeFocused();
});
