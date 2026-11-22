// The page contexts the Review changes panel reads, as typed values: Doughnut
// as the page's one project, a closed Sessions sidebar, a machine with no
// sessions, the case's review source answering the panel's reads, and the
// case's notes source answering Doughnut's story notes.
import { createElement, type ReactElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { RecentlyDoneLinkSources } from "../../src/recentlyDoneShownLinks.ts";
import type {
  ReviewedStorySubject,
  ReviewedWorkSubject,
} from "../../src/reviewedWorkSubject.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import {
  SessionsSidebarOnPage,
  type SessionsSidebarState,
} from "../../src/SessionsSidebar.tsx";
import type { StoryNotesReadSource } from "../../src/storyNotesReadSource.ts";
import type { StoryNote, StoryNoteChange } from "../../src/storyNote.ts";

const doughnut = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
  })
  .please();

// A Done story of Doughnut, by the title its review names, and an ad hoc
// session of it.
export const doneStoryTitle = "Done story";
export const doneStory: ReviewedStorySubject = {
  source: doughnut.id,
  identity: "SEED-1#done-story",
};
export const adHocSession: ReviewedWorkSubject = {
  source: doughnut.id,
  host: "claude",
  session: "74800000-0000-4000-8000-0000000000aa",
};

const sidebar: SessionsSidebarState = {
  open: false,
  toggle: () => undefined,
  closeOverPage: () => undefined,
  records: [],
  alerts: { available: true },
};

// No session is started, kept or running on the machine.
const launches = machineSessionsAnswering(makeMe.aMachineAnswer.please());

// Doughnut's published work, the reviewed story among its Taken stories, so
// its notes can be added from a diff.
const story = "https://example.test/done-story";
const work = {
  ...makeMe.aPublishedWork.of(doughnut).at("7".repeat(40)).please(),
  taken: [
    {
      identity: doneStory.identity,
      title: doneStoryTitle,
      canonical: { kind: "external" as const, recorded: story, url: story },
    },
  ],
};

// Doughnut's notes kept as the machine keeps them: each added note saved on
// its story, and every change remembered as sent.
export function notesKept() {
  const changes: StoryNoteChange[] = [];
  const kept: Record<string, StoryNote[]> = {};
  const source: StoryNotesReadSource = (...[, change]) => {
    if (change) changes.push(structuredClone(change));
    if (change?.action === "add") {
      const note = makeMe.aStoryNote
        .identifiedAs(
          `74800000-0000-4000-8000-${String(changes.length).padStart(12, "0")}`,
        )
        .withText(change.text);
      (kept[change.identity] ??= []).push(
        (change.context ? note.withContext(change.context) : note).please(),
      );
    }
    return Promise.resolve({ kind: "notes", notes: structuredClone(kept) });
  };
  return { source, changes: () => structuredClone(changes) };
}

// `panel` on the page, its reviews read from `source`; given `notes`, the
// reviewed story is Taken in Doughnut's work and its notes read from `notes`.
export function onReviewPage(
  source: ReviewSource,
  panel: ReactElement,
  notes?: StoryNotesReadSource,
) {
  const withNotes =
    notes === undefined
      ? panel
      : createElement(RecentlyDoneLinkSources, {
          value: { projects: [doughnut], selected: doughnut.id, work },
          children: panel,
        });
  return createElement(ProjectsOnPage, {
    projects: [doughnut],
    replaceProjects: () => undefined,
    children: createElement(SessionsSidebarOnPage, {
      value: sidebar,
      children: createElement(LaunchesOnPage, {
        value: launches,
        children: createElement(PageReadsOnPage, {
          reads: pageReadsSupplying(
            notes === undefined
              ? { review: source }
              : { review: source, storyNotes: notes },
          ),
          children: withNotes,
        }),
      }),
    }),
  });
}
