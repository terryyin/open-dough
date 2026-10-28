// Recently done sessions, a collapsible section of the Sessions sidebar
// (`./SessionsSidebar.tsx`, which keeps whether it is expanded) below the
// open session list. Expanded, the sidebar's divider that resizes it lies
// along its top, its content scrolls on its own, and it lists retained Done
// records across configured projects by newest completion (`doneSessionsOf`),
// initially the newest 20. Each row reuses the open list's entry for opening,
// current-session mark and details, showing completion age instead of launch
// age. Loading and empty states stay distinct. Reload starts collapsed; the
// preferred height alone is a disposable browser preference.
import { useId, type ReactNode } from "react";
import {
  doneSessionsOf,
  recentlyDoneSessionsInitialLimit,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";
import { SessionList } from "./SessionEntry.tsx";
import {
  SessionsSidebarSessionEntry,
  type OpenSessionsSidebarSessionEntry,
} from "./SessionsSidebarSessionEntry.tsx";

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
  const sessions = doneSessionsOf(records, recentlyDoneSessionsInitialLimit);
  return (
    <section
      className="recently-done-sessions"
      aria-label="Recently done sessions"
    >
      {open && divider}
      <button
        type="button"
        className="sessions-sidebar-section-header recently-done-toggle"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
      >
        Recently done sessions
      </button>
      {open && (
        <div id={contentId} className="recently-done-sessions-body">
          <SessionList
            sessions={sessions}
            none="No sessions marked done are kept."
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
      )}
    </section>
  );
}
