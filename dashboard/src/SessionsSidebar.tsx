import { sessionKey } from "./sessionReference.ts";
// Sessions sidebar: open local sessions across catalog projects, attention
// first, then other sessions (openSessionsOf). Entries show title/age, native
// state, unread-report marks, tooltips and coarse-input details. Unavailable
// macOS alerts are explained only while open. The banner Sessions button and
// Command+B toggle it with attentionCount (unread reports alone add none);
// while closed, workingCount joins that badge ahead of attention.
// Dialogs keep their keyboard; otherwise the shortcut takes the browser key.
// Focus stays put except closing around focused content returns to Sessions.
// Entries open their story/session through PageFrame; narrow overlays close.
// Browser open preference survives project/view/terminal changes and reloads;
// unavailable storage starts closed. Toggling changes no story/session facts.
// Recently done sessions and Running Cursor sessions each start collapsed per
// load (`./SessionsSidebarOptionalSections.tsx`). While open, the title row
// shows display-only figures beside the heading: how many open sessions are
// active and how many need attention, by the same reading the list shows,
// and this machine's CPU usage and free disk from the server's shared host
// sample (`./hostStatusReads.ts`), each unavailable on its own when unread.
// Expanded, every list scrolls separately; one room owner
// (`./sessionsSidebarHeights.ts`) sizes every expanded list against shared
// floors and preferred heights, equally until resized. Collapsing restores list room. Expansion and splits survive
// project/view/close changes; reload keeps preferred sizes, not expansion.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  openSessionsOf,
  type Alerts,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { IconButton } from "./Icon.tsx";
import { ProductMark } from "./ProductMark.tsx";
import { SessionList } from "./SessionLists.tsx";
import {
  SessionsSidebarSessionEntry,
  type OpenSessionsSidebarSessionEntry,
} from "./SessionsSidebarSessionEntry.tsx";
import type { RecentlyDoneRowSelection } from "./recentlyDoneSelection.ts";
import {
  SessionsSidebarOptionalSections,
  useOptionalSidebarSectionState,
} from "./SessionsSidebarOptionalSections.tsx";
import { SessionsSidebarStatus } from "./SessionsSidebarStatus.tsx";
import { useHostStatus } from "./hostStatusReads.ts";
import { keep, readKept } from "./keptPreference.ts";
import { useCommandShortcut } from "./pageShortcuts.ts";
import {
  attentionCount,
  attentionSummary,
  workingCount,
  workingSummary,
} from "./sessionShown.ts";
import "./agent-launch.css";
import "./sessions-sidebar.css";
import "./sessions-toggle.css";

const sessionsSidebarId = "sessions-sidebar";
const sessionsSidebarOpenKey = "open-dough.sessionsSidebar.open";

// Unkept, the sidebar starts closed.
const readSessionsSidebarOpen = () =>
  readKept(sessionsSidebarOpenKey, "open-dough.sessionSidebar.open") === "true";

const keepSessionsSidebarOpen = (open: boolean) => {
  keep(sessionsSidebarOpenKey, String(open));
};

const toggleShortcut = { key: "b" } as const;

// Whether the sidebar is open, and the machine's sessions it lists: held by
// the page frame (`./PageFrame.tsx`), which places the sidebar, and
// reached by the banner's Sessions button.
export type SessionsSidebarState = {
  readonly open: boolean;
  readonly toggle: () => void;
  // Closes the sidebar while it lies over the page, as on a narrow window,
  // answering the Sessions button, which then holds the keyboard; beside the
  // page it stays open, and answers nothing.
  readonly closeOverPage: () => HTMLElement | undefined;
  // The machine's sessions; undefined until first read.
  readonly records: readonly LaunchWithState[] | undefined;
  // Whether the server can raise its macOS alerts; undefined until first read.
  readonly alerts: Alerts | undefined;
};

export const SessionsSidebarOnPage = createContext<
  SessionsSidebarState | undefined
>(undefined);

function useSessionsSidebarContext(): SessionsSidebarState {
  const sidebar = useContext(SessionsSidebarOnPage);
  if (sidebar === undefined) {
    throw new Error("The Sessions button is outside the page's PageFrame.");
  }
  return sidebar;
}

// The page frame's sidebar state: open as this browser last left it, toggled
// by the Sessions button and by Command+B.
export function useSessionsSidebar(
  records: SessionsSidebarState["records"],
  alerts: SessionsSidebarState["alerts"],
): SessionsSidebarState {
  const [open, setOpen] = useState(readSessionsSidebarOpen);
  const isOpen = useRef(open);
  useEffect(() => {
    isOpen.current = open;
    keepSessionsSidebarOpen(open);
  }, [open]);
  const toggle = useCallback(() => {
    const sidebar = document.getElementById(sessionsSidebarId);
    if (isOpen.current && sidebar?.contains(document.activeElement)) {
      sessionsButton()?.focus();
    }
    isOpen.current = !isOpen.current;
    setOpen(isOpen.current);
  }, []);
  const closeOverPage = () => {
    const sidebar = document.getElementById(sessionsSidebarId);
    if (
      !isOpen.current ||
      sidebar === null ||
      getComputedStyle(sidebar).position !== "fixed"
    ) {
      return undefined;
    }
    toggle();
    return sessionsButton() ?? undefined;
  };
  useCommandShortcut(toggleShortcut, toggle);
  return { open, toggle, closeOverPage, records, alerts };
}

const sessionsButton = () =>
  document.querySelector<HTMLElement>(`[aria-controls="${sessionsSidebarId}"]`);

export function SessionsButton() {
  const { open, toggle, records } = useSessionsSidebarContext();
  const sessions = openSessionsOf(records) ?? [];
  // Working count only while closed; attention keeps showing either way.
  const working = open ? 0 : workingCount(sessions);
  const attention = attentionCount(sessions);
  // Product mark visual; tooltip, ⌘B, expanded state, count badge, and
  // open background stay the frame Sessions contract via IconButton.
  return (
    <IconButton
      label="Sessions"
      shortcut="⌘B"
      visual={<ProductMark decorative />}
      align="start"
      className="sessions-toggle"
      groupClassName="sessions-toggle-group"
      aria-expanded={open}
      aria-controls={sessionsSidebarId}
      onClick={toggle}
    >
      {(working > 0 || attention > 0) && (
        <span className="sessions-toggle-counts">
          {working > 0 && (
            <span
              role="img"
              className="sessions-toggle-working"
              aria-label={workingSummary(sessions)}
            >
              {working}
            </span>
          )}
          {attention > 0 && (
            <span
              role="img"
              className="sessions-toggle-attention"
              aria-label={attentionSummary(sessions)}
            >
              {attention}
            </span>
          )}
        </span>
      )}
    </IconButton>
  );
}

export function SessionsSidebar({
  open,
  records,
  alerts,
  ...rows
}: Pick<SessionsSidebarState, "open" | "records" | "alerts"> & {
  readonly onOpen: OpenSessionsSidebarSessionEntry;
  readonly recentlyDone: RecentlyDoneRowSelection;
}) {
  const sessions = openSessionsOf(records);
  const aside = useRef<HTMLElement>(null);
  const optional = useOptionalSidebarSectionState(aside, open);
  const host = useHostStatus(open);
  return (
    <aside
      ref={aside}
      id={sessionsSidebarId}
      className={optional.className}
      style={optional.style}
      aria-label="Sessions sidebar"
      hidden={!open}
    >
      <div className="sessions-sidebar-title-row">
        <h2 id="sessions-sidebar-heading">Sessions</h2>
        <SessionsSidebarStatus sessions={sessions} host={host} />
      </div>
      <div className="sessions-sidebar-sessions">
        {open && alerts?.available === false && (
          <p className="quiet">Alerts unavailable: {alerts.reason}</p>
        )}
        <SessionList
          sessions={sessions}
          {...(records !== undefined && records.length > 0
            ? { none: "No sessions launched from this dashboard are open." }
            : {})}
        >
          {(listed) => (
            <ol>
              {listed.map((record) => (
                <SessionsSidebarSessionEntry
                  key={sessionKey(record.session)}
                  record={record}
                  onOpen={rows.onOpen}
                />
              ))}
            </ol>
          )}
        </SessionList>
      </div>
      <SessionsSidebarOptionalSections
        sidebarOpen={open}
        records={records}
        {...rows}
        recentlyDoneOpen={optional.recentlyDoneOpen}
        onToggleRecentlyDone={optional.toggleRecentlyDone}
        cursorOpen={optional.cursorOpen}
        onToggleCursor={optional.toggleCursor}
        heights={optional.heights}
      />
    </aside>
  );
}
