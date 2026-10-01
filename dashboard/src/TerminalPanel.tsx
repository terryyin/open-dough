// The page's one terminal: the right-hand panel showing one native
// session this dashboard launched, attached through the terminal boundary
// (`./agentTerminal.ts`) for as long as the panel shows it. What the session
// prints appears in the terminal, what the developer types goes to the
// session, and the terminal's size follows the panel. Its toolbar names the
// session, led by the portrait of the agent its record names, if it has one,
// and, by icon controls on the right, maximizes or restores the panel
// and closes it, as Command+Shift+Escape does page-wide, from inside the
// terminal too, except inside an open dialog (`useCommandShortcut`), while
// plain Escape still goes to the session; closing it, or opening another
// session in its place, detaches only, so the session keeps running. When
// the connection drops, as when the dashboard server restarts, the panel
// says so and offers to reconnect; when the attached CLI exits on its own,
// it says the terminal ended and offers to open it again. Either attaches to
// the same session anew.
// Each attachment reports native readiness; startup decisions remain interactive.
// Where supported, Mark as done asks the boundary to finish this session;
// the panel closes once marked and says if it could not be.

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { marksDone } from "./sessionCapabilities.ts";
import { useCommandShortcut } from "./pageShortcuts.ts";
import "@xterm/xterm/css/xterm.css";
import "./agent-launch.css";
import "./agent-terminal.css";
import { launchSubject } from "./agentLaunch.ts";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { keepHeight } from "./measuredHeight.ts";
import { assignedAgent } from "./launchRecord.ts";
import { agentNameOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  useAttachedTerminal,
  type TerminalEnding,
} from "./useAttachedTerminal.ts";
import {
  notMarkedDone,
  useMarking,
  usePageSessions,
  type MarkSessionDone,
  type SessionOperation,
  type SessionRequest,
} from "./pageSessions.ts";
import type { TerminalWorkspaceUnavailable } from "./agentTerminal.ts";

const closeShortcut = { key: "Escape", shift: true } as const;

// Keeps `--terminal-rows-height` on the identity at the height of its title
// and session rows, however they wrap, so the agent portrait beside them
// spans both.
function useRowsHeight(
  identity: RefObject<HTMLDivElement | null>,
  rows: RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    const target = identity.current;
    const measured = rows.current;
    if (!target || !measured) return;
    return keepHeight(measured, target, "--terminal-rows-height").stop;
  }, [identity, rows]);
}

const endings = {
  disconnected: { says: "Disconnected from the session", action: "Reconnect" },
  ended: { says: "The terminal ended", action: "Open again" },
  failed: { says: "The session could not be attached", action: "Reconnect" },
} as const;

export function TerminalPanel({
  session,
  onAttached,
  maximized,
  onMaximize,
  onClose,
  onMarkDone,
  onWorkspaceUnavailable,
}: {
  // The request that opened the panel, which the panel asks its operations
  // with.
  readonly session: SessionRequest;
  // Told once each attachment first shows the session's output; it keeps its
  // identity across renders.
  readonly onAttached: SessionOperation<void>;
  // Whether the panel takes the page column's room, and how it asks to
  // change that.
  readonly maximized: boolean;
  readonly onMaximize: (maximized: boolean) => void;
  readonly onClose: () => void;
  // Answers whether the session was marked done; the panel closes if it was.
  readonly onMarkDone: MarkSessionDone;
  readonly onWorkspaceUnavailable: (
    request: SessionRequest,
    workspace: TerminalWorkspaceUnavailable,
  ) => void;
}) {
  const { record } = session;
  const { hostOperations } = usePageSessions();
  const screen = useRef<HTMLDivElement>(null);
  const identity = useRef<HTMLDivElement>(null);
  const names = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [ending, setEnding] = useState<TerminalEnding | undefined>();
  // While marking, the attachment's ending the mark causes is not shown.
  const { marking, follow } = useMarking();
  useAttachedTerminal(
    screen,
    session,
    attempt,
    onAttached,
    setEnding,
    onWorkspaceUnavailable,
  );
  useCommandShortcut(closeShortcut, onClose);
  useRowsHeight(identity, names);
  const attachAgain = () => {
    setEnding(undefined);
    setAttempt((previous) => previous + 1);
  };
  const { title, name } = launchSubject(record.request);
  const agent = assignedAgent(record.start ?? record.preparation);
  const agentName = agentNameOf(agent);
  return (
    <section className="terminal-panel" aria-label="Terminal">
      <header className="terminal-toolbar">
        <div ref={identity} className="terminal-identity">
          {agentName !== undefined && (
            <AgentPortrait name={agentName} label={agent} />
          )}
          <div ref={names} className="terminal-names">
            <h2>{title}</h2>
            <p className="quiet">
              {name} session <code>{record.session.sessionId}</code>
            </p>
          </div>
        </div>
        <div className="terminal-actions">
          {marksDone(hostOperations, record.session.host) && (
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
          <button
            type="button"
            className="terminal-icon"
            aria-label={maximized ? "Restore" : "Maximize"}
            title={maximized ? "Restore" : "Maximize"}
            onClick={() => {
              onMaximize(!maximized);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {maximized ? (
                <path d="M8 4h12v12M4 8h12v12H4z" />
              ) : (
                <path d="M4 4h16v16H4z" />
              )}
            </svg>
          </button>
          <button
            type="button"
            className="terminal-icon"
            aria-label="Close"
            title="Close (⌘⇧Esc)"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
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
