// The real browser → HTTP → retained store journey for recent calendar days.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../dashboard/server/usageHistory.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { visitUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";

test.use({ timezoneId: "America/New_York" });

test("30 to 7 to 1 local days selects the dated tasks and keeps earlier history in the average", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-15T18:00:00.000Z") });
  const machine = systemSettingsMachine();
  try {
    const earlier = [...Array<number>(9).keys()].map((at) =>
      makeMe.aUsageTaskHistory
        .identifiedAs(`earlier-${at}`)
        .endedAt(`2026-10-${String(at + 22)}T12:00:00.000Z`)
        .please(),
    );
    const dated = (
      [
        ["today", "2026-11-15T12:00:00.000Z"],
        ["six-days", "2026-11-09T12:00:00.000Z"],
        ["seven-days", "2026-11-08T12:00:00.000Z"],
        ["boundary", "2026-11-09T05:00:00.000Z"],
        ["before", "2026-11-09T04:59:59.999Z"],
      ] as const
    ).map(([id, at]) =>
      makeMe.aUsageTaskHistory
        .identifiedAs(id)
        .endedAt(at)
        .withWorkerGaps("missing-worker-evidence")
        .withResponse({
          tokens: {
            uncachedInput:
              id === "boundary" ? 2_000 : id === "before" ? 3_000 : 1_000,
            cacheRead: 9_000,
            output: 100,
          },
        })
        .please(),
    );
    const tenth = makeMe.aUsageTaskHistory
      .identifiedAs("tenth")
      .endedAt("2026-11-15T13:00:00.000Z")
      .please();
    const unpriced = makeMe.aUsageTaskHistory
      .identifiedAs("unpriced")
      .endedAt("2026-11-09T13:00:00.000Z")
      .withResponse({ model: "unrated-model" })
      .please();
    await writeUsageHistory(
      makeMe.aUsageHistory
        .with({ tasks: [...earlier, ...dated, tenth, unpriced] })
        .please(),
      usageHistoryFile(machine.home),
    );
    const server = await machine.start("preview");
    const usage = await visitUsage(page, server.baseURL);
    await usage.showsDays("30");
    await usage.showsCohortNote(
      "16 tasks · 5 partial · 1 unpriced · Last 30 days",
    );
    await usage.showsAverage("1,950");
    await usage.selectPoint("Nov 8 · 1,950 · Partial", "pointer");
    await usage.chooseDays("7");
    await usage.showsPoints([
      "Nov 9 · 2,950 · Partial",
      "Nov 9 · 1,950 · Partial",
      "Nov 15 · 1,950 · Partial",
      "Nov 15 · 1,950",
    ]);
    await usage.showsCohortNote(
      "5 tasks · 3 partial · 1 unpriced · Last 7 days",
    );
    await usage.showsNoDetail();
    await usage.showsAverage("1,950");
    await usage.chooseDays("1");
    await usage.showsCohortNote("2 tasks · 1 partial · Last 1 day");
    await usage.showsPoints(["Nov 15 · 1,950 · Partial", "Nov 15 · 1,950"]);
    await usage.showsAverage("1,950");
    await usage.chooseDays("30");
    await usage.showsAverage("1,950");
  } finally {
    await machine.close();
  }
});
