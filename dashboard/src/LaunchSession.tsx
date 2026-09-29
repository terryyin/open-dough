// The Claude Code session a launch record names, and Open terminal, which
// shows it in the page's terminal, offered only where `attachOpens` says it
// opens the session. Every session entry (`./SessionEntry.tsx`) shows its
// session this way; the control names the session it opens, so the page can
// return the keyboard to an entry's control (`./terminalOpening.ts`).

import { attachOpens, type LaunchWithState } from "./agentLaunch.ts";
import { opensSession, usePageSessions } from "./terminalOpening.ts";
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
            {...opensSession(record.session.sessionId)}
            onClick={(event) => {
              openTerminal({ record, opener: event.currentTarget });
            }}
          >
            Open terminal
          </button>
        </p>
      )}
    </>
  );
}
