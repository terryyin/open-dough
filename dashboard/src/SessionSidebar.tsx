// The Sessions sidebar: the machine's sessions still open, from every
// catalog project whichever is selected, newest launch first
// (`openSessionsOf`), each with its story's title, its project, its
// workflow, when it was launched, and its state in the words and attention
// edge a card entry shows (`shownSession`), under how many of them need the
// developer (`attentionSummary`). It sits beside the page, left of it, and
// the Sessions button at the start of the banner opens and closes it; while
// it is closed, that button says the same count. Command+B toggles it too,
// page-wide and from inside the terminal, except inside an open dialog, which
// keeps its own keyboard (`isInsideOpenDialog`); elsewhere it takes the key
// from the browser. Toggling leaves the keyboard where it is, except that
// closing the sidebar with the keyboard inside it returns the keyboard to the
// Sessions button. Whether it is open is this browser's disposable preference
// (`sidebarOpenKey`): it survives project switches, views, the terminal, and
// reloads, and without it, as when storage cannot be used, the sidebar starts
// closed. Toggling it is page state only: it changes no story fact, stage, or
// session. Entries are local evidence of launches, not story facts.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  launchWorkflows,
  openSessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { Moment } from "./Moment.tsx";
import { sourceById } from "./publishedSource.ts";
import { SessionList, shownSession } from "./SessionEntry.tsx";
import { isInsideOpenDialog } from "./pageShortcuts.ts";
import { attentionSummary } from "./sessionShown.ts";
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
  // The machine's sessions; undefined until first read.
  readonly records: readonly LaunchWithState[] | undefined;
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
      document
        .querySelector<HTMLElement>(`[aria-controls="${sidebarId}"]`)
        ?.focus();
    }
    isOpen.current = !isOpen.current;
    setOpen(isOpen.current);
  }, []);
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
  return { open, toggle, records };
}

const attentionOf = (sessions: readonly LaunchWithState[] | undefined) =>
  attentionSummary(sessions ?? []);

export function SessionsButton() {
  const { open, toggle, records } = useSidebar();
  const attention = open ? undefined : attentionOf(openSessionsOf(records));
  return (
    <button
      type="button"
      className="sessions-toggle"
      aria-expanded={open}
      aria-controls={sidebarId}
      onClick={toggle}
    >
      Sessions
      {attention !== undefined && (
        <>
          {" "}
          <span className="sessions-toggle-attention">{attention}</span>
        </>
      )}
    </button>
  );
}

export function SessionSidebar({ open, records }: SidebarState) {
  const sessions = openSessionsOf(records);
  const attention = attentionOf(sessions);
  return (
    <aside
      id={sidebarId}
      className="session-sidebar"
      aria-labelledby="session-sidebar-heading"
      hidden={!open}
    >
      <h2 id="session-sidebar-heading">Sessions</h2>
      {attention !== undefined && (
        <p className="sidebar-attention">{attention}</p>
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
              <SidebarEntry key={record.session.sessionId} record={record} />
            ))}
          </ol>
        )}
      </SessionList>
    </aside>
  );
}

function SidebarEntry({ record }: { readonly record: LaunchWithState }) {
  const { title, source, workflow } = record.request;
  const { entryClass, stateWords } = shownSession(record);
  return (
    <li className={entryClass}>
      <h3 className="sidebar-title" title={title}>
        {title}
      </h3>
      <p>
        {sourceById(source)?.label ?? source} · {launchWorkflows[workflow].name}
      </p>
      <p>
        Launched <Moment at={new Date(record.launchedAt)} />
      </p>
      {stateWords}
    </li>
  );
}
