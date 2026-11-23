import { terminalEndedCode } from "../../src/agentTerminal.ts";
import type { TerminalSocket } from "../../src/sessionServices.ts";

export function terminalSocket(output: string) {
  const events = new EventTarget();
  let readyState: number = WebSocket.OPEN;
  queueMicrotask(() => {
    events.dispatchEvent(new Event("open"));
    events.dispatchEvent(new MessageEvent("message", { data: output }));
  });

  const socket: TerminalSocket = {
    binaryType: "arraybuffer",
    get readyState() {
      return readyState;
    },
    send: () => undefined,
    close: () => {
      readyState = WebSocket.CLOSED;
    },
    addEventListener: (type, listener) => {
      events.addEventListener(type, (event) => {
        listener(event as WebSocketEventMap[typeof type]);
      });
    },
  };

  return {
    socket,
    end: () => {
      socket.close();
      events.dispatchEvent(
        new CloseEvent("close", { code: terminalEndedCode }),
      );
    },
  };
}

export function openAttachedTerminal(): TerminalSocket {
  return terminalSocket("attached session").socket;
}
