// Native PTY/WebSocket attachments and readiness, ordered by attachment time.
import type { IPty } from "@lydell/node-pty";
import type { RawData, WebSocket } from "ws";
import {
  terminalEndedCode,
  terminalAttachFailedCode,
  terminalMessageSchema,
  type TerminalMessage,
} from "../src/agentTerminal.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { launchHost } from "./launchHosts.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import type { TerminalSession } from "./agentTerminals.ts";

const initialSize = { cols: 80, rows: 24 } as const;
const notTerminalMessage = 1008;

function terminalMessage(
  data: RawData,
  isBinary: boolean,
): TerminalMessage | undefined {
  if (isBinary) {
    return undefined;
  }
  try {
    const parsed = terminalMessageSchema.safeParse(
      JSON.parse((data as Buffer).toString("utf8")),
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export class TerminalAttachments {
  private readonly attached = new Map<
    IPty,
    { readonly key: string; readonly ws: WebSocket }
  >();

  connect(ws: WebSocket, session: TerminalSession): void {
    let pty: IPty;
    let readiness:
      ((screen: string, cursorVisible: boolean) => boolean) | undefined;
    const host = launchHost(session.session.host);
    try {
      if (host?.attach === undefined) {
        throw new Error("This host cannot attach.");
      }
      const attachment = host.attach(
        session.session,
        session.folder,
        initialSize,
      );
      pty = attachment.pty;
      readiness = attachment.ready;
    } catch {
      ws.close(
        terminalAttachFailedCode,
        `${host?.name ?? session.session.host} could not be attached.`,
      );
      return;
    }
    this.attached.set(pty, { key: sessionKey(session.session), ws });
    // Native startup decisions must remain interactive before readiness.
    // A host with a readiness signal reopens only after that signal arrives.
    let ready = readiness === undefined;
    const reopen = () =>
      session.markedDone
        ? setRecordDoneAt(session.sourceId, session.session, undefined).catch(
            () => undefined,
          )
        : Promise.resolve();
    let reopened = ready ? reopen() : Promise.resolve();
    const closeUnavailableTerminal = () => {
      void reopened.then(() => {
        ws.close(
          ready ? terminalEndedCode : terminalAttachFailedCode,
          ready ? "The terminal ended." : `${host.name} could not be attached.`,
        );
      });
    };
    if (!ready)
      ws.send(JSON.stringify({ readiness: "observe" }), { binary: true });
    pty.onData((output) => {
      void reopened.then(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(output);
        }
      });
    });
    // Exited on its own, not ended by `detach`, whose socket is already
    // closing.
    pty.onExit(() => {
      if (this.attached.delete(pty)) {
        closeUnavailableTerminal();
      }
    });
    ws.on("message", (data, isBinary) => {
      const message = terminalMessage(data, isBinary);
      if (message === undefined) {
        ws.close(notTerminalMessage, "Not a terminal message.");
      } else if (this.attached.has(pty)) {
        if ("screen" in message) {
          if (
            !ready &&
            readiness?.(message.screen.join("\n"), message.cursorVisible)
          ) {
            ready = true;
            reopened = reopen();
            void reopened.then(() => {
              if (ws.readyState === ws.OPEN)
                ws.send(JSON.stringify({ readiness: "attached" }), {
                  binary: true,
                });
            });
          }
        } else if ("input" in message) {
          pty.write(message.input);
        } else {
          try {
            pty.resize(message.resize.cols, message.resize.rows);
          } catch {
            // The native descriptor can close before its exit callback arrives.
            this.detach(pty);
            closeUnavailableTerminal();
          }
        }
      }
    });
    ws.on("close", () => {
      this.detach(pty);
    });
  }

  // SIGHUP, as a closed terminal sends: the native CLI detaches and the session
  // keeps running.
  private detach(pty: IPty): void {
    if (!this.attached.delete(pty)) {
      return;
    }
    try {
      pty.kill("SIGHUP");
    } catch {
      // Already gone.
    }
  }

  // Types `input` into the newest open attachment to this session, and
  // answers whether one was open.
  type(session: SessionReference, input: string): boolean {
    const newest = [...this.attached]
      .filter(([, attachment]) => attachment.key === sessionKey(session))
      .at(-1);
    newest?.[0].write(input);
    return newest !== undefined;
  }

  // Ends every attachment to this session: its attach process detaches, and
  // its socket closes as an ended terminal.
  endAttachments(session: SessionReference): void {
    for (const [pty, attachment] of [...this.attached]) {
      if (attachment.key === sessionKey(session)) {
        this.detach(pty);
        attachment.ws.close(terminalEndedCode, "The terminal ended.");
      }
    }
  }

  // Detaches every native client; the admission boundary closes its sockets.
  close(): void {
    for (const pty of [...this.attached.keys()]) {
      this.detach(pty);
    }
  }
}
