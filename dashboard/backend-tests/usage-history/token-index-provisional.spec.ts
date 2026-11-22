// A finished task that ended after the last usage check is provisional and
// out of the rolling median until a Refresh that starts after its end reads
// it; gaps keep it partial. Nine earlier launches of the Claude Code session
// `claude` end on day 13: five weigh 1,950 and four 10,450 (claudeReplyLaunch
// weighs 1,450 + 5×O), and launch `SEED-7#claude` goes last.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { recordUsageCheck } from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import {
  claudeLaunch,
  importClaude,
  reference,
  writeLaunchSession,
} from "../../test-support/usage-history/claudeReplyLaunch.ts";
import {
  day,
  expect,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const earlier = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((at) => ({
  at,
  reference: `ca7430bd-0d52-499d-a1bd-00000000010${at}`,
  output: at <= 5 ? 100 : 1_800,
}));
const earlierLaunches = earlier.map(({ at, reference: launchReference }) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#earlier-${at}`, title: `Story ${at}` })
    .inClaudeSession({ sessionId: "claude" })
    .launchedAt(`2026-11-13T0${at}:00:00.000Z`)
    .reportingThrough({
      origin: "http://localhost:4318",
      reference: launchReference,
      command: "report",
    })
    .completedWith({ message: "", receivedAt: day(13) })
    .please(),
);
// The session: each earlier launch answered, then `SEED-7#claude`'s launch
// turn answered with 100 output tokens.
function session() {
  let rows = makeMe.aClaudeTranscript.forSession("claude");
  for (const { at, reference: launchReference, output } of earlier)
    rows = rows
      .withLaunchInput({ uuid: `launch-${at}`, reference: launchReference })
      .withCountedOpusResponse({
        uuid: `earlier-${at}`,
        outputTokens: output,
      });
  return rows
    .withLaunchInput({ uuid: "launch", reference, command: "report" })
    .withCountedOpusResponse({ uuid: "first", outputTokens: 100 });
}
const lastLaunch = (ended: "reported" | "marked done") =>
  ended === "reported"
    ? claudeLaunch
    : makeMe.aLaunchRecord
        .executing({ identity: "SEED-7#claude", title: "Story SEED-7#claude" })
        .inClaudeSession({ sessionId: "claude" })
        .launchedAt("2026-11-14T09:00:00.000Z")
        .reportingThrough({
          origin: "http://localhost:4318",
          reference,
          command: "report",
        })
        .markedDoneAt(day(15))
        .please();

// Imports `rows` beside the launches, `SEED-7#claude` ending on day 15 as
// `ended`, as a usage check on day `checked` left them.
async function checkedOn(
  machine: Parameters<typeof usageServer>[0],
  checked: number,
  rows = session().please(),
  ended: "reported" | "marked done" = "reported",
) {
  importClaude(machine.home, rows, [...earlierLaunches, lastLaunch(ended)]);
  await recordUsageCheck(usageHistoryFile(machine.home), day(checked));
  return usageServer(machine);
}

// Each launch's coverage kind and the rolling median values the chart answers.
async function chartOf(usage: Awaited<ReturnType<typeof usageServer>>) {
  const chart = await usage.chart("?tool=claude");
  return {
    coverage: Object.fromEntries(
      chart.tasks.map(({ identity, coverage }) => [identity, coverage.kind]),
    ) as Record<string, string>,
    median: chart.average.map(({ value }) => value),
  };
}

for (const ended of ["reported", "marked done"] as const)
  test(`a launch ${ended} after the last check is provisional and out of the median until a Refresh after its end`, async ({
    machine,
  }) => {
    const usage = await checkedOn(machine, 14, session().please(), ended);
    const before = await chartOf(usage);
    await usage.refresh();
    const after = await chartOf(usage);

    expect(before.coverage["SEED-7#claude"]).toBe("provisional");
    expect(before.coverage["SEED-7#earlier-1"]).toBe("measured");
    expect(before.median).toEqual([]);
    expect(after.coverage["SEED-7#claude"]).toBe("measured");
    expect(after.median).toEqual([1_950]);
  });

test("a launch that ended before the last check stays measured and in the median", async ({
  machine,
}) => {
  const chart = await chartOf(await checkedOn(machine, 16));
  expect(chart.coverage["SEED-7#claude"]).toBe("measured");
  expect(chart.median).toEqual([1_950]);
});

test("a launch after the last check whose transcript lacks a cited worker stays partial", async ({
  machine,
}) => {
  const chart = await chartOf(
    await checkedOn(
      machine,
      14,
      session().withWorkerResult({ agentId: "worker" }).please(),
    ),
  );
  expect(chart.coverage["SEED-7#claude"]).toBe("partial");
  expect(chart.median).toEqual([]);
});

test("the rolling median reflects a launch's total corrected by a Refresh that reads its later turns", async ({
  machine,
}) => {
  const usage = await checkedOn(machine, 16);
  const before = await chartOf(usage);
  writeLaunchSession(machine.home, session().withDeveloperReply().please());
  await usage.refresh();
  const after = await chartOf(usage);

  // Before: six at 1,950 and four at 10,450; after, the launch weighs
  // 1,950 + 2,950 = 4,900, the median's middle pair 1,950 and 4,900.
  expect(before.median).toEqual([1_950]);
  expect(after.median).toEqual([3_425]);
});
