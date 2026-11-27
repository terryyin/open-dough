// Mark as done renames the kept conversation and only interrupts a known active turn.
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
import { launchHost } from "../../server/launchHosts.ts";
import {
  bindRecord,
  keptRecords,
  updateRecord,
} from "../../server/launchRecordStore.ts";
import type { LocalFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { admittedDone } from "../../server/sessionAdmission.ts";
import { TerminalAttachments } from "../../server/terminalAttachments.ts";
import {
  codexAttaches,
  codexEnded,
  codexLines,
} from "../../test-support/support/codexTerminal.ts";
import {
  codexEndpoint,
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

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

async function keepConversation() {
  const record = makeMe.aLaunchRecord
    .refining({
      source: source.id,
      identity: "SEED-867#codex-done",
      title: "Refine this story",
    })
    .inCodexSession({
      sessionId: native.threadId,
      continuation: { endpoint: codexEndpoint(native), workspace: folder.path },
    })
    .please();
  native.cwd = folder.path;
  native.history = [{ id: "native-turn-id", items: [] }];
  await bindRecord(source.id, record);
  return record;
}

class TerminalSocket extends EventEmitter {
  readonly OPEN = 1;
  readyState = this.OPEN;
  output = "";
  closeCode?: number;

  send(text: string, options?: { binary?: boolean }): void {
    if (!options?.binary) this.output += text;
  }

  close(code: number): void {
    if (this.readyState !== this.OPEN) return;
    this.readyState = 3;
    this.closeCode = code;
    this.emit("close");
  }
}

async function attach(
  session: Awaited<ReturnType<typeof keepConversation>>["session"],
) {
  const socket = new TerminalSocket();
  terminals.connect(socket as unknown as WebSocket, {
    sourceId: source.id,
    folder,
    session,
    markedDone: false,
  });
  await expect.poll(() => socket.output).toContain("original retained history");
  return socket;
}

const calls = (method: string) =>
  native.calls.filter((call) => call.method === method);

for (const status of ["active", "idle", "notLoaded"] as const) {
  for (const attached of [false, true]) {
    test(`${status} conversation marked done ${attached ? "with" : "without"} attachment preserves history and native identity`, async () => {
      const record = await keepConversation();
      native.observations.set(native.threadId, {
        status:
          status === "active"
            ? { type: status, activeFlags: [] }
            : { type: status },
        turns: [
          {
            id: "observed-turn",
            status: status === "active" ? "inProgress" : "completed",
          },
        ],
      });
      const socket = attached ? await attach(record.session) : undefined;
      const name = `done-${record.session.name}`;

      const marked = await marks.markDone(source, record, folder, launches);

      expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
      expect(await launches.stateOf(source, marked)).toMatchObject({
        session: record.session,
        sessionState: {
          kind: "available",
          activity: status === "active" ? "interrupted" : "review",
        },
      });
      expect(await keptRecords(source.id)).toMatchObject([
        { session: record.session, doneAt: marked.doneAt },
      ]);
      expect((await keptRecords(source.id))[0]?.doneProblem).toBeUndefined();
      expect(native.names.get(native.threadId)).toBe(name);
      expect(calls("thread/name/set")).toEqual([
        {
          method: "thread/name/set",
          params: { threadId: native.threadId, name },
        },
      ]);
      expect(calls("turn/interrupt")).toEqual(
        status === "active"
          ? [
              {
                method: "turn/interrupt",
                params: { threadId: native.threadId, turnId: "observed-turn" },
              },
            ]
          : [],
      );
      expect(native.observations.get(native.threadId)?.turns).toHaveLength(1);
      expect(native.history).toHaveLength(1);
      expect(calls("thread/start")).toEqual([]);
      expect(calls("turn/start")).toEqual([]);
      if (socket === undefined) {
        expect(codexAttaches(native)).toEqual([]);
      } else {
        expect(socket.closeCode).toBe(4000);
        const attaches = codexAttaches(native);
        expect(attaches).toHaveLength(1);
        const [attached] = attaches;
        if (attached === undefined)
          throw new Error("The native attachment was not recorded.");
        const { pid } = attached;
        await expect.poll(() => codexEnded(native, pid)).toBe("SIGHUP");
        await expect.poll(() => processRunning(pid)).toBe(false);
        expect(codexLines(native, pid)).toEqual([]);
      }
    });
  }
}

test("an unrecorded Codex Done request is refused before native reads or writes", async () => {
  await keepConversation();
  const before = [...native.calls];

  await expect(
    admittedDone(
      {
        source: source.id,
        session: "unknown",
        host: "codex",
      },
      launches,
    ),
  ).rejects.toMatchObject({ status: 404 });

  expect(native.calls).toEqual(before);
  expect((await keptRecords(source.id))[0]?.doneAt).toBeUndefined();
});

test("missing saved endpoint retains local intent, ends the attachment and reports unconfirmed operations", async () => {
  const record = await keepConversation();
  const socket = await attach(record.session);
  const predecessor = {
    ...record,
    session: makeMe.aHostSession
      .codex({ sessionId: native.threadId })
      .named(record.session.name)
      .please(),
  };
  expect(await updateRecord(source.id, predecessor)).toBe(true);
  const before = [...native.calls];

  const marked = await marks.markDone(source, predecessor, folder, launches);

  expect(Date.parse(marked.doneAt ?? "")).not.toBeNaN();
  expect(marked.doneProblem).toContain(
    "Codex rename failed: Saved native endpoint is missing.",
  );
  expect(marked.doneProblem).toContain(
    "Codex stop failed: Saved native endpoint is missing.",
  );
  expect((await launches.stateOf(source, marked)).sessionState).toEqual({
    kind: "unknown",
  });
  expect(await keptRecords(source.id)).toMatchObject([
    { doneAt: marked.doneAt, doneProblem: marked.doneProblem },
  ]);
  expect(marked.doneProblem).toContain("Local done mark retained");
  expect(native.calls).toEqual(before);
  expect(socket.closeCode).toBe(4000);
});
