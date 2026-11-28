import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { TokenIndexAnswer } from "../../src/usageTokenIndex.ts";
import { scaleDevice } from "../../test-support/component-mount/deviceScale.ts";
import { settingsColourScheme } from "./system-settings-browser.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

const million = 1_000_000;
const day = (date: number) =>
  new Date(Date.UTC(2026, 10, date, 12)).toISOString();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(day(15)));
});
afterEach(() => {
  vi.useRealTimers();
});

function readingUsage(
  answer: () => TokenIndexAnswer,
  viewport?: { readonly width: number; readonly height: number },
) {
  return mountUsage(
    { read: () => Promise.resolve(answer()), refresh: async () => {} },
    viewport,
  );
}

test("the rolling median is distinct above dots and never enlarges ordinary geometry", async () => {
  let answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [million, 2 * million] })
    .please();
  const usage = await readingUsage(() => answer);
  const { chart } = usage;
  await usage.showsPointCount(2);
  const separation = await chart.ordinarySeparation();
  answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [million, 2 * million, 65 * million] })
    .withTrend([{ at: day(3), value: 8 * million }])
    .please();
  await usage.chooseDays("7");
  await usage.showsPointCount(3);
  expect(await chart.ordinarySeparation()).toBeCloseTo(separation, 1);
  await chart.showsMedianOverflow(
    ["Codex Median ↑ 8,000,000"],
    ["Nov 3 · Codex · 10-task rolling median above scale · 8,000,000"],
  );
  await chart.showsMedianAtLargeDate();

  answer = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        million,
        2 * million,
        3 * million,
        ...Array<number>(7).fill(million),
      ],
    })
    .withTrend([{ at: day(10), value: million }])
    .please();
  await usage.chooseDays("30");
  await usage.showsPointCount(10);
  const appearance = settingsColourScheme();
  for (const colour of ["light", "dark"] as const) {
    await appearance(colour);
    await chart.showsDistinctMedianAboveDots();
  }
});

test("the chart shows a one-million median and the sixty-five-million task separately", async () => {
  const answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [...Array<number>(9).fill(million), 65 * million] })
    .withTrend([{ at: day(10), value: million }])
    .please();
  const usage = await readingUsage(() => answer);
  await usage.showsMedian("1,000,000");
  await usage.chart.hasAxis(["0", "500K", "1M"]);
  await usage.chart.showsLarge(
    ["Nov 10 · Codex · 65,000,000 · Large task above 50 million"],
    ["65,000,000"],
  );
});

test("an in-scale median breaks across above-scale observations and all-large medians stay explicit", async () => {
  let answer = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        ...Array<number>(10).fill(million),
        ...Array<number>(6).fill(65 * million),
        ...Array<number>(8).fill(million),
      ],
    })
    .withTrend([
      { at: day(10), value: million },
      { at: day(11), value: million },
      { at: day(16), value: 65 * million },
      { at: day(23), value: million },
      { at: day(24), value: million },
    ])
    .please();
  const usage = await readingUsage(() => answer);
  const { chart } = usage;
  await usage.showsPointCount(24);
  await chart.showsSeparatedMedianLevels();

  answer = makeMe.aTokenIndexAnswer
    .with({ indexes: Array<number>(10).fill(65 * million) })
    .withTrend([{ at: day(10), value: 65 * million }])
    .please();
  await usage.chooseDays("7");
  await usage.showsPointCount(10);
  await chart.hasAxis(["0", "25M", "50M"]);
  await usage.showsLatestMedian("65,000,000");
  await chart.showsMedianOverflow(
    ["Codex Median ↑ 65,000,000"],
    ["Nov 10 · Codex · 10-task rolling median above scale · 65,000,000"],
  );
});

for (const [name, viewport, scale] of [
  ["narrow touch", { width: 420, height: 900 }, 1],
  ["200% zoom", { width: 640, height: 450 }, 2],
] as const) {
  describe(name, () => {
    test("day control, task actions and true overflow values remain readable without hovering", async () => {
      const answer = makeMe.aTokenIndexAnswer
        .with({ indexes: [million, 65 * million] })
        .withTask(0, { endedAt: day(9) })
        .withTask(1, { endedAt: day(10) })
        .withTrend([{ at: day(10), value: 65 * million }])
        .please();
      const usage = await readingUsage(() => answer, viewport);
      if (scale !== 1) await scaleDevice(scale);
      await usage.chooseDays("7");
      await usage.showsDays("7");
      await usage.chart.showsMedianOverflow(
        ["Codex Median ↑ 65,000,000"],
        ["Nov 10 · Codex · 10-task rolling median above scale · 65,000,000"],
      );
      await usage.chart.fitsReadingWindow();
      const large = "Nov 10 · Codex · 65,000,000 · Large task above 50 million";
      await usage.selectPoint(large, "touch");
      await usage.showsFact("Token index", "65,000,000");
      await usage.closeDetail(large);
      expect(devicePixelRatio).toBe(scale);
    });
  });
}
