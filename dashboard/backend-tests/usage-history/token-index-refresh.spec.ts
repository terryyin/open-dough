// Refresh persists changed Codex evidence and keeps the last usable chart.
import {
  appendFile,
  mkdtemp,
  readFile,
  rm,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import {
  lastUsageCheck,
  recordUsageCheck,
  usageCheckFile,
} from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import {
  importUsageHistory,
  usageHistorySince,
} from "../../server/usageImport.ts";
import { refreshUsageHistory } from "../../server/usageRefresh.ts";
import { refreshUsage } from "../../server/usageRefreshRun.ts";
import {
  deriveUsageTaskSummary,
  usageTaskSummaryFile,
} from "../../server/usageTaskSummary.ts";
import { currentUsageTaskSummary } from "../../server/usageTaskSummaryCache.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";

const project = makeMe.aPublishedSource.openDough.please();
const priorCheck = "2026-11-15T12:00:00.000Z";
const old = new Date("2026-11-14T12:00:00.000Z");
const changed = new Date("2026-11-16T12:00:00.000Z");
const nextCheck = new Date("2026-11-17T12:00:00.000Z");
const repeatCheck = new Date("2026-11-18T12:00:00.000Z");
const sol = "gpt-6.1-sol";

const identity = (session: string) => `SEED-7#${session}`;
const finished = (session: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: identity(session), title: `Story ${session}` })
    .inCodexSession({ sessionId: session })
    .launchedAt("2026-11-14T09:00:00.000Z")
    .withFirstInput({ state: "confirmed", turnId: `${session}-turn` })
    .completedWith({ message: "", receivedAt: old.toISOString() })
    .please();
const counters = (output: number) => ({
  input_tokens: 10_000,
  cached_input_tokens: 8_000,
  cache_write_input_tokens: 0,
  output_tokens: output,
});
const rootRollout = (session: string, output: number) =>
  makeMe.aCodexRollout
    .forSession(session)
    .withTurnContext(`${session}-turn`, sol, "xhigh")
    .withResponse(`${session}-turn`, `${session}-answer`, counters(output));

async function firstImport() {
  const home = await mkdtemp(path.join(tmpdir(), "token-index-codex-refresh-"));
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const sessions = path.join(home, ".codex", "sessions");
  const rollouts = path.join(sessions, "2026", "11", "14");
  const store = usageHistoryFile(home);
  const sources = { home, store, codexRoots: [sessions], claudeRoots: [] };
  keepLaunchRecords(home, [finished("first")]);
  const first = writeCodexSession(rollouts, rootRollout("first", 100).please());
  await utimes(first, old, old);
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(store, priorCheck);
  return { sources, first, rollouts };
}

async function chartContext({ home, store }: { home: string; store: string }) {
  return {
    projects: [project],
    launches: await retainedLaunchEnds(home),
    tariff: usageTariffs.codex,
    checkedAt: await lastUsageCheck(store),
  };
}

test("Refresh reads changed Codex roots and their older workers without double-counting", async () => {
  const { sources, first, rollouts } = await firstImport();
  const { home, store } = sources;
  const [late] = makeMe.aCodexRollout
    .forSession("first")
    .withResponse("first-turn", "first-late", counters(5))
    .rows();
  await appendFile(first, `${JSON.stringify(late)}\n`);
  await utimes(first, old, old);
  keepLaunchRecords(home, [finished("first"), finished("second")]);
  const second = writeCodexSession(
    rollouts,
    rootRollout("second", 200).withSpawnedAgent("second-worker").please(),
  );
  await utimes(second, changed, changed);
  const worker = writeCodexSession(
    rollouts,
    makeMe.aCodexRollout
      .forSession("second-worker")
      .withParent("second")
      .withTurnContext("worker-turn", sol, "xhigh")
      .withResponse("worker-turn", "worker-own", counters(70), {
        rootTurnId: "second-turn",
      })
      .please(),
  );
  await utimes(worker, old, old);
  vi.setSystemTime(nextCheck);

  expect(await refreshUsageHistory(sources)).toEqual({
    checkedAt: nextCheck.toISOString(),
  });
  const summary = await deriveUsageTaskSummary(store);
  const chart = tokenIndexAnswer(
    { ...(await chartContext(sources)), summary },
    defaultCohort,
  );

  expect(chart.checkedAt).toBe(nextCheck.toISOString());
  expect(
    chart.tasks.map(({ identity, coverage, index }) => [
      identity,
      coverage.kind,
      index,
    ]),
  ).toEqual([
    ["SEED-7#first", "measured", 2_900],
    ["SEED-7#second", "measured", 6_150],
  ]);
  // The late response stays unread. The older worker belongs to the new root.
  const refreshed = new Map(
    summary.tasks.map(({ identity, usage }) => [identity, usage]),
  );
  expect(refreshed.get("SEED-7#first")).toMatchObject([
    { root: true, responses: 1, tokens: { output: 100 } },
  ]);
  expect(refreshed.get("SEED-7#second")).toMatchObject([
    { root: true, responses: 1, tokens: { output: 200 } },
    { root: false, responses: 1, tokens: { output: 70 } },
  ]);

  const fullStore = path.join(home, "full-usage.json");
  await importUsageHistory({
    ...sources,
    store: fullStore,
    since: usageHistorySince,
  });
  const full = await deriveUsageTaskSummary(fullStore);
  expect(
    full.tasks.find((task) => task.identity === "SEED-7#second")?.usage,
  ).toEqual(refreshed.get("SEED-7#second"));

  const history = await readFile(store);
  // Force a reread of the same bytes and response IDs.
  await utimes(second, repeatCheck, repeatCheck);
  vi.setSystemTime(repeatCheck);
  expect(await refreshUsageHistory(sources)).toEqual({
    checkedAt: repeatCheck.toISOString(),
  });
  const repeated = await deriveUsageTaskSummary(store);
  expect(
    tokenIndexAnswer(
      { ...(await chartContext(sources)), summary: repeated },
      defaultCohort,
    ),
  ).toEqual({ ...chart, checkedAt: repeatCheck.toISOString() });
  expect(await readFile(store)).toEqual(history);
});

async function keptSummary(store: string) {
  const file = usageTaskSummaryFile(store);
  const bytes = Buffer.from(
    `${JSON.stringify(await deriveUsageTaskSummary(store))}\n`,
  );
  await writeFile(file, bytes);
  return { file, bytes };
}

async function cachedChart(sources: { home: string; store: string }) {
  return tokenIndexAnswer(
    {
      ...(await chartContext(sources)),
      summary: await currentUsageTaskSummary(sources.store),
    },
    defaultCohort,
  );
}

test("concurrent refresh presses share the same run and leave the store and cache bytes intact", async () => {
  const { sources } = await firstImport();
  const { home, store } = sources;
  const history = await readFile(store);
  const cached = await keptSummary(store);
  const before = await cachedChart(sources);

  const first = refreshUsage(home, store);
  const alongside = refreshUsage(home, store);
  const [checkedAt, alsoCheckedAt] = await Promise.all([first, alongside]);

  expect(alongside).toBe(first);
  expect(alsoCheckedAt).toBe(checkedAt);
  expect(await cachedChart(sources)).toEqual({ ...before, checkedAt });
  expect(await readFile(store)).toEqual(history);
  expect(await readFile(cached.file)).toEqual(cached.bytes);
});

test("an unreadable store fails Refresh without replacing its summary or check time", async () => {
  const { sources } = await firstImport();
  const { home, store } = sources;
  const history = await readFile(store);
  const { atime, mtime } = await stat(store);
  const cached = await keptSummary(store);
  const checkFile = usageCheckFile(store);
  const checkRecord = await readFile(checkFile);
  const before = await cachedChart(sources);
  const malformed = Buffer.from("{ not a usage store");
  await writeFile(store, malformed);

  await expect(refreshUsage(home, store)).rejects.toThrow(
    `Usage could not be refreshed: Usage history is unreadable: ${store}`,
  );
  expect(await readFile(store)).toEqual(malformed);
  expect(await readFile(cached.file)).toEqual(cached.bytes);
  expect(await readFile(checkFile)).toEqual(checkRecord);

  await writeFile(store, history);
  // Restoring the fixture is not a new import publishing evidence.
  await utimes(store, atime, mtime);
  expect(await lastUsageCheck(store)).toBe(priorCheck);
  expect(await cachedChart(sources)).toEqual(before);
});
