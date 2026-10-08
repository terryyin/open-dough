// Protocol-only vendor substitute installed by the existing dashboard server
// fixture. Actual HTTP/page code creates and persists every launch record.
import { defaultCodexModels, answerCodexCatalog } from "./fakeCodexCatalog.ts";
import { answerCodexInput } from "./fakeCodexInput.ts";
import { answerCodexCreation } from "./fakeCodexCreation.ts";
import { createServer } from "node:http";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { WebSocketServer, type WebSocket } from "ws";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import { answerCodexControl } from "./fakeCodexControl.ts";
import { closeCodexDaemon, listenForCodexDaemon } from "./fakeCodexDaemon.ts";
import { passiveCodexFixture } from "./fakeCodexObservation.ts";
import type { FakeCodex } from "./fakeCodexTypes.ts";
import type { FakeHostWiring } from "./launchEnvironment.ts";
export type {
  CodexCall,
  FakeCodex,
  FakeCodexObservation,
} from "./fakeCodexTypes.ts";

const codexBinDir = "codex-bin";

// The fake's directory and one variable wiring it, for reading its recorded
// environment.
export function fakeCodexHost(wiring: string): FakeHostWiring {
  return { binDir: codexBinDir, wiring };
}

export async function installFakeCodex(
  tempRoot: string,
  searchPath: string,
  serve: boolean | "on-start",
): Promise<FakeCodex> {
  const bin = path.join(tempRoot, codexBinDir);
  installFixtureExecutable("fake-codex", bin, "codex");
  installFixtureExecutable(
    "fake-host-environment.cjs",
    bin,
    "fake-host-environment.cjs",
  );
  const terminalRoot = path.join(tempRoot, "codex-terminal");
  mkdirSync(terminalRoot, { recursive: true });
  writeFileSync(
    path.join(terminalRoot, "control.json"),
    JSON.stringify({ mode: "ready" }),
  );
  const socket = path.join(tempRoot, "codex.sock");
  const http = createServer();
  const ws = new WebSocketServer({ server: http });
  const sockets = new Set<WebSocket>();
  const waiting: Array<() => void> = [];
  const passive = passiveCodexFixture();
  const fixture: FakeCodex = {
    models: defaultCodexModels(),
    modelPageSize: 100,
    holdCatalog: false,
    binDir: bin,
    env: {
      FAKE_CODEX_TERMINAL_ROOT: terminalRoot,
      FAKE_CODEX_CLI_LOG: path.join(tempRoot, "cli-resume.jsonl"),
      FAKE_CODEX_DAEMON_LOG: path.join(tempRoot, "daemon-start.jsonl"),
      FAKE_CODEX_ENV_LOG: path.join(tempRoot, "codex-environments.jsonl"),
      PATH: [bin, searchPath].join(path.delimiter),
      ...(serve ? { FAKE_CODEX_SOCKET: socket } : {}),
      ...(serve === "on-start" ? { FAKE_CODEX_WAIT_FOR_SOCKET: "1" } : {}),
    },
    calls: [],
    sockets,
    observations: passive.observations,
    names: new Map(),
    releaseReads() {
      passive.releaseReads();
    },
    threadId: "native-thread-id",
    hold: false,
    holdCreation: false,
    refuseCreation: false,
    creationError: { code: -32000, message: "Native creation refused." },
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
      await closeCodexDaemon(http, ws, sockets, stopListening);
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
        if (client.readyState !== 1) return;
        client.send(JSON.stringify({ id: message.id, result }));
      };
      const refuse = (error: unknown) => {
        if (client.readyState === 1)
          client.send(JSON.stringify({ id: message.id, error }));
      };
      if (
        passive.answer(
          message.method,
          message.params ?? {},
          fixture.history,
          reply,
          refuse,
        )
      )
        return;
      if (
        answerCodexControl(
          fixture,
          message.method,
          message.params ?? {},
          waiting,
          reply,
          refuse,
        )
      )
        return;
      switch (message.method) {
        case "initialize":
          reply({ userAgent: "native-substitute" });
          break;
        case "config/read":
          if (fixture.configError) {
            refuse(fixture.configError);
            break;
          }
          reply({
            config: {
              model:
                fixture.configuredModels?.[String(message.params?.["cwd"])] ??
                (fixture.configuredModel === undefined
                  ? "native-sol"
                  : fixture.configuredModel),
            },
          });
          break;
        case "model/list":
          answerCodexCatalog(
            fixture,
            message.params ?? {},
            waiting,
            reply,
            refuse,
          );
          break;
        case "thread/start":
          answerCodexCreation(
            fixture,
            message.params ?? {},
            waiting,
            reply,
            refuse,
            client,
          );
          break;
        case "thread/read":
        case "thread/resume":
          fixture.beforeRead?.(message.params?.["includeTurns"] === true);
          if (fixture.readError)
            refuse({ code: -32000, message: "Native thread not found." });
          else if (
            fixture.blankHistoryError &&
            message.params?.["includeTurns"]
          )
            refuse(fixture.blankHistoryError);
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
              thread: {
                id: fixture.threadId,
                cwd: fixture.cwd,
                turns,
                status: { type: "active", activeFlags: [] },
              },
            });
          }
          break;
        case "turn/start":
          answerCodexInput(
            fixture,
            message.params ?? {},
            waiting,
            reply,
            refuse,
            client,
          );
          break;
      }
    });
  });
  const stopListening = await listenForCodexDaemon(
    http,
    socket,
    serve,
    fixture.env["FAKE_CODEX_DAEMON_LOG"] ?? "",
  );
  return fixture;
}
