// The selected project's Recent sessions: every Claude Code session this
// dashboard's server launched for the project and still keeps on this
// machine, newest first, whatever origin now shows of its story. Unlike a
// card's Started, an entry does not settle when the story is prepared, taken,
// or leaves the backlog, so the developer can reach the session afterwards.
// Entries are local evidence of launches, not story facts.

import {
  launchRetentionDays,
  launchWorkflows,
  type LaunchRecord,
} from "./agentLaunch.ts";
import { Moment } from "./Moment.tsx";
import { LaunchSession } from "./LaunchSession.tsx";
import "./agent-launch.css";

function RecentSession({ record }: { readonly record: LaunchRecord }) {
  const { title, identity, workflow } = record.request;
  const { name } = launchWorkflows[workflow];
  return (
    <article
      className="recent-session"
      aria-label={`${name} session for ${title}`}
    >
      <h3>{title}</h3>
      <p className="card-identity">{identity}</p>
      <p>
        {name} started in Claude Code{" "}
        <Moment at={new Date(record.launchedAt)} />
      </p>
      <p className="launch-local">
        Local: launched from this dashboard on this machine.
      </p>
      <LaunchSession record={record} />
    </article>
  );
}

export function RecentSessions({
  records,
}: {
  // The project's launch records, oldest first.
  readonly records: readonly LaunchRecord[];
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
              <RecentSession record={record} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
