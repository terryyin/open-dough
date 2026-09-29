// The page's one terminal: the right-hand panel showing one Claude Code
// session this dashboard launched, attached through the terminal boundary
// (`./agentTerminal.ts`) for as long as the panel shows it. What the session
// prints appears in the terminal, what the developer types goes to the
// session, and the terminal's size follows the panel. Its toolbar names the
// session and closes the panel; closing it, or opening another session in its
// place, detaches only, so the session keeps running. When the connection
// drops, as when the dashboard server restarts, the panel says so and offers
// to reconnect; when the attached CLI exits on its own, it says the terminal
// ended and offers to open it again. Either attaches to the same session anew.
// Mark as done asks the boundary to rename the session `done-<name>` through
// this attachment and stop it; the panel closes once it is marked, and says
// so if it could not be.

import { useEffect, useRef, useState, type RefObject } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "./agent-launch.css";
import "./agent-terminal.css";
import { launchWorkflows, type LaunchRecord } from "./agentLaunch.ts";
import {
  agentTerminalEndpoint,
  terminalEndedCode,
  type TerminalMessage,
} from "./agentTerminal.ts";

function terminalUrl(record: LaunchRecord): string {
  const query = new URLSearchParams({
    source: record.request.source,
    session: record.session.sessionId,
  });
  const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${scheme}//${window.location.host}${agentTerminalEndpoint}?${query.toString()}`;
}

// Why the panel's attachment is no longer open, if it is not.
type Ending = "disconnected" | "ended";

const endings = {
  disconnected: { says: "Disconnected from the session", action: "Reconnect" },
  ended: { says: "The terminal ended", action: "Open again" },
} as const;

// Attaches a terminal in `element` to the session while it is mounted, anew
// for each `attempt`, and reports how the attachment ended unless the panel
// ended it itself. `onEnded` must keep its identity across renders.
function useAttachedTerminal(
  element: RefObject<HTMLDivElement | null>,
  record: LaunchRecord,
  attempt: number,
  onEnded: (ending: Ending) => void,
) {
  const url = terminalUrl(record);
  useEffect(() => {
    const screen = element.current;
    if (screen === null) {
      return;
    }
    const terminal = new Terminal({ cursorBlink: true });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(screen);

    const socket = new WebSocket(url);
    const send = (message: TerminalMessage) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    };
    const size = () => ({ cols: terminal.cols, rows: terminal.rows });
    socket.addEventListener("open", () => {
      send({ resize: size() });
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data === "string") {
        terminal.write(event.data);
      }
    });
    let current = true;
    socket.addEventListener("close", (event) => {
      if (current) {
        onEnded(event.code === terminalEndedCode ? "ended" : "disconnected");
      }
    });
    const typed = terminal.onData((input) => {
      send({ input });
    });
    const resized = terminal.onResize(() => {
      send({ resize: size() });
    });
    const panelSize = new ResizeObserver(() => {
      fit.fit();
    });
    panelSize.observe(screen);
    fit.fit();
    terminal.focus();

    return () => {
      current = false;
      panelSize.disconnect();
      typed.dispose();
      resized.dispose();
      socket.close();
      terminal.dispose();
    };
  }, [element, url, attempt, onEnded]);
}

// Where Mark as done stands: asked, and the attachment's ending it causes is
// not shown, or refused.
type Marking = "marking" | "not-marked";

export function TerminalPanel({
  record,
  onClose,
  onMarkDone,
}: {
  readonly record: LaunchRecord;
  readonly onClose: () => void;
  // Answers whether the session was marked done; the panel closes if it was.
  readonly onMarkDone: () => Promise<boolean>;
}) {
  const screen = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [ending, setEnding] = useState<Ending | undefined>();
  const [marking, setMarking] = useState<Marking | undefined>();
  const markDone = () => {
    setMarking("marking");
    void onMarkDone().then((marked) => {
      if (!marked) {
        setMarking("not-marked");
      }
    });
  };
  useAttachedTerminal(screen, record, attempt, setEnding);
  const attachAgain = () => {
    setEnding(undefined);
    setAttempt((previous) => previous + 1);
  };
  const { title, workflow } = record.request;
  return (
    <section className="terminal-panel" aria-label="Terminal">
      <header className="terminal-toolbar">
        <div className="terminal-names">
          <h2>{title}</h2>
          <p className="quiet">
            {launchWorkflows[workflow].name} session{" "}
            <code>{record.session.sessionId}</code>
          </p>
        </div>
        <div className="terminal-actions">
          <button
            type="button"
            disabled={marking === "marking"}
            onClick={markDone}
          >
            Mark as done
          </button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </header>
      <div role="status" className="terminal-status">
        {marking === "marking" && <p>Marking as done…</p>}
        {marking === "not-marked" && (
          <p>The session could not be marked done.</p>
        )}
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
