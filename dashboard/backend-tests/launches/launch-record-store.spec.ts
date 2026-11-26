// How this machine's launch record store (../../server/launchRecordDocument.ts)
// keeps records: an unreadable store answers none and stays until the next
// recording moves it aside beside every earlier copy, a store this process
// already read and then replaced by an unreadable one of the same size and
// times answers none and is left in place, and a record marked done more than
// 30 days ago stays in the file until the next recording drops it. Each test
// owns a private machine home. What another process records or marks done is
// ./launch-records-across-processes.spec.ts.
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, test, vi } from "vitest";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import {
  readStoredRecords,
  replaceRecords,
} from "../../server/launchRecordDocument.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { daysAgo } from "../../test-support/machineLaunchRecords.ts";
import {
  replaceFileKeepingTimes,
  settleFile,
} from "../../test-support/support/machineFileIdentity.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const source = makeMe.aPublishedSource.openDough.please();
const story = { identity: "SEED-001#first", title: "First story" };
const execution = (sessionId: string) =>
  makeMe.aLaunchRecord.executing(story).inClaudeSession({ sessionId });
const adHoc = (sessionId: string) =>
  makeMe.aLaunchRecord
    .adHoc({ title: "Fix the typo" })
    .inClaudeSession({ sessionId })
    .please();

const storeFile = () => machineDashboardPath("agent-launches.json");

function keepStoreText(text: string): void {
  mkdirSync(path.dirname(storeFile()), { recursive: true });
  writeFileSync(storeFile(), text);
}

// What the store file itself holds for the project, read without retention.
async function filed(): Promise<unknown> {
  const read = await readStoredRecords();
  return read.kind === "unreadable" ? read : read.document[source.id];
}

// The unreadable copies moved aside beside the store.
function unreadableCopies(): string[] {
  const dir = path.dirname(storeFile());
  const prefix = `${path.basename(storeFile())}.unreadable`;
  return readdirSync(dir)
    .filter((name) => name.startsWith(prefix))
    .map((name) => readFileSync(path.join(dir, name), "utf8"))
    .sort();
}

beforeEach(() => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-records-home-"));
  vi.stubEnv("HOME", home);
  return () => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  };
});

test("answers no records once a store already read is replaced by an unreadable file of the same size and times, and leaves it in place", async () => {
  const kept = execution("20000000-0000-4000-8000-000000000002").please();
  await replaceRecords(() => ({ [source.id]: [kept] }));
  settleFile(storeFile());
  expect(await keptRecords(source.id)).toEqual([kept]);

  const unreadable = `x${readFileSync(storeFile(), "utf8").slice(1)}`;
  replaceFileKeepingTimes(storeFile(), unreadable);

  expect(await keptRecords(source.id)).toEqual([]);
  expect(await keptRecords(source.id)).toEqual([]);
  expect(readFileSync(storeFile(), "utf8")).toBe(unreadable);
  expect(unreadableCopies()).toEqual([]);
});

test("answers no records from an unreadable store until the next recording moves it aside, keeping every earlier copy", async () => {
  const unreadable = "{ not launch records";
  keepStoreText(unreadable);
  expect(await keptRecords(source.id)).toEqual([]);
  expect(readFileSync(storeFile(), "utf8")).toBe(unreadable);

  const first = adHoc("30000000-0000-4000-8000-000000000001");
  await bindRecord(source.id, first);
  expect(await keptRecords(source.id)).toEqual([first]);
  expect(readFileSync(`${storeFile()}.unreadable`, "utf8")).toBe(unreadable);

  const unreadableAgain = "[ still not launch records";
  keepStoreText(unreadableAgain);
  const second = adHoc("30000000-0000-4000-8000-000000000002");
  await bindRecord(source.id, second);
  expect(await keptRecords(source.id)).toEqual([second]);
  expect(unreadableCopies()).toEqual([unreadable, unreadableAgain].sort());
});

test("keeps an unclosed record however old, and a done one until 30 days after marking, dropping it on the next recording", async () => {
  const unclosed = execution("40000000-0000-4000-8000-000000000040")
    .launchedAt(daysAgo(40))
    .please();
  const recentlyDone = execution("60000000-0000-4000-8000-000000000029")
    .launchedAt(daysAgo(60))
    .markedDoneAt(daysAgo(29))
    .please();
  const longDone = execution("60000000-0000-4000-8000-000000000031")
    .launchedAt(daysAgo(60))
    .markedDoneAt(daysAgo(31))
    .please();
  keepStoreText(
    JSON.stringify({ [source.id]: [longDone, unclosed, recentlyDone] }),
  );

  expect(await keptRecords(source.id)).toEqual([unclosed, recentlyDone]);
  expect(await filed()).toEqual([longDone, unclosed, recentlyDone]);

  const recorded = adHoc("70000000-0000-4000-8000-000000000001");
  await bindRecord(source.id, recorded);
  expect(await filed()).toEqual([unclosed, recentlyDone, recorded]);
});
