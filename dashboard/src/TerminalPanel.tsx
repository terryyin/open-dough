// The page's one terminal: the right-hand panel showing one native
// session this dashboard launched, attached through the terminal boundary
// (`./agentTerminal.ts`) for as long as the panel shows it. What the session
// prints appears in the terminal, what the developer types goes to the
// session, and the terminal's size follows the panel. Its toolbar names the
// session and closes the panel; closing it, or opening another session in its
// place, detaches only, so the session keeps running. When the connection
// drops, as when the dashboard server restarts, the panel says so and offers
// to reconnect; when the attached CLI exits on its own, it says the terminal
// ended and offers to open it again. Either attaches to the same session anew.
// Each attachment reports native readiness; startup decisions remain interactive.
// Where supported, Mark as done asks the boundary to finish this session;
// the panel closes once marked and says if it could not be.

import { useRef, useState } from "react";
import { marksDone } from "./sessionCapabilities.ts";
import "@xterm/xterm/css/xterm.css";
import "./agent-launch.css";
import "./agent-terminal.css";
import { launchSubject } from "./agentLaunch.ts";
import {
  useAttachedTerminal,
  type TerminalEnding,
} from "./useAttachedTerminal.ts";
import {
  notMarkedDone,
  useMarking,
  type MarkSessionDone,
  type SessionOperation,
  type SessionRequest,
} from "./pageSessions.ts";

const endings = {
  disconnected: { says: "Disconnected from the session", action: "Reconnect" },
  ended: { says: "The terminal ended", action: "Open again" },
  failed: { says: "The session could not be attached", action: "Reconnect" },
} as const;

export function TerminalPanel({
  session,
  onAttached,
  onClose,
  onMarkDone,
}: {
  // The request that opened the panel, which the panel asks its operations
  // with.
  readonly session: SessionRequest;
  // Told once each attachment first shows the session's output; it keeps its
  // identity across renders.
  readonly onAttached: SessionOperation<void>;
  readonly onClose: () => void;
  // Answers whether the session was marked done; the panel closes if it was.
  readonly onMarkDone: MarkSessionDone;
}) {
  const { record } = session;
  const screen = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [ending, setEnding] = useState<TerminalEnding | undefined>();
  // While marking, the attachment's ending the mark causes is not shown.
  const { marking, follow } = useMarking();
  useAttachedTerminal(screen, session, attempt, onAttached, setEnding);
  const attachAgain = () => {
    setEnding(undefined);
    setAttempt((previous) => previous + 1);
  };
  const { title, name } = launchSubject(record.request);
  return (
    <section className="terminal-panel" aria-label="Terminal">
      <header className="terminal-toolbar">
        <div className="terminal-names">
          <h2>{title}</h2>
          <p className="quiet">
            {name} session <code>{record.session.sessionId}</code>
          </p>
        </div>
        <div className="terminal-actions">
          {marksDone(record.session.host) && (
            <button
              type="button"
              disabled={marking === "marking"}
              onClick={() => {
                follow(onMarkDone(session));
              }}
            >
              Mark as done
            </button>
          )}
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </header>
      <div role="status" className="terminal-status">
        {marking === "marking" && <p className="quiet">Marking as done…</p>}
        {marking === "not-marked" && <p>{notMarkedDone}</p>}
        {ending && marking !== "marking" && (
          <>
            <p>{endings[ending].says}</p>
            <button type="button" onClick={attachAgain}>
              {endings[ending].action}
            </button>
          </>
        )}
      </div>
      <div ref={screen} className="terminal-screen" />
    </section>
  );
}
