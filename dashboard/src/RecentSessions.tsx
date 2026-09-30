import { sessionKey } from "./sessionReference.ts";
// The selected project's Recent sessions: every Claude Code session this
// dashboard's server launched for the project and still keeps on this
// machine, newest first, once the machine's sessions are first read,
// whatever origin now shows of its story, so the developer can reach a session
// whose story is in no list, or one marked done.
// Each entry (`./SessionEntry.tsx`) names its story and shows its session's
// state as Claude Code last listed it, read again at the page's steady pace.
// It takes the keyboard when the last of its entries is deleted (see
// `deletedEntryHome` in `./pageSessions.ts`). Entries are local evidence of
// launches, not story facts.

import {
  launchRetentionDays,
  projectSessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { SessionEntry, SessionList } from "./SessionEntry.tsx";
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
  const records = projectSessionsOf(machineRecords, sourceId);
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
      <SessionList sessions={records}>
        {(kept) => (
          <>
            <p className="quiet">
              Sessions marked done are kept for {launchRetentionDays} days after
              marking.
            </p>
            <ol>
              {kept.toReversed().map((record) => (
                <li key={sessionKey(record.session)}>
                  <SessionEntry record={record} onCard={false} />
                </li>
              ))}
            </ol>
          </>
        )}
      </SessionList>
    </section>
  );
}
