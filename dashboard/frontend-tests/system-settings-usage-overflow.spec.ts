import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { usageTokenIndexEndpoint } from "../src/usageTokenIndex.ts";
import { test, expect } from "../tests/support/frontendApp.ts";
import { visitUsage } from "../tests/support/systemSettingsUsagePage.ts";
import { usageChart } from "../tests/support/usageChartPage.ts";

test.use({ hasTouch: true });
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
});

test("large tasks keep actual values and dates without flattening ordinary points", async ({
  page,
}) => {
  let answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [1_000_000, 2_000_000] })
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page);
  const chart = usageChart(page);
  await usage.showsPointCount(2);
  const separation = await chart.ordinarySeparation();
  expect(separation).toBeGreaterThan(40);
  answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [1_000_000, 2_000_000, 65_000_000] })
    .withTask(2, { endedAt: "2026-11-02T12:00:00.000Z" })
    .please();
  await usage.chooseDays("7");
  await usage.showsPointCount(3);
  expect(await chart.ordinarySeparation()).toBeCloseTo(separation, 1);
  await chart.showsLarge(
    ["Nov 2 · 65,000,000 · Large task above 50 million"],
    ["65,000,000"],
  );
  await chart.sameDateAsLastOrdinary();
  await chart.showsNote(
    "× Large task above 50 million; labels show actual values. Partial coverage remains marked.",
  );
  await usage.selectPoint(
    "Nov 2 · 65,000,000 · Large task above 50 million",
    "pointer",
  );
  await usage.showsFact("Token index", "65,000,000");
});

test("coincident large tasks remain separate by pointer touch and keyboard with partial details and focus return", async ({
  page,
}) => {
  const answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [65_000_000, 70_000_000] })
    .withTask(1, {
      endedAt: "2026-11-01T12:00:00.000Z",
      coverage: { kind: "partial", gaps: ["missing-worker-evidence"] },
    })
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page);
  const chart = usageChart(page);
  const readouts = [
    "Nov 1 · 65,000,000 · Large task above 50 million",
    "Nov 1 · 70,000,000 · Partial · Large task above 50 million",
  ];
  await chart.showsLarge(readouts, ["65,000,000", "70,000,000 · Partial"]);
  await chart.coincidentMarks(readouts);
  await chart.hasAxis(["0", "25M", "50M"]);
  await chart.showsNote(
    "No ordinary task points in this period; every priced task is above 50 million.",
  );
  for (const by of ["pointer", "touch", "keyboard"] as const) {
    for (const [at, readout] of readouts.entries()) {
      await usage.selectPoint(readout, by);
      await usage.showsFact(
        "Token index",
        at === 0 ? "65,000,000" : "70,000,000",
      );
      await usage.showsFact(
        "Coverage",
        at === 0 ? "No known gaps" : "Partial · Worker usage missing",
      );
      await usage.closeDetail(readout);
    }
  }
});

test("exactly fifty million remains ordinary and measured zero keeps an honest scale", async ({
  page,
}) => {
  let answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [0, 50_000_000, 50_000_001] })
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  const usage = await visitUsage(page);
  const chart = usageChart(page);
  await usage.showsPointCount(3);
  await chart.showsOrdinary(2);
  await chart.showsLarge(
    ["Nov 3 · 50,000,001 · Large task above 50 million"],
    ["50,000,001"],
  );
  answer = makeMe.aTokenIndexAnswer.with({ indexes: [0, 0] }).please();
  await usage.chooseDays("1");
  await usage.showsPointCount(2);
  await chart.showsOrdinary(2);
  await chart.hasAxis(["0", "0.5", "1"]);
});
