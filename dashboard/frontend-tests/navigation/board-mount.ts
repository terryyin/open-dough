import { createElement, useState } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import { Board } from "../../src/Board.tsx";
import { DashboardBanner } from "../../src/DashboardBanner.tsx";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageFrame } from "../../src/PageFrame.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { PerspectiveScroll } from "../../src/perspectiveScroll.tsx";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import { StoryNavigationOnPage } from "../../src/storyNavigation.tsx";
import {
  withClosedSessionsSidebar,
  withFramePreference,
} from "../../test-support/component-mount/framePreferences.ts";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { emulateMedia } from "../review/browser-session.ts";

const refusal = "This Board reading does not operate a session.";
const unexpected = () => {
  throw new Error(refusal);
};

export const noSessions: MachineSessions = {
  ...machineSessionsAnswering(makeMe.aMachineAnswer.please(), refusal),
  alerts: { available: true },
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
            PerspectiveScroll,
            { key: "board", perspective: "board" },
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
  {
    reviews,
    sessionsSidebar = "closed",
    done,
  }: {
    reviews?: ReviewSource;
    sessionsSidebar?: "closed" | "kept";
    done?: DoneRecordReadSource;
  } = {},
) {
  if (sessionsSidebar === "closed") withClosedSessionsSidebar();
  let sessions = { ...noSessions, ...observed };
  let work = projects;
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
    const reads = pageReadsSupplying({
      sessions: authenticatedSessionServices,
      ...(reviews === undefined
        ? {}
        : {
            review: reviews,
            storyNotes: () => Promise.resolve({ kind: "notes", notes: {} }),
          }),
      ...(done === undefined ? {} : { done }),
    });
    return createElement(PageReadsOnPage, { reads, children: launched });
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
  withFramePreference(positionKey, initial ?? null);
  withFramePreference(formerPositionKey, null);
}

export function reducedBoardMotion() {
  return emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
}
