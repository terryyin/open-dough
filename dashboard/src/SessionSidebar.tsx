// The Sessions sidebar: the machine's sessions still open, from every
// catalog project whichever is selected, those that need the developer
// first, then the rest (`openSessionsOf`), each with its story's title, its
// project, its workflow, when it was launched, and its state in the words and attention
// edge a card entry shows (`shownSession`), and, while the server cannot
// raise its macOS alerts (`alerts`), a quiet "Alerts unavailable" note with
// why, in the open sidebar only. It sits beside the page, left of it, and the
// Sessions icon button at the start of the banner opens and closes it, with a
// badge of how many sessions need the developer (`attentionCount`), open or
// closed. Command+B toggles it too, page-wide and from inside the terminal,
// except inside an open dialog, which keeps its own keyboard
// (`isInsideOpenDialog`); elsewhere it takes the key
// from the browser. Toggling leaves the keyboard where it is, except that
// closing the sidebar with the keyboard inside it returns the keyboard to the
// Sessions button. Opening an entry (`./SidebarEntry.tsx`) goes to its story
// and its session through the page frame (`./TerminalSplit.tsx`), and on a
// narrow window closes the sidebar lying over the page. Whether it is open is
// this browser's disposable preference (`sidebarOpenKey`): it survives project
// switches, views, the terminal, and reloads, and without it, as when storage
// cannot be used, the sidebar starts closed. Toggling it, or opening an entry,
// is page state only: it changes no story fact, stage, or session. Entries are
// local evidence of launches, not story facts.

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
import { SessionList } from "./SessionEntry.tsx";
import { SidebarEntry, type OpenSidebarEntry } from "./SidebarEntry.tsx";
import { isInsideOpenDialog } from "./pageShortcuts.ts";
import { attentionCount, attentionSummary } from "./sessionShown.ts";
import "./agent-launch.css";
import "./session-sidebar.css";

const sidebarId = "session-sidebar";
const sidebarOpenKey = "open-dough.sessionSidebar.open";

function readSidebarOpen(): boolean {
  try {
    return window.localStorage.getItem(sidebarOpenKey) === "true";
  } catch {
    return false;
  }
}

function keepSidebarOpen(open: boolean): void {
  try {
    window.localStorage.setItem(sidebarOpenKey, String(open));
  } catch {
    // Unkept, the sidebar only starts closed next time.
  }
}

const isToggleShortcut = (event: KeyboardEvent) =>
  event.metaKey &&
  !event.ctrlKey &&
  !event.altKey &&
  !event.shiftKey &&
  event.key.toLowerCase() === "b";

// Whether the sidebar is open, and the machine's sessions it lists: held by
// the page frame (`./TerminalSplit.tsx`), which places the sidebar, and
// reached by the banner's Sessions button.
export type SidebarState = {
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

export const SidebarOnPage = createContext<SidebarState | undefined>(undefined);

function useSidebar(): SidebarState {
  const sidebar = useContext(SidebarOnPage);
  if (sidebar === undefined) {
    throw new Error("The Sessions button is outside the page's TerminalSplit.");
  }
  return sidebar;
}

// The page frame's sidebar state: open as this browser last left it, toggled
// by the Sessions button and by Command+B.
export function useSessionSidebar(
  records: SidebarState["records"],
  alerts: SidebarState["alerts"],
): SidebarState {
  const [open, setOpen] = useState(readSidebarOpen);
  const isOpen = useRef(open);
  useEffect(() => {
    isOpen.current = open;
    keepSidebarOpen(open);
  }, [open]);
  const toggle = useCallback(() => {
    const sidebar = document.getElementById(sidebarId);
    if (isOpen.current && sidebar?.contains(document.activeElement)) {
      sessionsButton()?.focus();
    }
    isOpen.current = !isOpen.current;
    setOpen(isOpen.current);
  }, []);
  const closeOverPage = () => {
    const sidebar = document.getElementById(sidebarId);
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
  // Listened for while capturing, so the page answers Command+B before any
  // control on it, the terminal included, handles the key.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isToggleShortcut(event) || isInsideOpenDialog(event.target)) {
        return;
      }
      event.preventDefault();
      // A held key toggles once.
      if (!event.repeat) {
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [toggle]);
  return { open, toggle, closeOverPage, records, alerts };
}

const sessionsButton = () =>
  document.querySelector<HTMLElement>(`[aria-controls="${sidebarId}"]`);

export function SessionsButton() {
  const { open, toggle, records } = useSidebar();
  const sessions = openSessionsOf(records) ?? [];
  const count = attentionCount(sessions);
  return (
    <span className="sessions-toggle-group">
      <button
        type="button"
        className="sessions-toggle"
        aria-label="Sessions"
        aria-expanded={open}
        aria-controls={sidebarId}
        onClick={toggle}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {count > 0 && (
        <span
          role="img"
          className="sessions-toggle-attention"
          aria-label={attentionSummary(sessions)}
        >
          {count}
        </span>
      )}
    </span>
  );
}

export function SessionSidebar({
  open,
  records,
  alerts,
  onOpen,
}: Pick<SidebarState, "open" | "records" | "alerts"> & {
  readonly onOpen: OpenSidebarEntry;
}) {
  const sessions = openSessionsOf(records);
  return (
    <aside
      id={sidebarId}
      className="session-sidebar"
      aria-labelledby="session-sidebar-heading"
      hidden={!open}
    >
      <h2 id="session-sidebar-heading">Sessions</h2>
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
              <SidebarEntry
                key={record.session.sessionId}
                record={record}
                onOpen={onOpen}
              />
            ))}
          </ol>
        )}
      </SessionList>
    </aside>
  );
}
