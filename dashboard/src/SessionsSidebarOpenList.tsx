// Open Sessions list for the sidebar frame (`./SessionsSidebar.tsx`): alerts
// while open, empty reading, and each open row through the shared entry.
import { sessionKey } from "./sessionReference.ts";
import {
  openSessionsOf,
  type Alerts,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { SessionList } from "./SessionLists.tsx";
import {
  SessionsSidebarSessionEntry,
  type OpenSessionsSidebarSessionEntry,
} from "./SessionsSidebarSessionEntry.tsx";

export function SessionsSidebarOpenList({
  records,
  alerts,
  open,
  onOpen,
}: {
  readonly records: readonly LaunchWithState[] | undefined;
  readonly alerts: Alerts | undefined;
  readonly open: boolean;
  readonly onOpen: OpenSessionsSidebarSessionEntry;
}) {
  const sessions = openSessionsOf(records);
  return (
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
  );
}
