import { sessionKey } from "./sessionReference.ts";
// Sessions sidebar: open local sessions across catalog projects, attention
// first, then other sessions (openSessionsOf). Entries show title/age, native
// state, unread-report marks, tooltips and coarse-input details. Unavailable
// macOS alerts are explained only while open. The banner Sessions button and
// Command+B toggle it with attentionCount (unread reports alone add none).
// Dialogs keep their keyboard; otherwise the shortcut takes the browser key.
// Focus stays put except closing around focused content returns to Sessions.
// Entries open their story/session through PageFrame; narrow overlays close.
// Browser open preference survives project/view/terminal changes and reloads;
// unavailable storage starts closed. Toggling changes no story/session facts.
// Running Cursor sessions starts collapsed per load, reports live runner and
// session states, opens selected terminals, and explains unavailable runners.
// Expanded, its content and the open session list scroll separately; one room
// owner (runningCursorHeight) sizes every expanded list against shared floors
// and preferred heights, equally until resized. Collapsing restores list room.
// Expansion and split survive project/view/close changes; reload keeps split.

import {
  createContext,
  type CSSProperties,
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
import { PanelLeft } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { ResizeDivider } from "./ResizeDivider.tsx";
import { RunningCursorSessions } from "./RunningCursorSessions.tsx";
import { SessionList } from "./SessionEntry.tsx";
import {
  SessionsSidebarSessionEntry,
  type OpenSessionsSidebarSessionEntry,
} from "./SessionsSidebarSessionEntry.tsx";
import { keep, readKept } from "./keptPreference.ts";
import { useRunningCursorHeight } from "./runningCursorHeight.ts";
import { useCommandShortcut } from "./pageShortcuts.ts";
import { attentionCount, attentionSummary } from "./sessionShown.ts";
import "./agent-launch.css";
import "./sessions-sidebar.css";

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
  const count = attentionCount(sessions);
  return (
    <IconButton
      label="Sessions"
      shortcut="⌘B"
      icon={PanelLeft}
      align="start"
      className="sessions-toggle"
      groupClassName="sessions-toggle-group"
      aria-expanded={open}
      aria-controls={sessionsSidebarId}
      onClick={toggle}
    >
      {count > 0 && (
        <span
          role="img"
          className="sessions-toggle-attention"
          aria-label={attentionSummary(sessions)}
        >
          {count}
        </span>
      )}
    </IconButton>
  );
}

export function SessionsSidebar({
  open,
  records,
  alerts,
  onOpen,
}: Pick<SessionsSidebarState, "open" | "records" | "alerts"> & {
  readonly onOpen: OpenSessionsSidebarSessionEntry;
}) {
  const sessions = openSessionsOf(records);
  // Unkept: each page load starts with Running Cursor sessions collapsed.
  const [cursorOpen, setCursorOpen] = useState(false);
  const aside = useRef<HTMLElement>(null);
  const { height, range } = useRunningCursorHeight(aside, open && cursorOpen);
  return (
    <aside
      ref={aside}
      id={sessionsSidebarId}
      className={
        cursorOpen ? "sessions-sidebar running-cursor-open" : "sessions-sidebar"
      }
      style={
        height === undefined
          ? undefined
          : ({
              "--running-cursor-height": `${String(height)}px`,
            } as CSSProperties)
      }
      aria-label="Sessions sidebar"
      hidden={!open}
    >
      <h2 id="sessions-sidebar-heading">Sessions</h2>
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
                  onOpen={onOpen}
                />
              ))}
            </ol>
          )}
        </SessionList>
      </div>
      <RunningCursorSessions
        shown={open}
        open={cursorOpen}
        onToggle={() => {
          setCursorOpen((current) => !current);
        }}
        records={records}
        onOpen={onOpen}
        divider={
          <ResizeDivider
            orientation="horizontal"
            label="Running Cursor sessions divider"
            title="Drag, or use Up and Down, to resize Running Cursor sessions"
            valueText={(size) => `${String(size)} pixels tall`}
            className="running-cursor-sessions-divider"
            range={range}
          />
        }
      />
    </aside>
  );
}
