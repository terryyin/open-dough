// StoryNotes control mounted over a case-supplied notes source: the case
// answers reads and changes, and owns the clock for the next check.
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, onTestFinished, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { StoryNotes } from "../../src/StoryNotesControl.tsx";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import {
  storyNotesWaitingDescription,
  type StoryNote,
  type StoryNotesAnswer,
} from "../../src/storyNote.ts";
import {
  storyNotesUnreadable,
  type StoryNotesReadSource,
} from "../../src/storyNotesReadSource.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

const project = "keep-notes-project";
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

function present<T>(found: T | null | undefined, what: string): T {
  if (found === null || found === undefined) throw new Error(`No ${what}`);
  return found;
}

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
async function mountControl(source: StoryNotesReadSource) {
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  onTestFinished(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
  });
  const reads = pageReadsSupplying({ storyNotes: source });
  await act(() => {
    root.render(
      createElement(
        PageReadsOnPage,
        { reads },
        createElement(StoryNotes, { sourceId: project, identity, title }),
      ),
    );
    return Promise.resolve();
  });
  const opener = () =>
    present(
      host.querySelector<HTMLButtonElement>("button[aria-haspopup]"),
      "notes control",
    );
  const dialog = () => host.querySelector("dialog");
  const button = (name: string) =>
    present(
      [...host.querySelectorAll("button")].find(
        (candidate) => candidate.textContent === name,
      ),
      `"${name}" button`,
    );
  const press = (control: HTMLButtonElement) =>
    act(() => {
      control.click();
      return Promise.resolve();
    });
  return {
    opener,
    dialog,
    label: () => opener().getAttribute("aria-label"),
    status: () =>
      [...host.querySelectorAll('[role="status"]')]
        .filter((found) => !dialog()?.contains(found))
        .map((found) => found.textContent),
    open: () => press(opener()),
    close: () => {
      const shown = present(dialog(), "dialog");
      return act(async () => {
        const closed = new Promise((resolve) => {
          shown.addEventListener("close", resolve, { once: true });
        });
        button("Close").click();
        await closed;
      });
    },
    press: (name: string) => press(button(name)),
    type: (text: string) => {
      present(dialog()?.querySelector("textarea"), "note text").value = text;
    },
    listed: () =>
      [...(dialog()?.querySelectorAll(".story-note-text") ?? [])].map(
        (found) => found.textContent,
      ),
  };
}

const answering =
  (answer: StoryNotesAnswer): StoryNotesReadSource =>
  () =>
    Promise.resolve(answer);

test("the control counts the story's notes and describes the waiting ones", async () => {
  const control = await mountControl(answering(notesAnswer([waiting, sent])));
  expect(control.label()).toBe("Notes (2)");
  expect(control.status()).toEqual([storyNotesWaitingDescription(1)]);
});

test("an unreadable answer replaces the count with the problem", async () => {
  const control = await mountControl(answering({ kind: "unreadable" }));
  expect(control.label()).toBe("Notes");
  expect(control.status()).toEqual([storyNotesUnreadable]);
});

test("the next check updates the count and the open list", async () => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  let stored: readonly StoryNote[] = [];
  const control = await mountControl(() =>
    Promise.resolve(notesAnswer(stored)),
  );
  await control.open();
  expect(control.listed()).toEqual([]);
  stored = [sent];
  await act(() => vi.advanceTimersByTimeAsync(checkIntervalMs));
  expect(control.listed()).toEqual(["Already sent"]);
  expect(control.label()).toBe("Notes (1)");
});

test("an older read answering after a save keeps the save's notes", async () => {
  const saved = makeMe.aStoryNote.withText("Saved here").please();
  const reads: ((answer: StoryNotesAnswer) => void)[] = [];
  const control = await mountControl((...[, change]) =>
    change === undefined
      ? new Promise((resolve) => reads.push(resolve))
      : Promise.resolve(notesAnswer([saved])),
  );
  await control.open();
  await control.press("Add note");
  control.type("Saved here");
  await control.press("Save note");
  await act(() => {
    present(reads.shift(), "pending read")(notesAnswer([]));
    return Promise.resolve();
  });
  expect(control.listed()).toEqual(["Saved here"]);
  expect(control.label()).toBe("Notes (1)");
});

test("the keyboard opens Story notes from the control", async () => {
  const control = await mountControl(answering(notesAnswer([sent])));
  control.opener().focus();
  await act(() => userEvent.keyboard("{Enter}"));
  expect(control.dialog()?.open).toBe(true);
});

test("closing Story notes returns focus to the control", async () => {
  const control = await mountControl(answering(notesAnswer([sent])));
  await control.open();
  await control.close();
  expect(control.dialog()).toBeNull();
  expect(document.activeElement).toBe(control.opener());
});
