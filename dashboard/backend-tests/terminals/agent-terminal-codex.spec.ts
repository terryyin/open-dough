// Codex native terminal: the launch boundary on a plain HTTP server, with
// fake-codex supplying only native startup/transport output, resumes a saved
// Codex context in the developer's shell environment. The server process
// carries a deployment's start-up environment, as `npm run` gives it.

import { mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  afterAll,
  beforeAll,
  beforeEach,
  expect,
  onTestFinished,
  test,
} from "vitest";
import { machineSessions } from "../../test-support/agentLaunchBoundary.ts";
import {
  refusedResponse,
  refusedStatus,
  shows,
  terminalUrl,
  type TerminalServer,
} from "../../test-support/agentTerminalBoundary.ts";
import { startCodexTerminalBoundary } from "../../test-support/terminalBoundaryHttp.ts";
import {
  codexEnvironments,
  givenSavedCodexSession,
} from "../../test-support/support/codexObservation.ts";
import {
  codexAttaches,
  codexEnded,
  codexEndOnceGone,
  codexLines,
  codexTerminalMode,
  openCodexTerminal,
} from "../../test-support/support/codexTerminal.ts";
import {
  type FakeCodex,
  fakeCodexHost,
} from "../../test-support/support/fakeCodex.ts";
import {
  deploymentLikeStart,
  developerShellViolations,
} from "../../test-support/support/launchEnvironment.ts";
import {
  changeLaunchStore,
  keepLaunchStore,
  keptLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

let server: TerminalServer;
let native: FakeCodex;
let stop: () => Promise<void>;
let attachesBefore: number;
let resumesBefore: number;

// This case's attaches and resume environments: the shared fake keeps every
// earlier case's.
const attaches = () => codexAttaches(native).slice(attachesBefore);
const resumeEnvironments = () =>
  codexEnvironments(native, "resume").slice(resumesBefore);
const stored = () => keptLaunchRecords(server) as LaunchRecord[];

async function openTerminal() {
  const terminal = await openCodexTerminal(server, native.threadId);
  onTestFinished(() => {
    terminal.socket.terminate();
  });
  return terminal;
}

const nativeTurnCalls = (calls: FakeCodex["calls"]) =>
  calls.filter((call) =>
    ["thread/start", "thread/resume", "turn/start", "turn/interrupt"].includes(
      call.method,
    ),
  );

beforeAll(async () => {
  const deploymentRoot = mkdtempSync(path.join(tmpdir(), "dough-deployment-"));
  const start = deploymentLikeStart(deploymentRoot);
  start.create();
  const restoreEnv = withRestoredEnv({
    ...start.extraEnv,
    PATH: [...start.pathPrefix, process.env["PATH"] ?? ""].join(path.delimiter),
  });
  const started = await startCodexTerminalBoundary(["open-dough"]);
  ({ server, native } = started);
  stop = async () => {
    try {
      await started.stop();
    } finally {
      restoreEnv();
      start.remove();
    }
  };
});

afterAll(async () => {
  await stop();
});

beforeEach(async () => {
  keepLaunchStore(server, {});
  native.observations.delete(native.threadId);
  codexTerminalMode(native, "ready");
  attachesBefore = codexAttaches(native).length;
  resumesBefore = codexEnvironments(native, "resume").length;
  await givenSavedCodexSession(server, native);
});

test("saved context supplies native resume, transport and detach without replay or fork", async () => {
  const record = stored()[0];
  if (record?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  const before = [...native.calls];
  const terminal = await openTerminal();
  expect(await shows(terminal, "original retained history")).toBe(true);
  const attach = attaches()[0];
  expect(attach).toMatchObject({
    cwd: realpathSync(record.session.continuation?.workspace ?? ""),
    cols: 80,
    rows: 24,
  });
  expect(attach?.args).toEqual([
    "resume",
    "--remote",
    record.session.continuation?.endpoint,
    "--cd",
    record.session.continuation?.workspace,
    "--no-alt-screen",
    native.threadId,
  ]);
  const resumes = resumeEnvironments();
  expect(resumes).toHaveLength(1);
  expect(
    developerShellViolations(
      resumes.at(-1),
      fakeCodexHost("FAKE_CODEX_TERMINAL_ROOT"),
    ),
  ).toEqual([]);
  terminal.send({ input: "answer\r" });
  expect(await shows(terminal, "echo answer")).toBe(true);
  terminal.send({ resize: { cols: 120, rows: 40 } });
  expect(await shows(terminal, "resized 120x40")).toBe(true);
  expect(codexLines(native, attach?.pid ?? 0)).toEqual(["answer"]);
  terminal.socket.close();
  await expect
    .poll(() => codexEndOnceGone(native, attach?.pid ?? 0))
    .toBe("SIGHUP");
  expect(await machineSessions(server)).toHaveLength(1);
  expect(nativeTurnCalls(native.calls)).toEqual(nativeTurnCalls(before));
  const unknown = new URL(terminalUrl(server, "open-dough", "unknown"));
  unknown.searchParams.set("host", "codex");
  expect(await refusedStatus(unknown.href, { origin: server.origin })).toBe(
    404,
  );
  expect(attaches()).toHaveLength(1);
  unknown.searchParams.set("session", native.threadId);
  expect(
    await refusedStatus(unknown.href, { origin: "http://evil.example" }),
  ).toBe(403);
  expect(attaches()).toHaveLength(1);
});

test("exact native missing-target evidence refuses attachment with a Codex explanation", async () => {
  const recordsBefore = stored();
  native.observations.set(native.threadId, {
    status: { type: "idle" },
    turns: [],
    metadataError: {
      code: -32600,
      message: `thread not loaded: ${native.threadId}`,
    },
  });
  const url = new URL(terminalUrl(server, "open-dough", native.threadId));
  url.searchParams.set("host", "codex");
  const response = await refusedResponse(url.href, { origin: server.origin });

  expect(response.status).toBe(410);
  expect(JSON.parse(response.body)).toEqual({
    error: "This conversation is no longer available in Codex.",
  });
  expect(attaches()).toEqual([]);
  expect(server.claudeAttaches()).toEqual([]);
  expect(stored()).toEqual(recordsBefore);
});

test("failed exit and unconfigured startup preserve done intent; native ready clears only this host's mark", async () => {
  const record = stored()[0];
  if (record === undefined) throw new Error("Missing saved record");
  const doneAt = new Date(Date.now() - 60_000).toISOString();
  changeLaunchStore(server, (state) => ({
    ...state,
    "open-dough": [
      { ...record, doneAt },
      {
        ...record,
        // Another host's session with the same ID keeps its own done mark.
        session: makeMe.aHostSession
          .claude({ sessionId: native.threadId, shortId: "another-host" })
          .named("same ID")
          .please(),
        doneAt,
      },
    ],
  }));
  codexTerminalMode(native, "fail");
  const failed = await openTerminal();
  expect(await failed.closed).toBe(1011);
  expect(codexEnded(native, attaches()[0]?.pid ?? 0)).toBe("refused");
  await expect.poll(() => processRunning(attaches()[0]?.pid ?? 0)).toBe(false);
  expect(stored().map((entry) => entry.doneAt)).toEqual([doneAt, doneAt]);
  codexTerminalMode(native, "unready");
  const pending = await openTerminal();
  expect(await shows(pending, "Input disabled.")).toBe(true);
  pending.send({
    cursorVisible: true,
    screen: [
      "OpenAI Codex (v0.159.3)",
      "Resuming session…",
      "› Ask Codex to do anything",
    ],
  });
  await machineSessions(server);
  expect(stored()[0]?.doneAt).toBe(doneAt);
  pending.send({
    cursorVisible: false,
    screen: ["› retained draft", "custom native footer"],
  });
  await machineSessions(server);
  expect(stored()[0]?.doneAt).toBe(doneAt);
  pending.socket.close();
  const pendingPid = attaches().at(-1)?.pid ?? 0;
  await expect.poll(() => codexEnded(native, pendingPid)).toBe("SIGHUP");
  codexTerminalMode(native, "ready");
  const ready = await openTerminal();
  expect(await shows(ready, "GPT-6.1-Sol default")).toBe(true);
  ready.send({
    cursorVisible: true,
    screen: ["› already typed draft", "configured custom footer"],
  });
  await expect.poll(() => stored()[0]?.doneAt).toBeUndefined();
  expect(stored()[1]?.doneAt).toBe(doneAt);
  ready.send({ input: "\u001a" });
  expect(await ready.closed).toBe(4000);
  await expect
    .poll(() => processRunning(attaches().at(-1)?.pid ?? 0))
    .toBe(false);
});
