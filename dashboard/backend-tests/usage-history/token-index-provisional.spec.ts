// Coverage stays provisional until a usage check reaches a finished launch.
import { mkdtemp, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { lastUsageCheck, recordUsageCheck } from "../../server/usageCheck.ts";
import {
  importUsageHistory,
  usageHistorySince,
} from "../../server/usageImport.ts";
import { refreshUsageHistory } from "../../server/usageRefresh.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { writeClaudeSession } from "../../test-support/usage-history/importHarness.ts";

const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
const lastIdentity = "SEED-7#claude";
const lastReference = "ca7430bd-0d52-499d-a1bd-000000000001";
const earlier = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((at) => ({
  at,
  identity: `SEED-7#earlier-${at}`,
  reference: `ca7430bd-0d52-499d-a1bd-00000000010${at}`,
  output: at <= 5 ? 100 : 1_800,
}));
const cohort = { ...defaultCohort, tool: "claude" as const };
const reading = {
  projects: [makeMe.aPublishedSource.openDough.please()],
  tariff: usageTariffs.claude,
};

const summaryTask = (identity: string, output: number) =>
  makeMe.aSummaryTask
    .identifiedAs(identity)
    .with({ identity, host: "claude" })
    .withUsage({ model: "claude-opus-5-5", tokens: { output } });
const earlierTasks = earlier.map(({ identity, output }) =>
  summaryTask(identity, output).endedAt(day(13)).please(),
);
const lastTask = () =>
  summaryTask(lastIdentity, 100).endedAt(day(14)).with({ outcome: null });
const reported = {
  outcome: { kind: "reported-complete" as const, at: day(15) },
  doneAt: null,
};
const markedDone = { outcome: null, doneAt: day(15) };

test.each([
  { ending: "reported", retained: reported },
  { ending: "marked Done", retained: markedDone },
])(
  "a launch $ending after the last check is provisional and out of the median until a check after its end",
  ({ retained }) => {
    const summary = makeMe.aUsageTaskSummary
      .with({ tasks: [...earlierTasks, lastTask().please()] })
      .please();
    const launches = new Map([[lastIdentity, retained]]);

    const before = tokenIndexAnswer(
      { ...reading, summary, launches, checkedAt: day(14) },
      cohort,
    );
    const after = tokenIndexAnswer(
      { ...reading, summary, launches, checkedAt: day(16) },
      cohort,
    );

    expect(
      before.tasks.find(({ id }) => id === lastIdentity)?.coverage.kind,
    ).toBe("provisional");
    expect(
      before.tasks.find(({ id }) => id === earlierTasks[0]?.id)?.coverage.kind,
    ).toBe("measured");
    expect(before.average).toEqual([]);
    expect(
      after.tasks.find(({ id }) => id === lastIdentity)?.coverage.kind,
    ).toBe("measured");
    expect(after.average.map(({ value }) => value)).toEqual([1_950]);
  },
);

test("a launch that ended before the last check stays measured and in the median", () => {
  const answer = tokenIndexAnswer(
    {
      ...reading,
      summary: makeMe.aUsageTaskSummary
        .with({ tasks: [...earlierTasks, lastTask().please()] })
        .please(),
      launches: new Map([[lastIdentity, reported]]),
      checkedAt: day(16),
    },
    cohort,
  );

  expect(
    answer.tasks.find(({ id }) => id === lastIdentity)?.coverage.kind,
  ).toBe("measured");
  expect(answer.average.map(({ value }) => value)).toEqual([1_950]);
});

test("a launch after the last check whose transcript lacks a cited worker stays partial", () => {
  const task = lastTask()
    .with({ gaps: ["missing-worker-evidence"] })
    .please();
  const answer = tokenIndexAnswer(
    {
      ...reading,
      summary: makeMe.aUsageTaskSummary
        .with({ tasks: [...earlierTasks, task] })
        .please(),
      launches: new Map([[lastIdentity, reported]]),
      checkedAt: day(14),
    },
    cohort,
  );

  expect(answer.tasks.find(({ id }) => id === lastIdentity)?.coverage).toEqual({
    kind: "partial",
    gaps: ["missing-worker-evidence"],
  });
  expect(answer.average).toEqual([]);
});

const launch = (identity: string, reference: string, launchedAt: string) =>
  makeMe.aLaunchRecord
    .executing({ identity, title: `Story ${identity}` })
    .inClaudeSession({ sessionId: "claude" })
    .launchedAt(launchedAt)
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    });

// Each earlier launch is answered, followed by the last launch's own turn.
function session() {
  const rows = makeMe.aClaudeTranscript.forSession("claude");
  for (const { at, reference, output } of earlier)
    rows
      .withLaunchInput({ uuid: `launch-${at}`, reference })
      .withCountedOpusResponse({ uuid: `earlier-${at}`, outputTokens: output });
  return rows
    .withLaunchInput({
      uuid: "launch",
      reference: lastReference,
      command: "report",
    })
    .withCountedOpusResponse({ uuid: "first", outputTokens: 100 });
}

test("the rolling median reflects a launch's total corrected by a Refresh that reads its later turns", async () => {
  const home = await mkdtemp(path.join(tmpdir(), "token-index-provisional-"));
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const store = path.join(home, "usage.json");
  const claudeRoot = path.join(home, "claude");
  const sources = { home, store, codexRoots: [], claudeRoots: [claudeRoot] };
  keepLaunchStore(home, {
    "open-dough": [
      ...earlier.map(({ at, identity, reference }) =>
        launch(identity, reference, `2026-11-13T0${at}:00:00.000Z`)
          .completedWith({ message: "", receivedAt: day(13) })
          .please(),
      ),
      launch(lastIdentity, lastReference, "2026-11-14T09:00:00.000Z")
        .completedWith({ message: "", receivedAt: day(15) })
        .please(),
    ],
  });
  writeClaudeSession(claudeRoot, session().please());
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(store, day(16));
  const launches = await retainedLaunchEnds(home);

  const before = tokenIndexAnswer(
    {
      ...reading,
      launches,
      summary: await deriveUsageTaskSummary(store),
      checkedAt: await lastUsageCheck(store),
    },
    cohort,
  );
  const file = writeClaudeSession(
    claudeRoot,
    session().withDeveloperReply().please(),
  );
  const changedAt = new Date(day(17));
  await utimes(file, changedAt, changedAt);
  vi.setSystemTime(new Date(day(18)));
  const refreshed = await refreshUsageHistory(sources);
  const after = tokenIndexAnswer(
    {
      ...reading,
      launches,
      summary: await deriveUsageTaskSummary(store),
      checkedAt: await lastUsageCheck(store),
    },
    cohort,
  );

  // The last launch gains 2,950, moving the middle pair to 1,950 and 4,900.
  expect(before.checkedAt).toBe(day(16));
  expect(before.average.map(({ value }) => value)).toEqual([1_950]);
  expect(refreshed.checkedAt).toBe(day(18));
  expect(after.checkedAt).toBe(day(18));
  expect(after.average.map(({ value }) => value)).toEqual([3_425]);
});
