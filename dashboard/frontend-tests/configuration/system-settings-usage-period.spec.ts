import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { UsagePeriod } from "../../src/usagePeriod.ts";
import type { UsageSource } from "../../src/usageSource.ts";
import type { TokenIndexCohort } from "../../src/usageTokenIndex.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

const setTimezone = (timezoneId: string) =>
  (
    cdp() as {
      send(method: string, params?: Record<string, unknown>): Promise<unknown>;
    }
  ).send("Emulation.setTimezoneOverride", { timezoneId });

beforeEach(async () => {
  await setTimezone("America/New_York");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T18:00:00.000Z"));
});

afterEach(async () => {
  vi.useRealTimers();
  await setTimezone("");
});

test("local calendar requests retain the last valid day view through invalid input and cohort changes", async () => {
  const reads: {
    readonly cohort: TokenIndexCohort;
    readonly period: UsagePeriod | undefined;
  }[] = [];
  let releaseFirstRead!: () => void;
  const firstReadHeld = new Promise<void>((resolve) => {
    releaseFirstRead = resolve;
  });
  const source: UsageSource = {
    read: async (cohort, period) => {
      reads.push({ cohort, period });
      if (reads.length === 1) {
        await firstReadHeld;
      }
      return makeMe.aTokenIndexAnswer.forCohort(cohort).please();
    },
    refresh: () => Promise.resolve(),
  };

  const usage = await mountUsage(source);
  await usage.showsLoading();
  releaseFirstRead();
  await usage.showsDays("30");
  await usage.showsPointCount(1);
  expect(reads[0]?.period).toEqual({
    from: "2026-10-17T04:00:00.000Z",
    until: "2026-11-16T05:00:00.000Z",
  });

  for (const invalid of ["0", "-1", "1.5", "", "abc"]) {
    await usage.chooseDays(invalid);
    await usage.showsDaysProblem(
      "Enter a positive whole number of days. Showing the last 30 days.",
    );
    await usage.showsPointCount(1);
    expect(reads).toHaveLength(1);
  }

  await usage.chooseDays("30");
  await usage.showsPointCount(1);
  expect(reads).toHaveLength(1);

  await usage.chooseDays("7");
  await usage.showsCohortNote("1 task · Last 7 days");
  await usage.showsPointCount(1);
  expect(reads.at(-1)?.period).toEqual({
    from: "2026-11-09T05:00:00.000Z",
    until: "2026-11-16T05:00:00.000Z",
  });

  await usage.choose("Launch workflow", "Refinement");
  await expect.poll(() => reads.length).toBe(3);
  await usage.showsPointCount(1);
  await usage.showsDays("7");
  expect(reads.at(-1)?.cohort.workflow).toBe("refinement");
  expect(reads.at(-1)?.period).toEqual({
    from: "2026-11-09T05:00:00.000Z",
    until: "2026-11-16T05:00:00.000Z",
  });
});

test("empty periods explain their counts and do not show an old median", async () => {
  const ninetyDayMedian = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        1_000, 1_100, 1_200, 1_300, 1_400, 1_500, 1_600, 1_700, 1_800, 1_900,
      ],
    })
    .withTrend([{ at: "2026-11-10T12:00:00.000Z", value: 1_450 }])
    .please();
  const emptyThirtyDays = makeMe.aTokenIndexAnswer
    .with({ indexes: [] })
    .withUnpricedTasks(2)
    .please();
  const source: UsageSource = {
    read: (...[, period]) =>
      Promise.resolve(
        period?.from === "2026-10-17T04:00:00.000Z"
          ? emptyThirtyDays
          : ninetyDayMedian,
      ),
    refresh: () => Promise.resolve(),
  };

  const usage = await mountUsage(source);
  await usage.chooseDays("90");
  await usage.showsMedian("1,450");

  await usage.chooseDays("30");
  await usage.showsCohortNote("2 tasks · 2 unpriced · Last 30 days");
  await usage.showsNoPoints(
    "No priced finished task matches in the last 30 days.",
  );
  await usage.showsNoMedian(
    "A rolling median needs 10 eligible tasks; none is available in this period",
  );
});
