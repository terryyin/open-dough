// Launch records another process on this machine recorded or marked done:
// this process's next read of the store it already read answers them, a fresh
// process reads the same, and concurrent done marks from both processes all
// survive without reviving review attention. Each test owns a private machine
// home, and Claude Code's listing reaches the read as the synthetic `claude`
// prints it, without running it. The other process is a fresh instance of the
// server modules bound to the same home: it holds none of this instance's
// parsed documents or write locks, and meets them only through the machine
// files, as a process does.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, test, vi } from "vitest";
import { NativeDoneMarks, type DoneLaunches } from "../../server/doneMarks.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { parsedListing } from "../../server/hosts/claude/listing.ts";
import { claudeObservations } from "../../server/hosts/claude/runtime.ts";
import { withStates, type HostSessions } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { alertReading } from "../../src/sessionShown.ts";
import { attentionCount } from "../../src/sessionCounts.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { settleFile } from "../../test-support/support/machineFileIdentity.ts";

// A writer waiting on the other process's write lock retries after a
// millisecond rather than the lock's fixed pause, so concurrent marks still
// contend for it without idling.
vi.mock(import("node:timers/promises"), async (importOriginal) => {
  const timers = await importOriginal();
  return {
    ...timers,
    setTimeout: (...[, value, options]) => timers.setTimeout(1, value, options),
  };
});

// The developer's Done on a host that stops without renaming.
// `marksModule` is the Done marks of the process that marks.
function doneMarks(marksModule = { NativeDoneMarks }) {
  return new marksModule.NativeDoneMarks({
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

// Runs one operation in another process's instance of the server modules,
// bound to this machine home, and answers the records it then reads.
async function inOtherProcess(
  kind: "record" | "mark" | "read",
  source: PublishedSource,
  given: readonly LaunchRecord[] = [],
): Promise<readonly LaunchRecord[]> {
  vi.resetModules();
  const store = await import("../../server/launchRecordStore.ts");
  if (kind === "record")
    for (const record of given) await store.bindRecord(source.id, record);
  if (kind === "mark") {
    const marks = doneMarks(await import("../../server/doneMarks.ts"));
    await Promise.all(
      given.map((record) =>
        marks.markDone(source, record, machineFolder(), unobserved),
      ),
    );
    await marks.close();
  }
  return store.keptRecords(source.id);
}

// Claude Code listing `rows`, as the synthetic `claude` prints them.
const claudeListing =
  (rows: readonly object[]): HostSessions =>
  (host) =>
    host === "claude"
      ? (records) =>
          Promise.resolve(
            claudeObservations(records, parsedListing(JSON.stringify(rows))),
          )
      : undefined;

const everyOther = <T>(items: readonly T[], offset: 0 | 1): T[] =>
  items.filter((...[, index]) => index % 2 === offset);

const sessionIds = (count: number, suffix: string) =>
  Array.from(
    Array<unknown>(count).keys(),
    (index) => `${String(index).padStart(8, "0")}-0000-4000-8000-${suffix}`,
  );

const source = makeMe.aPublishedSource.openDough.please();
const story = { identity: "SEED-001#first", title: "First story" };
const execution = (sessionId: string) =>
  makeMe.aLaunchRecord.executing(story).inClaudeSession({ sessionId });

beforeEach(() => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-records-home-"));
  vi.stubEnv("HOME", home);
  return () => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  };
});

test("reads a launch another process recorded after this one read the store, as a fresh process does", async () => {
  const kept = execution("10000000-0000-4000-8000-000000000001").please();
  await replaceRecords(() => ({ [source.id]: [kept] }));
  settleFile(machineDashboardPath("agent-launches.json"));
  expect(await keptRecords(source.id)).toEqual([kept]);
  expect(await keptRecords(source.id)).toEqual([kept]);

  const recorded = makeMe.aLaunchRecord
    .adHoc({ title: "Fix the typo" })
    .inClaudeSession({ sessionId: "20000000-0000-4000-8000-000000000002" })
    .please();
  await inOtherProcess("record", source, [recorded]);

  expect(await keptRecords(source.id)).toEqual([kept, recorded]);
  expect(await inOtherProcess("read", source)).toEqual([kept, recorded]);
});

test("keeps every done mark from concurrent processes and raises no review attention after the session exits", async () => {
  const sessions = sessionIds(4, "000000000001");
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
    inOtherProcess("mark", source, there),
  ]);
  await marks.close();
  const kept = await keptRecords(source.id);
  expect(kept.map((record) => record.session.sessionId)).toEqual(sessions);
  expect(kept.every((record) => record.doneAt !== undefined)).toBe(true);
  expect(everyOther(kept, 0).map((record) => record.doneAt)).toEqual(
    markedHere.map((record) => record.doneAt),
  );

  // Native completion can arrive after closure; it must not revive attention.
  const listing = claudeListing(
    sessions.map((sessionId) =>
      makeMe.aClaudeListingRow
        .background({ sessionId, name: story.title, startedAt: Date.now() })
        .as("done-exited")
        .please(),
    ),
  );
  const observed = await withStates(
    machineFolder(),
    kept,
    "on-demand",
    listing,
  );
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
