// Owns one mounted xterm/WebSocket attachment, including native readiness frames.
import { useEffect, type RefObject } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import type { LaunchRecord } from "./agentLaunch.ts";
import {
  agentTerminalEndpoint,
  terminalEndedCode,
  terminalAttachFailedCode,
  terminalReadinessSchema,
  terminalWorkspaceUnavailableSchema,
  terminalWorkspaceUnavailableCode,
  type TerminalWorkspaceUnavailable,
  type TerminalMessage,
} from "./agentTerminal.ts";
import type { SessionOperation, SessionRequest } from "./pageSessions.ts";

function terminalUrl(record: LaunchRecord): string {
  const query = new URLSearchParams({
    source: record.request.source,
    session: record.session.sessionId,
    host: record.session.host,
  });
  const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${scheme}//${window.location.host}${agentTerminalEndpoint}?${query.toString()}`;
}

// Why the panel's attachment is no longer open, if it is not.
export type TerminalEnding = "disconnected" | "ended" | "failed";

// Attaches a terminal in `element` to the session while it is mounted, anew
// for each `attempt`, reports once each attachment is ready, and
// reports how the attachment ended unless the panel ended it itself. The
// terminal takes the keyboard unless the request says otherwise.
// Callbacks must keep their identity across renders; disposed attachments
// cannot report readiness, workspace refusal or an ending to a later attempt.
export function useAttachedTerminal(
  element: RefObject<HTMLDivElement | null>,
  session: SessionRequest,
  attempt: number,
  onAttached: SessionOperation<void>,
  onEnded: (ending: TerminalEnding) => void,
  onWorkspaceUnavailable: (
    request: SessionRequest,
    workspace: TerminalWorkspaceUnavailable,
  ) => void,
) {
  const url = terminalUrl(session.record);
  const takesKeyboard = session.takesKeyboard !== false;
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
    socket.binaryType = "arraybuffer";
    let current = true;
    const send = (message: TerminalMessage) => {
      if (current && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    };
    const size = () => ({ cols: terminal.cols, rows: terminal.rows });
    socket.addEventListener("open", () => {
      send({ resize: size() });
    });
    let shown = false;
    let observeReadiness = false;
    let framePending = false;
    let frameCompleted = false;
    let cursorVisible = false;
    const mode = (enabled: boolean, params: number[]) => {
      if (params.includes(2026)) {
        framePending = enabled;
        if (!enabled) frameCompleted = true;
      }
      if (params.includes(25)) cursorVisible = enabled;
      return false;
    };
    const startedFrame = terminal.parser.registerCsiHandler(
      { prefix: "?", final: "h" },
      (params) =>
        mode(
          true,
          params.filter((item): item is number => typeof item === "number"),
        ),
    );
    const endedFrame = terminal.parser.registerCsiHandler(
      { prefix: "?", final: "l" },
      (params) =>
        mode(
          false,
          params.filter((item): item is number => typeof item === "number"),
        ),
    );
    const attached = () => {
      if (current && !shown) {
        shown = true;
        onAttached(session);
      }
    };
    socket.addEventListener("message", (event) => {
      if (!current) return;
      if (typeof event.data === "string") {
        terminal.write(event.data, () => {
          if (!current) return;
          if (observeReadiness && frameCompleted && !framePending) {
            frameCompleted = false;
            const buffer = terminal.buffer.active;
            send({
              cursorVisible,
              screen: Array.from(
                { length: terminal.rows },
                (...[, row]) =>
                  buffer.getLine(buffer.baseY + row)?.translateToString(true) ??
                  "",
              ),
            });
          } else if (!observeReadiness) attached();
        });
      } else if (event.data instanceof ArrayBuffer) {
        const payload: unknown = JSON.parse(
          new TextDecoder().decode(event.data),
        );
        const control = terminalReadinessSchema.safeParse(payload);
        if (control.success) {
          observeReadiness = control.data.readiness === "observe";
          if (!observeReadiness) attached();
        } else {
          const refusal = terminalWorkspaceUnavailableSchema.safeParse(payload);
          if (refusal.success)
            onWorkspaceUnavailable(session, refusal.data.workspaceUnavailable);
        }
      }
    });
    socket.addEventListener("close", (event) => {
      if (current && event.code !== terminalWorkspaceUnavailableCode) {
        onEnded(
          event.code === terminalEndedCode
            ? "ended"
            : event.code === terminalAttachFailedCode
              ? "failed"
              : "disconnected",
        );
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
    if (takesKeyboard) terminal.focus();

    return () => {
      current = false;
      panelSize.disconnect();
      startedFrame.dispose();
      endedFrame.dispose();
      typed.dispose();
      resized.dispose();
      socket.close();
      terminal.dispose();
    };
  }, [
    element,
    url,
    session,
    attempt,
    onAttached,
    onEnded,
    onWorkspaceUnavailable,
    takesKeyboard,
  ]);
}
