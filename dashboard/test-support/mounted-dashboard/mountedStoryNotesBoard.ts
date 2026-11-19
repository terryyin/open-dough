// The mounted notes board the story-notes cases open, with its notes answers on
// the shared rule, a held next notes answer and the fixture's timers.
import { vi } from "vitest";
import { commands, page } from "vitest/browser";
import type { StoryNotesArrangement } from "../support/mountedDashboardCommands.ts";
import { actSettled } from "./mountedActInput.ts";
import { mountAnsweredDashboard } from "./mountedDashboard.ts";
import { storyNotesPage } from "./mountedStoryNotesPage.ts";

type Column = "Backlog" | "Taken" | "Recently done";
// The wide board the notes cases open at.
export const wide = { width: 1280, height: 720 };

// A story's card in a board column, by its title.
export const boardCard = (column: Column, title: string) =>
  page
    .getByRole("region", { name: column, exact: true })
    .getByRole("article", { name: title, exact: true });

// Opens the wide board on the notes arrangement the Node command builds.
// With `openSession`, the Sessions sidebar lists an open session of that title.
export async function mountStoryNotesBoard(
  arrangement?: StoryNotesArrangement,
  openSession?: string,
) {
  const arranged = await commands.storyNotesBoard(arrangement, openSession);
  const dashboard = await mountAnsweredDashboard({
    answers: arranged.answers,
    boardPositionKey: arranged.boardPositionKey,
    viewport: wide,
  });
  const { note } = arranged;
  return {
    project: arranged.project,
    identities: arranged.identities,
    get note() {
      if (!note) throw new Error("The board arranged no note.");
      return note;
    },
    arrangedNotes: arranged.notes,
    cards: arranged.cards,
    notes: storyNotesPage(),
    notesService: dashboard.notes,
    // Holds the next notes answer; `release` delivers it inside act.
    holdNext: () => {
      const held = dashboard.holdNextNotes();
      return {
        received: held.received,
        release: () => actSettled(held.release),
      };
    },
    card: boardCard,
    // Advances the fixture's timers, as the built app's clock ran.
    runFor: async (ms: number) => {
      await actSettled(() => vi.advanceTimersByTimeAsync(ms));
    },
  };
}
