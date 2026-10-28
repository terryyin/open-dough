// Optional Sessions sidebar sections below the open list: Recently done
// sessions and Running Cursor sessions. Each starts collapsed on load; the
// shared room owner (`./sessionsSidebarHeights.ts`) sizes every expanded list.
import {
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import { RecentlyDoneSessions } from "./RecentlyDoneSessions.tsx";
import { ResizeDivider, type DividerRange } from "./ResizeDivider.tsx";
import { RunningCursorSessions } from "./RunningCursorSessions.tsx";
import type { OpenSessionsSidebarSessionEntry } from "./SessionsSidebarSessionEntry.tsx";
import {
  useSessionsSidebarHeights,
  type SessionsSidebarSectionHeights,
} from "./sessionsSidebarHeights.ts";

function sectionDivider(
  label: string,
  className: string,
  range: DividerRange | undefined,
): ReactNode {
  return (
    <ResizeDivider
      orientation="horizontal"
      label={`${label} divider`}
      title={`Drag, or use Up and Down, to resize ${label}`}
      valueText={(size) => `${String(size)} pixels tall`}
      className={className}
      range={range}
    />
  );
}

export function optionalSectionsStyle(
  heights: SessionsSidebarSectionHeights,
): CSSProperties | undefined {
  const style = {
    ...(heights.recentlyDone.height === undefined
      ? {}
      : {
          "--recently-done-height": `${String(heights.recentlyDone.height)}px`,
        }),
    ...(heights.runningCursor.height === undefined
      ? {}
      : {
          "--running-cursor-height": `${String(heights.runningCursor.height)}px`,
        }),
  } as CSSProperties;
  return Object.keys(style).length === 0 ? undefined : style;
}

// Unkept: each page load starts both optional sections collapsed.
export function useOptionalSidebarSectionState(
  sidebar: RefObject<HTMLElement | null>,
  sidebarOpen: boolean,
) {
  const [recentlyDoneOpen, setRecentlyDoneOpen] = useState(false);
  const [cursorOpen, setCursorOpen] = useState(false);
  const heights = useSessionsSidebarHeights(sidebar, {
    recentlyDone: sidebarOpen && recentlyDoneOpen,
    runningCursor: sidebarOpen && cursorOpen,
  });
  const className = [
    "sessions-sidebar",
    recentlyDoneOpen && "recently-done-open",
    cursorOpen && "running-cursor-open",
  ]
    .filter(Boolean)
    .join(" ");
  return {
    className,
    style: optionalSectionsStyle(heights),
    recentlyDoneOpen,
    toggleRecentlyDone: () => {
      setRecentlyDoneOpen((current) => !current);
    },
    cursorOpen,
    toggleCursor: () => {
      setCursorOpen((current) => !current);
    },
    heights,
  };
}

export function SessionsSidebarOptionalSections({
  sidebarOpen,
  records,
  onOpen,
  recentlyDoneOpen,
  onToggleRecentlyDone,
  cursorOpen,
  onToggleCursor,
  heights,
}: {
  readonly sidebarOpen: boolean;
  readonly records: readonly LaunchWithState[] | undefined;
  readonly onOpen: OpenSessionsSidebarSessionEntry;
  readonly recentlyDoneOpen: boolean;
  readonly onToggleRecentlyDone: () => void;
  readonly cursorOpen: boolean;
  readonly onToggleCursor: () => void;
  readonly heights: SessionsSidebarSectionHeights;
}) {
  return (
    <>
      <RecentlyDoneSessions
        open={recentlyDoneOpen}
        onToggle={onToggleRecentlyDone}
        records={records}
        onOpen={onOpen}
        divider={sectionDivider(
          "Recently done sessions",
          "recently-done-sessions-divider",
          heights.recentlyDone.range,
        )}
      />
      <RunningCursorSessions
        shown={sidebarOpen}
        open={cursorOpen}
        onToggle={onToggleCursor}
        records={records}
        onOpen={onOpen}
        divider={sectionDivider(
          "Running Cursor sessions",
          "running-cursor-sessions-divider",
          heights.runningCursor.range,
        )}
      />
    </>
  );
}
