// One mounted xterm/WebSocket attachment and its input, rendering and cleanup.
import { Terminal, type ITheme } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import type { LaunchRecord } from "./agentLaunch.ts";
import {
  agentTerminalEndpoint,
  terminalEndedCode,
  terminalAttachFailedCode,
  terminalAttachRefusalCode,
  terminalAttachRefusalSchema,
  terminalReadinessSchema,
  terminalReplaySchema,
  terminalWorkspaceUnavailableSchema,
  terminalWorkspaceUnavailableCode,
  type TerminalWorkspaceUnavailable,
  type TerminalMessage,
} from "./agentTerminal.ts";
import type { SessionOperation, SessionRequest } from "./pageSessions.ts";
import { listenToTerminalTouchScroll } from "./terminalTouchScroll.ts";

export function terminalUrl(record: LaunchRecord): string {
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

export function attachTerminal(
  screen: HTMLDivElement,
  url: string,
  session: SessionRequest,
  theme: ITheme,
  takesKeyboard: boolean,
  onAttached: SessionOperation<void>,
  onEnded: (ending: TerminalEnding) => void,
  onWorkspaceUnavailable: (
    request: SessionRequest,
    workspace: TerminalWorkspaceUnavailable,
  ) => void,
  onAttachRefusal: (explanation: string) => void,
) {
  const terminal = new Terminal({
    cursorBlink: true,
    theme,
  });
  const fit = new FitAddon();
  terminal.loadAddon(fit);
  terminal.open(screen);
  const description = screen.getAttribute("aria-describedby");
  if (description)
    terminal.textarea?.setAttribute("aria-describedby", description);

  const stopTouchScroll = listenToTerminalTouchScroll(screen, terminal);

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
  let refused = false;
  let observeReadiness = false;
  let framePending = false;
  let frameCompleted = false;
  let cursorVisible = false;
  let replaying = false;
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
        if (replaying) {
          replaying = false;
          fit.fit();
        }
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
      const payload: unknown = JSON.parse(new TextDecoder().decode(event.data));
      const control = terminalReadinessSchema.safeParse(payload);
      if (control.success) {
        observeReadiness = control.data.readiness === "observe";
        if (!observeReadiness) attached();
      } else {
        const replay = terminalReplaySchema.safeParse(payload);
        if (replay.success) {
          replaying = true;
          terminal.resize(replay.data.replay.cols, replay.data.replay.rows);
          return;
        }
        const workspaceRefusal =
          terminalWorkspaceUnavailableSchema.safeParse(payload);
        if (workspaceRefusal.success) {
          onWorkspaceUnavailable(
            session,
            workspaceRefusal.data.workspaceUnavailable,
          );
          return;
        }
        const attachRefusal = terminalAttachRefusalSchema.safeParse(payload);
        if (attachRefusal.success) {
          refused = true;
          onAttachRefusal(attachRefusal.data.attachRefusal.explanation);
        }
      }
    }
  });
  socket.addEventListener("close", (event) => {
    if (!current || event.code === terminalWorkspaceUnavailableCode) return;
    // A carried refusal replaces the generic ending; without its bounded
    // frame, the same close keeps the generic failed ending.
    if (event.code === terminalAttachRefusalCode && refused) return;
    onEnded(
      event.code === terminalEndedCode
        ? "ended"
        : event.code === terminalAttachFailedCode ||
            event.code === terminalAttachRefusalCode
          ? "failed"
          : "disconnected",
    );
  });
  // The current attachment alone owns this offer. Input follows xterm's
  // ordinary onData path; acceptance means a local offer, not a PTY receipt.
  const insert = (text: string) => {
    if (!current || !shown || refused || socket.readyState !== WebSocket.OPEN)
      return false;
    terminal.input(text);
    terminal.focus();
    return true;
  };
  const typed = terminal.onData((input) => {
    send({ input });
  });
  const resized = terminal.onResize(() => {
    if (!replaying) send({ resize: size() });
  });
  const panelSize = new ResizeObserver(() => {
    if (!replaying) fit.fit();
  });
  panelSize.observe(screen);
  fit.fit();
  if (takesKeyboard) terminal.focus();

  return {
    terminal,
    insert,
    dispose: () => {
      current = false;
      stopTouchScroll();
      panelSize.disconnect();
      startedFrame.dispose();
      endedFrame.dispose();
      typed.dispose();
      resized.dispose();
      socket.close();
      terminal.dispose();
    },
  };
}
