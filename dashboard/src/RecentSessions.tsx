// The selected project's Recent sessions: every Claude Code session this
// dashboard's server launched for the project and still keeps on this
// machine, newest first, whatever origin now shows of its story. Unlike a
// card's Started, an entry does not settle when the story is prepared, taken,
// or leaves the backlog, so the developer can reach the session afterwards.
// Each entry shows its session's state as Claude Code last listed it, read
// again at the page's steady pace, and a session the developer marked done is
// Done, under its `done-` name. Entries are local evidence of launches, not
// story facts.

import {
  launchRetentionDays,
  launchWorkflows,
  sessionRuns,
  type LaunchWithState,
  type SessionState,
} from "./agentLaunch.ts";
import { doneSessionName } from "./doneMark.ts";
import { Moment } from "./Moment.tsx";
import { LaunchSession } from "./LaunchSession.tsx";
import "./agent-launch.css";

// How an entry names its session's state as Claude Code last listed it. A
// running session is Working while busy and Idle otherwise, whatever its
// state, even once marked done, since opening a done session wakes it; one no
// longer running is Done once marked done, Finished once Claude Code calls it
// done, and Stopped otherwise.
function sessionStateWords(
  sessionState: SessionState,
  markedDone: boolean,
): {
  readonly label: string;
  readonly note?: string;
} {
  switch (sessionState.kind) {
    case "unknown":
      return {
        label: "State unknown",
        note: "Claude Code's session list could not be read",
      };
    case "unlisted":
      return { label: "Session unavailable" };
    case "listed":
      if (sessionRuns(sessionState)) {
        return { label: sessionState.status === "busy" ? "Working" : "Idle" };
      }
      if (markedDone) {
        return { label: "Done" };
      }
      return { label: sessionState.state === "done" ? "Finished" : "Stopped" };
  }
}

function RecentSession({ record }: { readonly record: LaunchWithState }) {
  const { title, identity, workflow } = record.request;
  const { name } = launchWorkflows[workflow];
  const markedDone = record.doneAt !== undefined;
  const { label, note } = sessionStateWords(record.sessionState, markedDone);
  return (
    <article
      className="recent-session"
      aria-label={`${name} session for ${title}`}
    >
      <h3>{title}</h3>
      <p className="card-identity">{identity}</p>
      <p className="recent-session-state">
        {label}
        {note !== undefined && <span className="quiet">: {note}</span>}
      </p>
      <p>
        {name} started in Claude Code{" "}
        <Moment at={new Date(record.launchedAt)} />
      </p>
      <p className="launch-local">
        Local: launched from this dashboard on this machine.
      </p>
      {markedDone && (
        <p>
          Named <code>{doneSessionName(record.session)}</code>
        </p>
      )}
      <LaunchSession record={record} />
    </article>
  );
}

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
              <RecentSession record={record} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
