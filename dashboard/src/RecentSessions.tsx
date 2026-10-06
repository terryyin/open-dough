import { sessionKey } from "./sessionReference.ts";
// The selected project's Recent sessions: every native session this
// dashboard's server launched for the project and still keeps on this
// machine, newest first, once the machine's sessions are first read,
// whatever origin now shows of its story, so the developer can reach a session
// whose story is in no list, or one marked done.
// Each entry (`./SessionEntry.tsx`) names its story and shows its session's
// state as its host last observed it, read again at the page's steady pace.
// It takes the keyboard when the last of its entries is deleted (see
// `deletedEntryHome` in `./pageSessions.ts`). Entries are local evidence of
// launches, not story facts.

import {
  launchRetentionDays,
  projectSessionsOf,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { CreationEntry } from "./CreationEntry.tsx";
import type { CreationView } from "./launchCreation.ts";
import type { ColumnSummary } from "./ColumnEdge.tsx";
import { SessionEntry, SessionList } from "./SessionEntry.tsx";
import "./agent-launch.css";

// What Recent sessions lists for the project: its creations under way, then
// its kept sessions, newest first, once they are first read.
function listedOf(
  sourceId: string,
  creations: readonly CreationView[],
  machineRecords: readonly LaunchWithState[] | undefined,
) {
  return {
    creations: creations.filter((record) => record.request.source === sourceId),
    records: projectSessionsOf(machineRecords, sourceId),
  };
}

const name = "Recent sessions";

// Recent sessions as the dashboard columns name it: how many entries it
// lists for the project.
export function recentSessionsColumn(
  sourceId: string,
  creations: readonly CreationView[],
  machineRecords: readonly LaunchWithState[] | undefined,
): ColumnSummary {
  const listed = listedOf(sourceId, creations, machineRecords);
  return {
    name,
    entries: listed.creations.length + (listed.records?.length ?? 0),
  };
}

export function RecentSessions({
  sourceId,
  creations = [],
  records: machineRecords,
}: {
  // The selected project.
  readonly sourceId: string;
  readonly creations?: readonly CreationView[];
  // The machine's sessions, oldest first within a project, with their
  // states; undefined until first read.
  readonly records: readonly LaunchWithState[] | undefined;
}) {
  const listed = listedOf(sourceId, creations, machineRecords);
  return (
    <section
      className="recent-sessions"
      aria-labelledby="recent-sessions-heading"
      tabIndex={-1}
    >
      <h2 id="recent-sessions-heading">{name}</h2>
      <p className="quiet">
        Sessions launched from this dashboard for this project, newest first,
        kept on this machine.
      </p>
      {listed.creations.map((record) => (
        <CreationEntry key={record.launchedAt} record={record} />
      ))}
      <SessionList sessions={listed.records}>
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
