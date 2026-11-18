// The mounted notes board the story-notes cases open, with its notes answers on the
// shared rule and the fixture's timers; and its Story notes page: the cues of
// the Playwright page object (../support/storyNotesPage.ts) under the same
// names, reading the same names (../storyNotesNames.ts).
import { act } from "react";
import { expect, vi } from "vitest";
import { commands, page, type Locator } from "vitest/browser";
import { storyNotesNames as n } from "../storyNotesNames.ts";
import { mountAnsweredDashboard } from "./mountedDashboard.ts";

type Column = "Backlog" | "Taken" | "Recently done";
const wide = { width: 1280, height: 720 };

async function click(locator: Locator) {
  await act(async () => {
    const element = await locator.findElement();
    if (!(element instanceof HTMLElement))
      throw new Error(`Expected a control: ${locator.selector}`);
    element.click();
  });
}

function storyNotesPage() {
  const dialog = page.getByRole("dialog", { name: n.dialog, exact: true });
  const field = dialog.getByRole("textbox", { name: n.field, exact: true });
  return {
    expectCount: async (card: Locator, count: number) => {
      await expect
        .element(
          card.getByRole("button", { name: n.count(count), exact: true }),
        )
        .toBeVisible();
    },
    expectUnreadable: async (card: Locator, message: string) => {
      await expect
        .element(card.getByRole("status").filter({ hasText: message }))
        .toBeVisible();
      expect(card.getByRole("button", { name: n.counted }).elements()).toEqual(
        [],
      );
    },
    open: async (card: Locator) => {
      await click(card.getByRole("button", { name: n.control }));
      await expect.element(dialog).toBeVisible();
    },
    expectProblem: async (message: string) => {
      await expect
        .element(dialog.getByRole("alert").filter({ hasText: message }))
        .toBeVisible();
    },
    add: async () => {
      await click(dialog.getByRole("button", { name: n.add, exact: true }));
      await expect
        .element(dialog.getByRole("heading", { name: n.add, exact: true }))
        .toBeVisible();
    },
    type: async (text: string) => {
      await field.fill(text);
    },
    save: async () => {
      await click(dialog.getByRole("button", { name: n.save, exact: true }));
    },
    expectComposing: async (text: string) => {
      await expect.element(field).toBeVisible();
      await expect.element(field).toHaveValue(text);
    },
    close: async () => {
      await click(dialog.getByRole("button", { name: n.close, exact: true }));
      await expect.element(dialog).not.toBeInTheDocument();
    },
  };
}

// Opens the wide board on the notes arrangement the Node command builds.
export async function mountStoryNotesBoard() {
  const arranged = await commands.storyNotesBoard();
  const dashboard = await mountAnsweredDashboard({
    answers: arranged.answers,
    boardPositionKey: arranged.boardPositionKey,
    viewport: wide,
  });
  return {
    project: arranged.project,
    cards: arranged.cards,
    notes: storyNotesPage(),
    notesService: dashboard.notes,
    card: (column: Column, title: string) =>
      page
        .getByRole("region", { name: column, exact: true })
        .getByRole("article", { name: title, exact: true }),
    // Advances the fixture's timers, as the built app's clock ran.
    runFor: async (ms: number) => {
      await act(() => vi.advanceTimersByTimeAsync(ms));
    },
  };
}
