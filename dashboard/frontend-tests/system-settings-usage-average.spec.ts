import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { usageTokenIndexEndpoint } from "../src/usageTokenIndex.ts";
import { test, expect } from "../tests/support/frontendApp.ts";
import { narrowWindow, twiceZoomedWindow } from "../tests/accessibleReading.ts";
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";
import { usageChart } from "../tests/support/usageChartPage.ts";

const million = 1_000_000;
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("the rolling median is distinct above dots and never enlarges ordinary geometry", async ({
  page,
}) => {
  let answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [million, 2 * million] })
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page),
    chart = usageChart(page);
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
    ["Median ↑ 8,000,000"],
    ["Nov 3 · 10-task rolling median above scale · 8,000,000"],
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
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await chart.showsDistinctMedianAboveDots();
  }
});

test("the chart shows a one-million median and the sixty-five-million task separately", async ({
  page,
}) => {
  const answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [...Array<number>(9).fill(million), 65 * million] })
    .withTrend([{ at: day(10), value: million }])
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page);
  const chart = usageChart(page);
  await usage.showsMedian("1,000,000");
  await chart.hasAxis(["0", "500K", "1M"]);
  await chart.showsLarge(
    ["Nov 10 · 65,000,000 · Large task above 50 million"],
    ["65,000,000"],
  );
});

test("an in-scale median breaks across above-scale observations and all-large medians stay explicit", async ({
  page,
}) => {
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
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page),
    chart = usageChart(page);
  await usage.showsPointCount(24);
  await chart.showsSeparatedMedianLevels();
  answer = makeMe.aTokenIndexAnswer
    .with({ indexes: Array<number>(10).fill(65 * million) })
    .withTrend([{ at: day(10), value: 65 * million }])
    .please();
  await usage.chooseDays("7");
  await usage.showsPointCount(10);
  await chart.hasAxis(["0", "25M", "50M"]);
  await chart.showsLatestMedian("65,000,000");
  await chart.showsMedianOverflow(
    ["Median ↑ 65,000,000"],
    ["Nov 10 · 10-task rolling median above scale · 65,000,000"],
  );
});

for (const [name, viewport, deviceScaleFactor] of [
  ["narrow touch", narrowWindow, 1],
  ["200% zoom", twiceZoomedWindow, 2],
] as const) {
  test.describe(name, () => {
    test.use({ viewport, deviceScaleFactor, hasTouch: true });
    test("day control, task actions and true overflow values remain readable without hovering", async ({
      page,
    }) => {
      const answer = makeMe.aTokenIndexAnswer
        .with({ indexes: [million, 65 * million] })
        .withTask(0, { endedAt: day(9) })
        .withTask(1, { endedAt: day(10) })
        .withTrend([{ at: day(10), value: 65 * million }])
        .please();
      await page.route(
        (url) => url.pathname === usageTokenIndexEndpoint,
        (route) => route.fulfill({ json: answer }),
      );
      const usage = await visitUsage(page),
        chart = usageChart(page);
      await usage.chooseDays("7");
      await usage.showsDays("7");
      await chart.showsMedianOverflow(
        ["Median ↑ 65,000,000"],
        ["Nov 10 · 10-task rolling median above scale · 65,000,000"],
      );
      await chart.fitsReadingWindow();
      await usage.selectPoint(
        "Nov 10 · 65,000,000 · Large task above 50 million",
        "touch",
      );
      await usage.showsFact("Token index", "65,000,000");
      await usage.closeDetail(
        "Nov 10 · 65,000,000 · Large task above 50 million",
      );
    });
  });
}
