// The Claude Code session a launch record names, and Open terminal, which
// shows it in the page's terminal, offered only where `attachOpens` says it
// opens the session. A card's Started and a Recent sessions entry both show a
// session this way.

import { attachOpens, type LaunchWithState } from "./agentLaunch.ts";
import { useOpenTerminal } from "./terminalOpening.ts";
import "./agent-launch.css";

export function LaunchSession({
  record,
}: {
  readonly record: LaunchWithState;
}) {
  const openTerminal = useOpenTerminal();
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
