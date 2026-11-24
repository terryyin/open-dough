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
  {
    connecting = false,
    answer = (input) => (input === "\u007f" ? "\b \b" : input),
  }: {
    readonly connecting?: boolean;
    readonly answer?: (input: string) => string;
  } = {},
) {
  const events = new EventTarget();
  const sent: string[] = [];
  const sizes: { cols: number; rows: number }[] = [];
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
        const reply = answer(parsed.input);
        if (reply !== "") print(reply);
      } else if ("resize" in parsed) {
        sizes.push(parsed.resize);
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
    sizes,
    open,
    print,
    refuse(explanation: string) {
      opened();
      control({ attachRefusal: { explanation } });
      closeWithCode(terminalAttachRefusalCode);
    },
    disconnect: () => {
      closeWithCode(1001);
    },
    end: () => {
      closeWithCode(terminalEndedCode);
    },
  };
}

export function openAttachedTerminal(): TerminalSocket {
  return terminalSocket("attached session").socket;
}
