import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { usageTokenIndexEndpoint } from "../src/usageTokenIndex.ts";
import { test, expect } from "../tests/support/frontendApp.ts";
import { narrowWindow, twiceZoomedWindow } from "../tests/accessibleReading.ts";
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";
import { usageChart } from "../tests/support/usageChartPage.ts";

const million = 1_000_000;
const example = () =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: [...Array<number>(9).fill(million), 65 * million] })
    .please();
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("the true average is distinct above dots and never enlarges ordinary geometry", async ({
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
  answer = {
    ...makeMe.aTokenIndexAnswer
      .with({ indexes: [million, 2 * million, 65 * million] })
      .please(),
    average: [{ at: "2026-11-03T12:00:00.000Z", value: 8 * million }],
  };
  await usage.chooseDays("7");
  await usage.showsPointCount(3);
  expect(await chart.ordinarySeparation()).toBeCloseTo(separation, 1);
  await chart.showsAverageOverflow(
    ["Avg ↑ 8,000,000"],
    ["Nov 3 · 10-task moving average above scale · 8,000,000"],
  );
  await chart.showsAverageAtLargeDate();
  answer = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        million,
        2 * million,
        3 * million,
        ...Array<number>(7).fill(million),
      ],
    })
    .please();
  await usage.chooseDays("30");
  await usage.showsPointCount(10);
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await chart.showsDistinctAverageAboveDots();
  }
});

test("nine million-token tasks and a sixty-five-million task expose the true 7.4-million average", async ({
  page,
}) => {
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: example() }),
  );
  await visitUsage(page);
  const chart = usageChart(page);
  await chart.showsLatestAverage("7,400,000");
  await chart.hasAxis(["0", "500K", "1M"]);
  await chart.showsAverageOverflow(
    ["Avg ↑ 7,400,000"],
    ["Nov 10 · 10-task moving average above scale · 7,400,000"],
  );
  await chart.showsAverageAtLargeDate();
});

test("an in-scale average breaks across above-scale observations and all-large averages stay explicit", async ({
  page,
}) => {
  let answer = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        ...Array<number>(10).fill(million),
        65 * million,
        ...Array<number>(10).fill(million),
      ],
    })
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page),
    chart = usageChart(page);
  await usage.showsPointCount(21);
  await chart.showsSeparatedAverageLevels();
  answer = makeMe.aTokenIndexAnswer
    .with({ indexes: Array<number>(10).fill(65 * million) })
    .please();
  await usage.chooseDays("7");
  await usage.showsPointCount(10);
  await chart.hasAxis(["0", "25M", "50M"]);
  await chart.showsLatestAverage("65,000,000");
  await chart.showsAverageOverflow(
    ["Avg ↑ 65,000,000"],
    ["Nov 10 · 10-task moving average above scale · 65,000,000"],
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
      await page.route(
        (url) => url.pathname === usageTokenIndexEndpoint,
        (route) => route.fulfill({ json: example() }),
      );
      const usage = await visitUsage(page),
        chart = usageChart(page);
      await usage.chooseDays("7");
      await usage.showsDays("7");
      await chart.showsAverageOverflow(
        ["Avg ↑ 7,400,000"],
        ["Nov 10 · 10-task moving average above scale · 7,400,000"],
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
