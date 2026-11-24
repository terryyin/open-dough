import {
  terminalAttachRefusalCode,
  terminalEndedCode,
  terminalMessageSchema,
  type TerminalAttachRefusal,
  type TerminalControl,
} from "../../src/agentTerminal.ts";
import type { TerminalSocket } from "../../src/sessionServices.ts";

export function terminalSocket(
  output: string,
  { connecting = false }: { readonly connecting?: boolean } = {},
) {
  const events = new EventTarget();
  const sent: string[] = [];
  let readyState: number = WebSocket.CONNECTING;

  function print(data: string) {
    events.dispatchEvent(new MessageEvent("message", { data }));
  }

  function control(
    message: TerminalControl | { attachRefusal: TerminalAttachRefusal },
  ) {
    const data = new TextEncoder().encode(JSON.stringify(message)).buffer;
    events.dispatchEvent(new MessageEvent("message", { data }));
  }

  function opened() {
    readyState = WebSocket.OPEN;
    events.dispatchEvent(new Event("open"));
  }

  function open() {
    opened();
    control({ readiness: "attached" });
    print(output);
  }

  function closeWithCode(code: number) {
    readyState = WebSocket.CLOSED;
    events.dispatchEvent(new CloseEvent("close", { code }));
  }

  if (!connecting) queueMicrotask(open);

  const socket: TerminalSocket = {
    binaryType: "arraybuffer",
    get readyState() {
      return readyState;
    },
    send: (message) => {
      const parsed = terminalMessageSchema.parse(JSON.parse(message));
      if ("input" in parsed) {
        sent.push(parsed.input);
        print(parsed.input === "\u007f" ? "\b \b" : parsed.input);
      }
    },
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
    sent,
    open,
    print,
    refuse(explanation: string) {
      opened();
      control({ attachRefusal: { explanation } });
      closeWithCode(terminalAttachRefusalCode);
    },
    end: () => {
      closeWithCode(terminalEndedCode);
    },
  };
}

export function openAttachedTerminal(): TerminalSocket {
  return terminalSocket("attached session").socket;
}
