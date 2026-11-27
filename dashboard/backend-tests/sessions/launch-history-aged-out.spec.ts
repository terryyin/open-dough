// Launch records that leave the operational store move into append-only
// launch history under this machine's dashboard home: a session marked done
// 31 days ago leaves on the next write and stays exactly once across a later
// write by a fresh process; one marked done 29 days ago and an older unclosed
// one stay listed and out of history; when history cannot be written, the
// aged-out record remains in the operational document (still hidden from
// reads) until a later write moves it. Each test owns a private machine home;
// the fresh process is a forked Node child bound to the same home.
import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { on } from "node:events";
import { chmodSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, expect, test, vi } from "vitest";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import {
  launchHistoryDirectory,
  readLaunchHistory,
} from "../../server/launchHistory.ts";
import {
  readStoredRecords,
  replaceRecords,
} from "../../server/launchRecordDocument.ts";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { daysAgo } from "../../test-support/machineLaunchRecords.ts";

const childMode = "--aged-out-child";
const project = "open-dough";

// Marks one kept session Done, the write that moves aged-out records.
const markDone = async (record: LaunchRecord) => {
  const marked = await setRecordDoneAt(
    project,
    record.session,
    new Date().toISOString(),
  );
  expect(marked?.doneAt).toEqual(expect.any(String));
};

async function storedSessionIds(): Promise<string[]> {
  const read = await readStoredRecords();
  assert(read.kind !== "unreadable", "The record document is unreadable.");
  return (read.document[project] ?? []).flatMap((entry) =>
    "session" in entry ? [entry.session.sessionId] : [],
  );
}

async function childOperation(): Promise<void> {
  const send = process.send?.bind(process);
  assert(send, "The fresh process requires IPC.");
  const [record] = (await new Promise<unknown[]>((resolve) => {
    process.once("message", (...args) => {
      resolve(args);
    });
  })) as [LaunchRecord];
  await markDone(record);
  send(await storedSessionIds());
  process.disconnect?.();
}

// Marks `record` Done in another Node process bound to this machine home and
// answers the session ids that process then finds stored.
async function markDoneInFreshProcess(
  signal: AbortSignal,
  record: LaunchRecord,
): Promise<string[]> {
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
  child.send(record);
  const next: IteratorResult<unknown[]> = await messages.next();
  assert(!next.done, "The fresh process exited before answering.");
  expect(await exited).toBe(0);
  return next.value[0] as string[];
}

if (process.argv[2] === childMode) {
  await childOperation();
} else {
  const { makeMe } =
    await import("../../../Distribution/tests/support/makeMe.mjs");
  const story = { identity: "SEED-001#first", title: "First story" };
  const execution = (sessionId: string) =>
    makeMe.aLaunchRecord
      .executing(story)
      .inClaudeSession({ sessionId })
      .launchedAt(daysAgo(60));
  let home: string;

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "dough-launch-history-"));
    vi.stubEnv("HOME", home);
    return () => {
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    };
  });

  const seeded = async (suffix: string) => {
    const records = {
      longDone: execution(`60000000-0000-4000-8000-0000000${suffix}31`)
        .markedDoneAt(daysAgo(31))
        .please(),
      recentlyDone: execution(`60000000-0000-4000-8000-0000000${suffix}29`)
        .markedDoneAt(daysAgo(29))
        .please(),
      unclosed: execution(
        `60000000-0000-4000-8000-0000000${suffix}60`,
      ).please(),
      first: execution(`60000000-0000-4000-8000-0000000${suffix}01`).please(),
      second: execution(`60000000-0000-4000-8000-0000000${suffix}02`).please(),
    };
    const { longDone, recentlyDone, unclosed, first, second } = records;
    await replaceRecords(() => ({
      [project]: [longDone, recentlyDone, unclosed, first, second],
    }));
    return records;
  };

  test("moves a 31-day done session into history once across a later write by a fresh process, leaving the 29-day and unclosed sessions listed", async ({
    signal,
  }) => {
    const { longDone, recentlyDone, unclosed, first, second } =
      await seeded("0");
    expect(await readLaunchHistory(home)).toEqual([]);
    expect(await keptRecords(project)).toEqual([
      recentlyDone,
      unclosed,
      first,
      second,
    ]);

    const writtenFrom = Date.now();
    await markDone(first);

    expect(await storedSessionIds()).toEqual(
      [recentlyDone, unclosed, first, second].map(
        (record) => record.session.sessionId,
      ),
    );
    const historyAfterFirst = await readLaunchHistory(home);
    expect(historyAfterFirst).toEqual([
      {
        project,
        reason: "aged-out",
        record: longDone,
        leftAt: expect.any(String) as unknown,
      },
    ]);
    expect(
      Date.parse(historyAfterFirst[0]?.leftAt ?? ""),
    ).toBeGreaterThanOrEqual(writtenFrom);

    expect(await markDoneInFreshProcess(signal, second)).toEqual(
      [recentlyDone, unclosed, first, second].map(
        (record) => record.session.sessionId,
      ),
    );
    expect(await readLaunchHistory(home)).toEqual(historyAfterFirst);
  });

  test("keeps an aged-out record in the operational document when history is unwritable, then moves it once after restore", async () => {
    const { longDone, recentlyDone, unclosed, first, second } =
      await seeded("1");
    const historyDir = launchHistoryDirectory(home);
    mkdirSync(historyDir, { recursive: true });
    chmodSync(historyDir, 0o500);
    try {
      await markDone(first);

      expect(await storedSessionIds()).toEqual(
        [longDone, recentlyDone, unclosed, first, second].map(
          (record) => record.session.sessionId,
        ),
      );
      expect(await readLaunchHistory(home)).toEqual([]);
      expect(
        (await keptRecords(project)).map((record) => record.session.sessionId),
      ).toEqual(
        [recentlyDone, unclosed, first, second].map(
          (record) => record.session.sessionId,
        ),
      );
    } finally {
      chmodSync(historyDir, 0o700);
    }

    await markDone(second);

    expect(await storedSessionIds()).toEqual(
      [recentlyDone, unclosed, first, second].map(
        (record) => record.session.sessionId,
      ),
    );
    const history = await readLaunchHistory(home);
    expect(history).toEqual([
      {
        project,
        reason: "aged-out",
        record: longDone,
        leftAt: expect.any(String) as unknown,
      },
    ]);
  });
}
