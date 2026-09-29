// The page's one terminal: the right-hand panel showing one Claude Code
// session this dashboard launched, attached through the terminal boundary
// (`./agentTerminal.ts`) for as long as the panel shows it. What the session
// prints appears in the terminal, what the developer types goes to the
// session, and the terminal's size follows the panel. Its toolbar names the
// session and closes the panel; closing it, or opening another session in its
// place, detaches only, so the session keeps running.

import { useEffect, useRef, type RefObject } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "./agent-launch.css";
import "./agent-terminal.css";
import { launchWorkflows, type LaunchRecord } from "./agentLaunch.ts";
import {
  agentTerminalEndpoint,
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

// Attaches a terminal in `element` to the session while it is mounted.
function useAttachedTerminal(
  element: RefObject<HTMLDivElement | null>,
  record: LaunchRecord,
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
      panelSize.disconnect();
      typed.dispose();
      resized.dispose();
      socket.close();
      terminal.dispose();
    };
  }, [element, url]);
}

export function TerminalPanel({
  record,
  onClose,
}: {
  readonly record: LaunchRecord;
  readonly onClose: () => void;
}) {
  const screen = useRef<HTMLDivElement>(null);
  useAttachedTerminal(screen, record);
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
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <div ref={screen} className="terminal-screen" />
    </section>
  );
}
