// Launch records another process on this machine recorded or marked done:
// this process's next read of the store it already read answers them, a fresh
// process reads the same, and concurrent done marks from both processes all
// survive without reviving review attention. Each test owns a private machine
// home; the other process is a forked Node child bound to the same home.
import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { on } from "node:events";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, expect, test, vi } from "vitest";
import { z } from "zod";
import { NativeDoneMarks, type DoneLaunches } from "../../server/doneMarks.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { withStates } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { launchRecordSchema } from "../../src/launchRecord.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { alertReading } from "../../src/sessionShown.ts";
import { attentionCount } from "../../src/sessionCounts.ts";
import { installFakeClaude } from "../../test-support/support/fakeClaude.ts";

const childMode = "--launch-records-child";
const records = z.array(launchRecordSchema);

// The developer's Done on a host that stops without renaming.
function doneMarks() {
  return new NativeDoneMarks({
    terminals: {
      withAttachment: () =>
        Promise.reject(new Error("This proof attaches no terminal.")),
      endAttachments: () => undefined,
    },
    hostFor: () => ({ name: "Claude", doneStop: () => Promise.resolve() }),
    reportingFolder: machineFolder,
  });
}
const unobserved: DoneLaunches = {
  stateOf: (...[, record]) =>
    Promise.resolve({ ...record, sessionState: { kind: "unknown" } }),
};

async function childOperation(): Promise<void> {
  const send = process.send?.bind(process);
  assert(send, "The other process requires IPC.");
  const [message] = (await new Promise<unknown[]>((resolve) => {
    process.once("message", (...args) => {
      resolve(args);
    });
  })) as [{ kind: string; source: PublishedSource; records: unknown }];
  const given = records.parse(message.records);
  if (message.kind === "record")
    for (const record of given) await bindRecord(message.source.id, record);
  if (message.kind === "mark") {
    const marks = doneMarks();
    await Promise.all(
      given.map((record) =>
        marks.markDone(message.source, record, machineFolder(), unobserved),
      ),
    );
    await marks.close();
  }
  send(await keptRecords(message.source.id));
  process.disconnect?.();
}

// Runs one operation in another Node process bound to this machine home and
// answers the records it then reads.
async function inOtherProcess(
  signal: AbortSignal,
  kind: "record" | "mark" | "read",
  source: PublishedSource,
  given: readonly LaunchRecord[] = [],
): Promise<LaunchRecord[]> {
  const child = fork(fileURLToPath(import.meta.url), [childMode], {
    execArgv: [
      "--experimental-transform-types",
      "--disable-warning=ExperimentalWarning",
    ],
    signal,
  });
  const exited = new Promise<number | null>((resolve) =>
    child.once("exit", resolve),
  );
  const messages = on(child, "message", { signal, close: ["exit"] });
  child.send({ kind, source, records: given });
  const next: IteratorResult<unknown[]> = await messages.next();
  assert(!next.done, "The other process exited before answering.");
  expect(await exited).toBe(0);
  return records.parse(next.value[0]);
}

function privateMachine(): string {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-records-machine-"));
  const fixture = installFakeClaude(
    machine,
    { binDir: machine, path: process.env.PATH ?? "" },
    {},
  );
  for (const [key, value] of Object.entries(fixture.env))
    vi.stubEnv(key, value);
  return machine;
}

// Dates the store a minute back, so this process holds what it parsed.
function settleStore(): void {
  const earlier = new Date(Date.now() - 60_000);
  utimesSync(machineDashboardPath("agent-launches.json"), earlier, earlier);
}

const everyOther = <T>(items: readonly T[], offset: 0 | 1): T[] =>
  items.filter((...[, index]) => index % 2 === offset);

const sessionIds = (count: number, suffix: string) =>
  Array.from(
    Array<unknown>(count).keys(),
    (index) => `${String(index).padStart(8, "0")}-0000-4000-8000-${suffix}`,
  );

if (process.argv[2] === childMode) {
  await childOperation();
} else {
  const { makeMe } =
    await import("../../../Distribution/tests/support/makeMe.mjs");
  const source = makeMe.aPublishedSource.openDough.please();
  const story = { identity: "SEED-001#first", title: "First story" };
  const execution = (sessionId: string) =>
    makeMe.aLaunchRecord.executing(story).inClaudeSession({ sessionId });
  let machine: string;

  beforeEach(() => {
    machine = privateMachine();
    return () => {
      vi.unstubAllEnvs();
      rmSync(machine, { recursive: true, force: true });
    };
  });

  test("reads a launch another process recorded after this one read the store, as a fresh process does", async ({
    signal,
  }) => {
    const kept = execution("10000000-0000-4000-8000-000000000001").please();
    await replaceRecords(() => ({ [source.id]: [kept] }));
    settleStore();
    expect(await keptRecords(source.id)).toEqual([kept]);
    expect(await keptRecords(source.id)).toEqual([kept]);

    const recorded = makeMe.aLaunchRecord
      .adHoc({ title: "Fix the typo" })
      .inClaudeSession({ sessionId: "20000000-0000-4000-8000-000000000002" })
      .please();
    await inOtherProcess(signal, "record", source, [recorded]);

    expect(await keptRecords(source.id)).toEqual([kept, recorded]);
    expect(await inOtherProcess(signal, "read", source)).toEqual([
      kept,
      recorded,
    ]);
  });

  test("keeps every done mark from concurrent processes and raises no review attention after the session exits", async ({
    signal,
  }) => {
    const sessions = sessionIds(24, "000000000001");
    const all = sessions.map((sessionId) => execution(sessionId).please());
    await replaceRecords(() => ({ [source.id]: all }));
    const marks = doneMarks();
    const here = everyOther(all, 0);
    const there = everyOther(all, 1);

    const [markedHere] = await Promise.all([
      Promise.all(
        here.map((record) =>
          marks.markDone(source, record, machineFolder(), unobserved),
        ),
      ),
      inOtherProcess(signal, "mark", source, there),
    ]);
    await marks.close();
    const kept = await keptRecords(source.id);
    expect(kept.map((record) => record.session.sessionId)).toEqual(sessions);
    expect(kept.every((record) => record.doneAt !== undefined)).toBe(true);
    expect(everyOther(kept, 0).map((record) => record.doneAt)).toEqual(
      markedHere.map((record) => record.doneAt),
    );

    // Native completion can arrive after closure; it must not revive attention.
    const checkout = path.join(machine, "home", "git", source.id);
    mkdirSync(checkout, { recursive: true });
    writeFileSync(
      path.join(machine, "claude-state", "agents.json"),
      JSON.stringify(
        sessions.map((sessionId) =>
          makeMe.aClaudeListingRow
            .background({
              sessionId,
              name: story.title,
              cwd: checkout,
              startedAt: Date.now(),
            })
            .as("done-exited")
            .please(),
        ),
      ),
    );
    const observed = await withStates({ path: checkout, shown: "~" }, kept);
    expect(observed.map((record) => record.sessionState)).toEqual(
      sessions.map(() => ({
        kind: "available",
        availability: "retained",
        activity: "review",
      })),
    );
    expect(attentionCount(observed)).toBe(0);
    expect(observed.map(alertReading)).toEqual(sessions.map(() => undefined));
  });
}
