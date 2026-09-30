// The Claude Code session a launch record names, and Open terminal, which
// shows it in the page's terminal, offered only where `attachOpens` says it
// opens the session. Every session entry (`./SessionEntry.tsx`) shows its
// session this way.

import { attachOpens, type LaunchWithState } from "./agentLaunch.ts";
import { usePageSessions } from "./pageSessions.ts";
import "./agent-launch.css";

export function LaunchSession({
  record,
}: {
  readonly record: LaunchWithState;
}) {
  const { openTerminal } = usePageSessions();
  return (
    <>
      <p>
        Session <code>{record.session.sessionId}</code>
      </p>
      {attachOpens(record.sessionState) && (
        <p className="launch-open">
          <button
            type="button"
            onClick={(event) => {
              openTerminal({ record, control: event.currentTarget });
            }}
          >
            Open terminal
          </button>
        </p>
      )}
    </>
  );
}
