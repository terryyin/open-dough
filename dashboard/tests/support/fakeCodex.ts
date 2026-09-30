// Protocol-only vendor substitute installed by the existing dashboard server
// fixture. Actual HTTP/page code creates and persists every launch record.
import { createServer } from "node:http";
import path from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import { installFixtureExecutable } from "./fixtureExecutable.ts";

export type CodexCall = { method: string; params: Record<string, unknown> };
export type FakeCodex = {
  readonly binDir: string;
  readonly env: Record<string, string>;
  readonly calls: CodexCall[];
  readonly sockets: Set<WebSocket>;
  threadId: string;
  hold: boolean;
  refuseCreation: boolean;
  refuseInput: boolean;
  loseCreation: boolean;
  failRead: boolean;
  readError: boolean;
  completeOnResume: boolean;
  resumeStatus?: string;
  history: { id: string; status?: string; items: unknown[] }[];
  cwd: string;
  afterCreation?: () => void;
  afterAcceptance: "continue" | "complete" | "disconnect";
  beforeInput?: () => void;
  release(): void;
  failConnection(): void;
  close(): Promise<void>;
};

export async function installFakeCodex(
  tempRoot: string,
  searchPath: string,
  serve: boolean,
): Promise<FakeCodex> {
  const bin = path.join(tempRoot, "codex-bin");
  installFixtureExecutable("fake-codex", bin, "codex");
  const socket = path.join(tempRoot, "codex.sock");
  const http = createServer();
  const ws = new WebSocketServer({ server: http });
  const sockets = new Set<WebSocket>();
  const waiting: Array<() => void> = [];
  const fixture: FakeCodex = {
    binDir: bin,
    env: {
      FAKE_CODEX_CLI_LOG: path.join(tempRoot, "cli-resume.jsonl"),
      PATH: [bin, searchPath].join(path.delimiter),
      ...(serve ? { FAKE_CODEX_SOCKET: socket } : {}),
    },
    calls: [],
    sockets,
    threadId: "native-thread-id",
    hold: false,
    refuseCreation: false,
    refuseInput: false,
    loseCreation: false,
    failRead: false,
    readError: false,
    completeOnResume: false,
    history: [],
    cwd: "",
    afterAcceptance: "continue",
    release() {
      for (const done of waiting.splice(0)) done();
    },
    failConnection() {
      for (const client of sockets) client.terminate();
    },
    async close() {
      for (const client of sockets) client.terminate();
      await new Promise<void>((resolve) => {
        ws.close(() => {
          resolve();
        });
      });
      if (serve)
        await new Promise<void>((resolve) =>
          http.close(() => {
            resolve();
          }),
        );
    },
  };
  ws.on("connection", (client) => {
    sockets.add(client);
    client.on("close", () => sockets.delete(client));
    client.on("message", (raw) => {
      const message = JSON.parse(
        (Array.isArray(raw)
          ? Buffer.concat(raw)
          : raw instanceof ArrayBuffer
            ? Buffer.from(raw)
            : raw
        ).toString("utf8"),
      ) as { id?: number; method: string; params?: Record<string, unknown> };
      fixture.calls.push({
        method: message.method,
        params: message.params ?? {},
      });
      const reply = (result: unknown) => {
        client.send(JSON.stringify({ id: message.id, result }));
      };
      switch (message.method) {
        case "initialize":
          reply({ userAgent: "native-substitute" });
          break;
        case "thread/start":
          fixture.cwd = String(message.params?.["cwd"]);
          fixture.afterCreation?.();
          if (fixture.loseCreation) {
            client.close();
            break;
          }
          if (fixture.refuseCreation)
            client.send(
              JSON.stringify({
                id: message.id,
                error: { code: -32000, message: "Native creation refused." },
              }),
            );
          else reply({ thread: { id: fixture.threadId } });
          break;
        case "thread/read":
        case "thread/resume":
          if (fixture.readError)
            client.send(
              JSON.stringify({
                id: message.id,
                error: { code: -32000, message: "Native thread not found." },
              }),
            );
          else if (fixture.failRead) client.close();
          else {
            if (message.method === "thread/resume" && fixture.completeOnResume)
              client.send(
                JSON.stringify({
                  method: "turn/completed",
                  params: {
                    threadId: fixture.threadId,
                    turn: { id: "native-turn-id", status: "completed" },
                  },
                }),
              );
            const turns =
              message.method === "thread/resume" &&
              fixture.resumeStatus !== undefined
                ? fixture.history.map((turn) => ({
                    ...turn,
                    status: fixture.resumeStatus,
                  }))
                : fixture.history;
            reply({
              thread: { id: fixture.threadId, cwd: fixture.cwd, turns },
            });
          }
          break;
        case "turn/start": {
          if (fixture.refuseInput) {
            client.send(
              JSON.stringify({
                id: message.id,
                error: { code: -32000, message: "Native input refused." },
              }),
            );
            break;
          }
          fixture.history.push({
            id: "native-turn-id",
            items: [
              {
                type: "userMessage",
                id: "user-input",
                content: message.params?.["input"],
              },
              {
                type: "reasoning",
                id: "reasoning-item",
                summary: [],
                content: ["protocol fixture reasoning"],
              },
              {
                type: "commandExecution",
                id: "command-item",
                command: "native fixture",
                status: "completed",
              },
            ],
          });
          fixture.beforeInput?.();
          const accepted = () => {
            if (client.readyState !== 1) return;
            reply({ turn: { id: "native-turn-id", status: "inProgress" } });
            if (fixture.afterAcceptance === "complete")
              client.send(
                JSON.stringify({
                  method: "turn/completed",
                  params: {
                    threadId: fixture.threadId,
                    turn: { id: "native-turn-id", status: "completed" },
                  },
                }),
              );
            if (fixture.afterAcceptance === "disconnect") client.close();
          };
          if (fixture.hold) waiting.push(accepted);
          else accepted();
          break;
        }
      }
    });
  });
  if (serve)
    await new Promise<void>((resolve, reject) => {
      http.once("error", reject);
      http.listen(socket, resolve);
    });
  return fixture;
}
