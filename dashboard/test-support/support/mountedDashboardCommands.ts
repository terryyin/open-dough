import type { BrowserCommandContext } from "vitest/node";
import { largeBacklog, queuedTitles } from "../accessibleBoard.ts";
import { boardPositionKey } from "../boardColumnNavigation.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { StoryNote, StoryNoteContext } from "../../src/storyNote.ts";
import { boardReviewDoneRecords, storyA } from "../recentlyDoneReviewState.ts";
import {
  readyIdentity,
  readyStory,
  takenIdentity,
  takenStory,
} from "../launchJourney.ts";
import {
  defaultFrontendServiceState,
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { openDoughSource } from "./frontendPublishedFixtures.ts";
import type {
  ReviewedFileDiff,
  StoryReview,
} from "../../src/storyReviewContract.ts";
import { retainedNoteBoards } from "./mountedRetainedNoteCommands.ts";

export const mountedDashboardCommands = {
  dashboardServiceAnswers,
  phoneBoardPublication,
  storyNotesBoard,
  storyNote,
  retainedNoteBoards,
};

export function serviceAnswers(
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

// The story review a board answers: its snapshot and each file's diff by path.
export type MountedReviewAnswers = {
  snapshot: StoryReview;
  files: Record<string, ReviewedFileDiff>;
};

export type MountedServiceAnswers = ReturnType<typeof serviceAnswers> & {
  review?: MountedReviewAnswers;
};

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

// A saved note built in Node, for a later read to answer.
function storyNote(
  ...[, arranged]: [BrowserCommandContext, ArrangedStoryNote]
) {
  return arrangedNote(arranged);
}

// The notes a board arranges: one saved note on the first done story, no
// notes, or a waiting and a sent note there with the waiting one on the taken
// story.
export type StoryNotesArrangement =
  ArrangedStoryNote | "no notes" | "waiting and sent";

function arrangedNotes(arranged: StoryNotesArrangement) {
  if (arranged === "no notes") return {};
  if (arranged !== "waiting and sent")
    return { [storyA.identity]: [arrangedNote(arranged)] };
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
  return { [storyA.identity]: [waiting, sent], [takenIdentity]: [waiting] };
}

// The recently done board with its arranged notes, its project, and the card
// and identity of each kind the notes cases read.
function storyNotesBoard(
  ...[, arranged = {}]: [BrowserCommandContext, StoryNotesArrangement?]
) {
  const project = openDoughSource.id;
  const state = defaultFrontendServiceState();
  putFrontendDoneRecords(state, project, boardReviewDoneRecords());
  const notes = arrangedNotes(arranged);
  const [note] = notes[storyA.identity] ?? [];
  return {
    answers: serviceAnswers(state, { [project]: notes }),
    boardPositionKey,
    project,
    note,
    notes,
    cards: { done: storyA.title, taken: takenStory, backlog: readyStory },
    identities: {
      done: storyA.identity,
      taken: takenIdentity,
      backlog: readyIdentity,
    },
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
    storyNote(arranged: ArrangedStoryNote): Promise<StoryNote>;
    storyNotesBoard(
      arranged?: StoryNotesArrangement,
    ): Promise<ReturnType<typeof storyNotesBoard>>;
  }
}
