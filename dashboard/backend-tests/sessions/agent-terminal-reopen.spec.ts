import { EventEmitter } from "node:events";
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import type { WebSocket } from "ws";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { executionCheckout } from "../../server/executionCheckout.ts";
import { JoinedSockets } from "../../server/joinedSockets.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord, keptSession } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { attachableSession } from "../../server/terminalAdmission.ts";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";

class Socket extends EventEmitter {
  readonly OPEN = 1;
  readonly readyState = this.OPEN;
  readonly output: string[] = [];

  send(text: string): void {
    this.output.push(text);
  }
}

const source = makeMe.aPublishedSource.openDough.please();
const sessionId = "588c4c19-0000-4000-8000-000000000008";
const terminal = new URL(agentTerminalEndpoint, "http://127.0.0.1:4173");
terminal.search = new URLSearchParams({
  source: source.id,
  host: "claude",
  session: sessionId,
}).toString();

let launches: AgentLaunches;
let claude: FakeClaudeControls;

beforeEach(() => {
  const machine = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-reopen-")),
  );
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    {},
  );
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  const unmount = mountProjectConfiguration("production");
  claude = fixture.controls;
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: launchHost,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    launches.close();
    await marks.close();
    await launches.drain();
    unmount();
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
  mkdirSync(executionCheckout(source).path, { recursive: true });
});

async function keepDoneSession() {
  const record = makeMe.aLaunchRecord
    .executing({ identity: "SEED-867#reopen", title: "Keep working" })
    .inClaudeSession({ sessionId })
    .markedDone()
    .please();
  await bindRecord(source.id, record);
  claude.claudeListingBecomes([
    makeMe.aClaudeListingRow
      .background({
        sessionId,
        name: record.session.name,
        cwd: executionCheckout(source).path,
        startedAt: Date.parse(record.launchedAt),
      })
      .as("stopped")
      .please(),
  ]);
  return record;
}

test("reopens a kept Done session as its terminal attaches", async () => {
  const done = await keepDoneSession();
  const admitted = await attachableSession(terminal, launches);
  expect(admitted.markedDone).toBe(true);

  const socket = new Socket();
  const sockets = new JoinedSockets({
    hostName: "Claude Code",
    admitted: true,
    readiness: undefined,
    startupFailure: undefined,
    isTracked: () => true,
    writeInput: () => {},
    resize: () => {},
    onDropped: () => {},
  });
  sockets.attach(socket as unknown as WebSocket, admitted, false);
  sockets.send("terminal output");
  await expect.poll(() => socket.output).toEqual(["terminal output"]);

  const reopened = await keptSession(source.id, done.session);
  if (reopened === undefined) throw new Error("Expected the reopened record.");
  expect(reopened).not.toHaveProperty("doneAt");
  expect((await launches.stateOf(source, reopened)).sessionState.kind).toBe(
    "available",
  );

  socket.emit("close");
  expect(sockets.hasOpen()).toBe(false);
  const afterDisconnect = await keptSession(source.id, done.session);
  expect(afterDisconnect).toBeDefined();
  expect(afterDisconnect).not.toHaveProperty("doneAt");
});

test("refusing terminal admission for a forgotten Claude Code session preserves its Done mark", async () => {
  const done = await keepDoneSession();
  claude.claudeSessionBecomes(sessionId, "forgotten");

  await expect(attachableSession(terminal, launches)).rejects.toMatchObject({
    status: 410,
  });

  expect(await keptSession(source.id, done.session)).toMatchObject({
    doneAt: done.doneAt,
  });
  expect(claude.claudeAttaches()).toEqual([]);
});
