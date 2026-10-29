// Recently done sessions, a collapsible section of the Sessions sidebar
// (`./SessionsSidebar.tsx`, which keeps whether it is expanded) below the
// open session list. Expanded, the sidebar's divider that resizes it lies
// along its top, its content scrolls on its own, and it lists retained Done
// records across configured projects by newest completion (`doneSessionsOf`),
// initially the newest 20. Scrolling this list alone reveals older batches of
// up to 20 (`./recentlyDoneSessionsRange.ts`) without reading Board done-story
// details. Each row reuses the open list's entry for opening, current-session
// mark and details, showing completion age instead of launch age. Loading and
// empty states stay distinct. Reload starts collapsed with the initial range;
// the preferred height alone is a disposable browser preference.
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type UIEvent,
} from "react";
import { doneSessionsOf, type LaunchWithState } from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";
import { SessionList } from "./SessionLists.tsx";
import {
  SessionsSidebarSessionEntry,
  type OpenSessionsSidebarSessionEntry,
} from "./SessionsSidebarSessionEntry.tsx";
import {
  recentlyDoneSessionsShownCount,
  useRecentlyDoneSessionsRange,
} from "./recentlyDoneSessionsRange.ts";

const nearEndPx = 8;

export function RecentlyDoneSessions({
  open,
  onToggle,
  records,
  onOpen,
  divider,
}: {
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly records: readonly LaunchWithState[] | undefined;
  readonly onOpen: OpenSessionsSidebarSessionEntry;
  readonly divider: ReactNode;
}) {
  const contentId = useId();
  const { range, revealOlder } = useRecentlyDoneSessionsRange();
  const ordered = doneSessionsOf(records);
  const sessions =
    ordered === undefined
      ? undefined
      : ordered.slice(0, recentlyDoneSessionsShownCount(ordered, range));
  const body = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const header = useRef<HTMLButtonElement>(null);
  // Place of the focused entry among shown rows, for a refresh that removes it.
  const focusedPlace = useRef(-1);
  const focusedControl = useRef<Element | null>(null);

  // One batch per reach of the end: after revealing, wait until the developer
  // leaves the end threshold before arming another reveal.
  const armed = useRef(true);

  const nearEnd = (element: HTMLElement) =>
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - nearEndPx;

  const revealIfNearEnd = (element: HTMLElement) => {
    if (ordered === undefined || ordered.length === 0) return;
    if (!nearEnd(element)) {
      armed.current = true;
      return;
    }
    if (!armed.current) return;
    armed.current = false;
    revealOlder(ordered);
  };

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    revealIfNearEnd(event.currentTarget);
  };

  // When the shown entries fit the body with no overflow, the end is already
  // reached; reveal further batches until the list overflows or history ends.
  useEffect(() => {
    const element = body.current;
    if (!open || element === null || ordered === undefined) return;
    if (element.scrollHeight <= element.clientHeight + nearEndPx) {
      armed.current = true;
      revealIfNearEnd(element);
    }
  });

  useLayoutEffect(() => {
    const control = focusedControl.current;
    if (control === null || control.isConnected) return;
    if (
      document.activeElement !== null &&
      document.activeElement !== document.body
    ) {
      return;
    }
    const entries = [...(list.current?.children ?? [])];
    const nearby = entries[
      Math.min(
        Math.max(focusedPlace.current, 0),
        Math.max(entries.length - 1, 0),
      )
    ]?.querySelector<HTMLElement>("button.sessions-sidebar-session-entry-open");
    if (nearby !== null && nearby !== undefined) {
      nearby.focus();
      return;
    }
    focusedControl.current = null;
    focusedPlace.current = -1;
    header.current?.focus();
  });

  return (
    <section
      className="recently-done-sessions"
      aria-label="Recently done sessions"
    >
      {open && divider}
      <button
        ref={header}
        type="button"
        className="sessions-sidebar-section-header recently-done-toggle"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
      >
        Recently done sessions
      </button>
      {open && (
        <div
          ref={body}
          id={contentId}
          className="recently-done-sessions-body"
          onScroll={onScroll}
        >
          <SessionList
            sessions={sessions}
            none="No sessions marked done are kept."
          >
            {(listed) => (
              <ol
                ref={list}
                onFocus={(event) => {
                  focusedControl.current = event.target;
                  const items = [...(list.current?.children ?? [])];
                  focusedPlace.current = items.findIndex((item) =>
                    item.contains(event.target),
                  );
                }}
              >
                {listed.map((record) => (
                  <SessionsSidebarSessionEntry
                    key={sessionKey(record.session)}
                    record={record}
                    onOpen={onOpen}
                  />
                ))}
              </ol>
            )}
          </SessionList>
        </div>
      )}
    </section>
  );
}
