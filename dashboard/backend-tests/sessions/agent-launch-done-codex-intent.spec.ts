// Local intent survives native lifecycle updates and is cleared by terminal readiness.
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
import {
  connection,
  observe,
  retire,
} from "../../server/hosts/codex/conversation.ts";
import { launchHost } from "../../server/launchHosts.ts";
import {
  bindRecord,
  deleteRecord,
  keptRecords,
  updateRecord,
} from "../../server/launchRecordStore.ts";
import type { LocalFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { TerminalAttachments } from "../../server/terminalAttachments.ts";
import { recordDeletable, type LaunchRecord } from "../../src/agentLaunch.ts";
import {
  codexEndpoint,
  installFakeCodex,
  type FakeCodex,
  type FakeCodexObservation,
} from "../../test-support/support/fakeCodex.ts";

const source = makeMe.aPublishedSource.openDough.please();

let native: FakeCodex;
let folder: LocalFolder;
let terminals: TerminalAttachments;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeEach(async () => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "dough-done-cx-")));
  const home = path.join(root, "home");
  mkdirSync(home);
  native = await installFakeCodex(root, process.env["PATH"] ?? "", true);
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", home);
  const unmount = mountProjectConfiguration("production");
  folder = executionCheckout(source);
  terminals = new TerminalAttachments();
  marks = new NativeDoneMarks({
    terminals,
    hostFor: launchHost,
    reportingFolder: () => folder,
  });
  launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    native.release();
    await marks.close();
    terminals.close();
    launches.close();
    await launches.drain();
    await native.close();
    unmount();
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });
  mkdirSync(folder.path, { recursive: true });
});

async function keepRunningTurn(
  turnId: string,
  firstInput?: LaunchRecord["firstInput"],
) {
  const builder = makeMe.aLaunchRecord
    .refining({
      source: source.id,
      identity: "SEED-867#codex-done",
      title: "Refine this story",
    })
    .inCodexSession({
      sessionId: native.threadId,
      continuation: { endpoint: codexEndpoint(native), workspace: folder.path },
    });
  if (firstInput !== undefined) builder.withFirstInput(firstInput);
  const record = builder.please();
  if (record.session.host !== "codex")
    throw new Error("Expected a Codex session.");
  const observation: FakeCodexObservation = {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: turnId, status: "inProgress" }],
  };
  native.observations.set(native.threadId, observation);
  native.cwd = folder.path;
  native.history = [{ id: firstInput?.turnId ?? "native-turn-id", items: [] }];
  await bindRecord(source.id, record);
  return { record: { ...record, session: record.session }, observation };
}

const kept = async () => (await keptRecords(source.id))[0];
const interrupts = () =>
  native.calls.filter(({ method }) => method === "turn/interrupt");

class TerminalSocket extends EventEmitter {
  readonly OPEN = 1;
  readyState = this.OPEN;
  output = "";

  send(text: string, options?: { binary?: boolean }): void {
    if (!options?.binary) this.output += text;
  }

  close(): void {
    this.readyState = 3;
    this.emit("close");
  }
}

test("a late failed interruption cannot restore local done intent after successful native readiness", async () => {
  const { record } = await keepRunningTurn("slow-turn");
  native.hold = true;
  native.interruptError = { code: -32000, message: "Late interrupt refusal." };

  const marking = marks.markDone(source, record, folder, launches);

  await expect.poll(interrupts).toHaveLength(1);
  expect((await kept())?.doneAt).toBeDefined();
  const socket = new TerminalSocket();
  terminals.connect(socket as unknown as WebSocket, {
    sourceId: source.id,
    session: record.session,
    folder,
    markedDone: true,
  });
  await expect.poll(() => socket.output).toContain("original retained history");
  socket.emit(
    "message",
    Buffer.from(
      JSON.stringify({
        cursorVisible: true,
        screen: ["› original conversation", "configured native footer"],
      }),
    ),
    false,
  );
  await expect.poll(async () => (await kept())?.doneAt).toBeUndefined();
  native.release();

  const marked = await marking;
  expect(marked).not.toHaveProperty("doneAt");
  expect(marked).not.toHaveProperty("doneProblem");
  expect(await kept()).toBeDefined();
  expect(await kept()).not.toHaveProperty("doneAt");
  expect(await kept()).not.toHaveProperty("doneProblem");
});

test("a native lifecycle callback retains done intent and a diagnostic before unknown record deletion", async () => {
  const firstInput = { state: "confirmed", turnId: "running-turn" } as const;
  const { record } = await keepRunningTurn(firstInput.turnId, firstInput);
  const rpc = connection(codexEndpoint(native), new AbortController().signal);
  onTestFinished(() => {
    retire(rpc);
  });
  await rpc.initialize();
  observe(rpc, record.session, firstInput, {
    async session(session, evidence) {
      const updated = await updateRecord(source.id, {
        ...record,
        session,
        firstInput: evidence,
      });
      if (!updated) throw new Error("The launch record was deleted.");
    },
    creating: () => Promise.reject(new Error("Expected an existing record.")),
    refused: () => Promise.reject(new Error("Expected an existing record.")),
  });
  native.interruptError = { code: -32000, message: "Native stop refused." };

  const marked = await marks.markDone(source, record, folder, launches);
  native.failConnection();

  expect(marked.doneAt).toBeDefined();
  expect(marked.doneProblem).toContain("Native stop refused.");
  await expect
    .poll(async () => {
      const session = (await kept())?.session;
      return session?.host === "codex"
        ? session.continuation?.notice
        : undefined;
    })
    .toContain("native connection ended");
  expect(await kept()).toMatchObject({
    doneAt: marked.doneAt,
    doneProblem: marked.doneProblem,
  });

  native.observations.set(native.threadId, {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32000, message: "Unreadable." },
  });
  const retained = await kept();
  if (retained === undefined)
    throw new Error("Expected the kept conversation.");
  const observed = await launches.stateOf(source, retained);
  expect(observed.sessionState).toEqual({ kind: "unknown" });
  expect(recordDeletable(observed)).toBe(true);
  expect(await deleteRecord(source.id, record.session)).toBe(true);
  native.failConnection();
  await expect.poll(() => native.sockets.size).toBe(0);
  expect(await keptRecords(source.id)).toEqual([]);
  expect((await launches.machineObservation()).records).toEqual([]);
});

test("a failed done operation returning after record deletion does not recreate the record", async () => {
  const { record, observation } = await keepRunningTurn("deleted-turn");
  native.hold = true;
  native.interruptError = { code: -32000, message: "Late stop refused." };

  const marking = marks.markDone(source, record, folder, launches);

  await expect.poll(interrupts).toHaveLength(1);
  observation.metadataError = {
    code: -32000,
    message: "Observation unreadable.",
  };
  const retained = await kept();
  if (retained === undefined)
    throw new Error("Expected the kept conversation.");
  const observed = await launches.stateOf(source, retained);
  expect(observed.sessionState).toEqual({ kind: "unknown" });
  expect(recordDeletable(observed)).toBe(true);
  expect(await deleteRecord(source.id, record.session)).toBe(true);
  expect(await keptRecords(source.id)).toEqual([]);
  native.release();
  await marking;
  expect(await keptRecords(source.id)).toEqual([]);
  native.failConnection();
  await expect.poll(() => native.sockets.size).toBe(0);
  expect((await launches.machineObservation()).records).toEqual([]);
});
