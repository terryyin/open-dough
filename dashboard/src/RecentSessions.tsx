// The selected project's Recent sessions: every Claude Code session this
// dashboard's server launched for the project and still keeps on this
// machine, newest first, whatever origin now shows of its story, so the
// developer can reach a session whose story is in no list, or one marked done.
// Each entry (`./SessionEntry.tsx`) names its story and shows its session's
// state as Claude Code last listed it, read again at the page's steady pace.
// Entries are local evidence of launches, not story facts.

import { launchRetentionDays, type LaunchWithState } from "./agentLaunch.ts";
import { SessionEntry } from "./SessionEntry.tsx";
import "./agent-launch.css";

export function RecentSessions({
  records,
}: {
  // The project's launch records, oldest first, with their sessions' states.
  readonly records: readonly LaunchWithState[];
}) {
  return (
    <section
      className="recent-sessions"
      aria-labelledby="recent-sessions-heading"
    >
      <h2 id="recent-sessions-heading">Recent sessions</h2>
      <p className="quiet">
        Claude Code sessions launched from this dashboard for this project,
        newest first, kept on this machine for {launchRetentionDays} days.
      </p>
      {records.length === 0 ? (
        <p className="quiet">
          No sessions launched from this dashboard are kept.
        </p>
      ) : (
        <ol>
          {records.toReversed().map((record) => (
            <li key={record.session.sessionId}>
              <SessionEntry record={record} namesStory />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
