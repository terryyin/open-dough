// The selected project's Recent sessions: every Claude Code session this
// dashboard's server launched for the project and still keeps on this
// machine, newest first, whatever origin now shows of its story, so the
// developer can reach a session whose story is in no list, or one marked done.
// Each entry (`./SessionEntry.tsx`) names its story and shows its session's
// state as Claude Code last listed it, read again at the page's steady pace.
// It takes the keyboard when a session marked done has no entry here, as when
// another project is selected. Entries are local evidence of launches, not
// story facts.

import {
  launchRetentionDays,
  projectSessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { SessionEntry } from "./SessionEntry.tsx";
import "./agent-launch.css";

export function RecentSessions({
  sourceId,
  records: machineRecords,
}: {
  // The selected project.
  readonly sourceId: string;
  // The machine's sessions, oldest first within a project, with their
  // states; undefined until first read.
  readonly records: readonly LaunchWithState[] | undefined;
}) {
  const records = projectSessionsOf(machineRecords, sourceId) ?? [];
  return (
    <section
      className="recent-sessions"
      aria-labelledby="recent-sessions-heading"
      tabIndex={-1}
    >
      <h2 id="recent-sessions-heading">Recent sessions</h2>
      <p className="quiet">
        Claude Code sessions launched from this dashboard for this project,
        newest first, kept on this machine.
      </p>
      {records.length === 0 ? (
        <p className="quiet">
          No sessions launched from this dashboard are kept.
        </p>
      ) : (
        <>
          <p className="quiet">
            Sessions marked done are kept for {launchRetentionDays} days after
            marking.
          </p>
          <ol>
            {records.toReversed().map((record) => (
              <li key={record.session.sessionId}>
                <SessionEntry record={record} onCard={false} />
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
