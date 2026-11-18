import type { BrowserCommandContext } from "vitest/node";
import { largeBacklog, queuedTitles } from "../accessibleBoard.ts";
import { boardPositionKey } from "../boardColumnNavigation.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { StoryNote, StoryNoteContext } from "../../src/storyNote.ts";
import { boardReviewDoneRecords, storyA } from "../recentlyDoneReviewState.ts";
import { readyStory, takenStory } from "../launchJourney.ts";
import {
  defaultFrontendServiceState,
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { openDoughSource } from "./frontendPublishedFixtures.ts";

export const mountedDashboardCommands = {
  dashboardServiceAnswers,
  phoneBoardPublication,
  storyNotesBoard,
};

function serviceAnswers(
  state: FrontendServiceState,
  notes?: Record<string, Record<string, StoryNote[]>>,
) {
  const {
    projects,
    revision,
    backlog,
    files,
    locations,
    candidates,
    machine,
    hostStatus,
    doneBySource,
  } = state;
  return {
    notes,
    projects,
    revision,
    backlog,
    files,
    locations,
    candidates,
    machine,
    hostStatus,
    doneBySource,
  };
}

export type MountedServiceAnswers = ReturnType<typeof serviceAnswers>;

function dashboardServiceAnswers() {
  return {
    answers: serviceAnswers(defaultFrontendServiceState()),
    boardPositionKey,
  };
}

function phoneBoardPublication(...[, long]: [BrowserCommandContext, boolean]) {
  return {
    answers: serviceAnswers(
      defaultFrontendServiceState(long ? { backlog: largeBacklog } : {}),
    ),
    boardPositionKey,
    readyStory,
    titles: long
      ? {
          backlog: queuedTitles,
          taken: ["Repair the installer's update report"],
        }
      : takenBacklogStories,
  };
}

// The saved note a notes board arranges: its text and line context, and the
// version a follow-up session was sent, when one was.
export type ArrangedStoryNote = {
  text?: string;
  context?: StoryNoteContext;
  sentAt?: string;
};

function arrangedNote({ text, context, sentAt }: ArrangedStoryNote) {
  let note = makeMe.aStoryNote;
  if (text !== undefined) note = note.withText(text);
  if (context !== undefined) note = note.withContext(context);
  if (sentAt !== undefined) note = note.savedAt(sentAt).deliveredAs(sentAt);
  return note.please();
}

// The recently done board with one saved note on its first done story, its
// project, and the card of each kind the notes cases read.
function storyNotesBoard(
  ...[, arranged = {}]: [BrowserCommandContext, ArrangedStoryNote?]
) {
  const project = openDoughSource.id;
  const state = defaultFrontendServiceState();
  putFrontendDoneRecords(state, project, boardReviewDoneRecords());
  const note = arrangedNote(arranged);
  return {
    answers: serviceAnswers(state, {
      [project]: { [storyA.identity]: [note] },
    }),
    boardPositionKey,
    project,
    identity: storyA.identity,
    note,
    cards: { done: storyA.title, taken: takenStory, backlog: readyStory },
  };
}

declare module "vitest/browser" {
  interface BrowserCommands {
    dashboardServiceAnswers(): Promise<
      ReturnType<typeof dashboardServiceAnswers>
    >;
    phoneBoardPublication(
      long: boolean,
    ): Promise<ReturnType<typeof phoneBoardPublication>>;
    storyNotesBoard(
      note?: ArrangedStoryNote,
    ): Promise<ReturnType<typeof storyNotesBoard>>;
  }
}
