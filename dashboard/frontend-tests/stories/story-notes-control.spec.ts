// The Notes control and its dialog read and change one subscribed project state.
import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { StoryNotesControl } from "../../src/StoryNotesControl.tsx";
import { localSettingState } from "../../src/localSettingState.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import type {
  StoryNote,
  StoryNoteChange,
  StoryNotesAnswer,
} from "../../src/storyNote.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { storyNotesNames as names } from "../../test-support/storyNotesNames.ts";

const identity = "SEED-001#keep-notes";
const title = "Keep notes beside a story";
const notesAnswer = (notes: readonly StoryNote[]): StoryNotesAnswer => ({
  kind: "notes",
  notes: { [identity]: [...notes] },
});
const sent = makeMe.aStoryNote
  .withText("Already sent")
  .deliveredAs("2026-11-17T00:00:00.000Z")
  .please();
const waiting = makeMe.aStoryNote
  .identifiedAs("34800000-0000-4000-8000-000000000002")
  .withText("Still waiting")
  .please();

const opener = page.getByRole("button", {
  name: names.control,
  includeHidden: true,
});
const dialog = page.getByRole("dialog", { name: names.dialog });
const savedNotes = dialog.getByRole("list", { name: names.savedNotes });

async function mountNotes(
  request: (change?: StoryNoteChange) => Promise<StoryNotesAnswer>,
) {
  const state = localSettingState(request);
  const subscribe = vi.fn(state.subscribe);
  const subscribed = { ...state, subscribe };
  const reads = pageReadsSupplying({});
  const view = (storyTitle: string) =>
    createElement(
      PageReadsOnPage,
      { reads },
      createElement(StoryNotesControl, {
        identity,
        title: storyTitle,
        state: subscribed,
      }),
    );
  const { rerender } = await mountComponent(view(title));
  return {
    rerender: (storyTitle: string) => {
      rerender(view(storyTitle));
    },
    subscribe,
  };
}

test("the control counts the story's notes and describes the waiting ones", async () => {
  await mountNotes(() => Promise.resolve(notesAnswer([waiting, sent])));
  await expect.element(opener).toHaveAccessibleName("Notes (2)");
  await expect
    .element(page.getByRole("status"))
    .toHaveTextContent("1 note waiting");
  await expect.element(opener).toHaveAccessibleDescription("1 note waiting");
});

test("an unreadable answer replaces the count with the problem", async () => {
  await mountNotes(() => Promise.resolve({ kind: "unreadable" }));
  await expect.element(opener).toHaveAccessibleName("Notes");
  await expect
    .element(page.getByRole("status"))
    .toHaveTextContent("The notes could not be read.");
  await expect
    .element(opener)
    .toHaveAccessibleDescription("The notes could not be read.");
});

test("the next check updates the count and the open list", async ({
  onTestFinished,
}) => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  let stored: readonly StoryNote[] = [];
  const request = vi.fn(() => Promise.resolve(notesAnswer(stored)));
  const { subscribe } = await mountNotes(request);

  await expect.poll(() => request.mock.calls.length).toBe(1);
  await userEvent.click(opener);
  await expect.element(dialog).toBeVisible();
  expect(savedNotes.getByRole("listitem").elements()).toHaveLength(0);
  expect(subscribe).toHaveBeenCalledTimes(1);

  stored = [sent];
  await vi.advanceTimersByTimeAsync(checkIntervalMs);

  await expect.element(savedNotes.getByText(sent.text)).toBeVisible();
  await expect.element(opener).toHaveAccessibleName("Notes (1)");
  expect(request).toHaveBeenCalledTimes(2);
  expect(subscribe).toHaveBeenCalledTimes(1);
});

test("an older read answering after a save keeps the save's notes", async () => {
  const saved = makeMe.aStoryNote.withText("Saved here").please();
  let answerOlderRead!: (answer: StoryNotesAnswer) => void;
  const olderRead = new Promise<StoryNotesAnswer>((resolve) => {
    answerOlderRead = resolve;
  });
  const request = vi.fn((change?: StoryNoteChange) =>
    change === undefined ? olderRead : Promise.resolve(notesAnswer([saved])),
  );
  const { rerender } = await mountNotes(request);

  await expect.poll(() => request.mock.calls).toEqual([[]]);
  await userEvent.click(opener);
  await userEvent.click(dialog.getByRole("button", { name: names.add }));
  await userEvent.fill(
    dialog.getByRole("textbox", { name: names.field }),
    saved.text,
  );
  await userEvent.click(dialog.getByRole("button", { name: names.save }));

  await expect.element(savedNotes.getByText(saved.text)).toBeVisible();
  await expect.element(opener).toHaveAccessibleName("Notes (1)");
  expect(request.mock.calls).toEqual([
    [],
    [{ action: "add", identity, text: saved.text }],
  ]);

  answerOlderRead(notesAnswer([]));
  await olderRead;
  const refreshedTitle = "Keep notes beside this story";
  rerender(refreshedTitle);
  await expect
    .element(dialog.getByText(refreshedTitle, { exact: true }).first())
    .toBeVisible();
  await expect.element(savedNotes.getByText(saved.text)).toBeVisible();
  await expect.element(opener).toHaveAccessibleName("Notes (1)");
});

test("Enter opens Story notes and Close returns focus to its control", async () => {
  await mountNotes(() => Promise.resolve(notesAnswer([sent])));
  await expect.element(opener).toHaveAccessibleName("Notes (1)");
  opener.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(dialog).toBeVisible();

  await userEvent.click(dialog.getByRole("button", { name: names.close }));

  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
});
