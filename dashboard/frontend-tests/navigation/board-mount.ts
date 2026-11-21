import { createElement, useState } from "react";
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import { Board } from "../../src/Board.tsx";
import { DashboardBanner } from "../../src/DashboardBanner.tsx";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageFrame } from "../../src/PageFrame.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import {
  ReviewSourceOnPage,
  type ReviewSource,
} from "../../src/reviewSource.ts";
import { StoryNotesOnPage, storyNotesState } from "../../src/storyNotes.ts";
import { StoryNavigationOnPage } from "../../src/storyNavigation.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { emulateMedia } from "../review/browser-session.ts";

const answer = makeMe.aMachineAnswer.please();

const noOperation = () => undefined;
const unexpected = () => {
  throw new Error("This Board reading does not operate a session.");
};

export const noSessions: MachineSessions = {
  records: [],
  launched: [],
  sessionsSettled: true,
  alerts: { available: true },
  workspaces: answer.workspaces,
  creations: answer.creations,
  hostOperations: answer.hostOperations,
  feedbackMaintenance: answer.feedbackMaintenance,
  rereadOffers: noOperation,
  rereadSessions: noOperation,
  readHistory: noOperation,
  keptStartOf: noOperation,
  runningStartOf: noOperation,
  establishesStart: () => false,
  sessionPolicyOffer: () => "reading",
  optionsOffer: noOperation,
  recoveriesOf: () => [],
  attemptEvidence: "read",
  continueStartup: unexpected,
  updateWorktreeAndRetry: unexpected,
  recheckStartups: unexpected,
  attemptOf: noOperation,
  storyStartupOf: noOperation,
  storyStartupsOf: () => [],
  start: unexpected,
  startAdHoc: unexpected,
  adHocAttemptOf: noOperation,
  markDone: unexpected,
  markRead: unexpected,
  deleteRecord: unexpected,
  recoverSession: unexpected,
  stopSession: unexpected,
  readSession: unexpected,
};

function ReadingBoard({
  projects,
  sessions,
}: {
  projects: readonly PublishedWork[];
  sessions: MachineSessions;
}) {
  const [selected, select] = useState(projects[0]?.source.id);
  const work =
    projects.find(({ source }) => source.id === selected) ?? projects[0];
  if (work === undefined) throw new Error("Supply work for the Board to read.");
  const sources = projects.map(({ source }) => source);
  const choose = (source: PublishedWork["source"]) => {
    select(source.id);
  };
  return createElement(ProjectsOnPage, {
    projects: sources,
    replaceProjects: unexpected,
    children: createElement(PageFrame, {
      sessions,
      stories: {
        selected: work.source.id,
        shown: work.source.id,
        select: choose,
        show: choose,
        development: true,
        work,
      },
      children: createElement(StoryNavigationOnPage, {
        value: { follow: unexpected, opening: undefined },
        children: [
          createElement(DashboardBanner, {
            key: "banner",
            source: work.source,
            perspective: "development",
            onOpenSettings: unexpected,
            onSelect: choose,
            onSelectPerspective: unexpected,
          }),
          createElement(
            "div",
            {
              key: "board",
              className: "board-scroll",
            },
            createElement(
              "div",
              { className: "scroll-content" },
              createElement(
                "main",
                null,
                createElement(Board, {
                  sourceId: work.source.id,
                  project: work.source.label,
                  work,
                  launches: sessions,
                  onOpenRoster: unexpected,
                }),
              ),
            ),
          ),
        ],
      }),
    }),
  });
}

export async function mountBoard(
  projects: readonly PublishedWork[],
  viewport: { width: number; height: number },
  observed: Partial<
    Pick<
      MachineSessions,
      "records" | "launched" | "start" | "keptStartOf" | "sessionPolicyOffer"
    >
  > = {},
  reviews?: ReviewSource,
) {
  let sessions = { ...noSessions, ...observed };
  let work = projects;
  const notes = new Map(
    projects.map(({ source }) => [
      source.id,
      storyNotesState(() => Promise.resolve({ kind: "notes", notes: {} })),
    ]),
  );
  const reading = (next: readonly PublishedWork[], key = 0) => {
    const board = createElement(ReadingBoard, {
      key,
      projects: next,
      sessions,
    });
    const launched = createElement(LaunchesOnPage, {
      value: sessions,
      children: board,
    });
    if (reviews === undefined) return launched;
    return createElement(ReviewSourceOnPage, {
      value: reviews,
      children: createElement(StoryNotesOnPage, {
        value: notes,
        children: launched,
      }),
    });
  };
  const { rerender } = await mountComponent(reading(projects), {
    viewport,
    fillsViewport: true,
  });
  return {
    supply: (next: readonly PublishedWork[]) => {
      work = next;
      rerender(reading(next));
    },
    supplySessions: (records: NonNullable<MachineSessions["records"]>) => {
      sessions = { ...sessions, records, launched: records };
      rerender(reading(work));
    },
    restart: (key: number) => {
      rerender(reading(projects, key));
    },
  };
}

export const positionKey = "open-dough.board.position";
export const formerPositionKey = "open-dough.dashboardColumns.position";

export function withBoardStorage(initial?: string) {
  const before = localStorage.getItem(positionKey);
  const former = localStorage.getItem(formerPositionKey);
  const restore = (key: string, value: string | null) => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  };
  onTestFinished(() => {
    restore(positionKey, before);
    restore(formerPositionKey, former);
  });
  restore(positionKey, initial ?? null);
  localStorage.removeItem(formerPositionKey);
}

export function reducedBoardMotion() {
  return emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
}
