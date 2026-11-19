import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageTokenIndexEndpoint } from "../../src/usageTokenIndex.ts";
import { test, expect } from "../../test-support/support/frontendApp.ts";
import { visitUsage } from "../../test-support/support/systemSettingsUsagePage.ts";

test.use({ timezoneId: "America/New_York" });

test("local calendar requests retain the last valid day view through invalid input and cohort changes", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-15T18:00:00.000Z") });
  const requests: URLSearchParams[] = [];
  const answer = makeMe.aTokenIndexAnswer.please();
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    async (route) => {
      requests.push(new URL(route.request().url()).searchParams);
      await held;
      await route.fulfill({ json: answer });
    },
  );
  const usage = await visitUsage(page);
  await usage.showsLoading();
  release();
  await usage.showsDays("30");
  await usage.showsPointCount(1);
  expect(requests[0]?.get("from")).toBe("2026-10-17T04:00:00.000Z");
  expect(requests[0]?.get("until")).toBe("2026-11-16T05:00:00.000Z");
  for (const invalid of ["0", "-1", "1.5", "", "abc"]) {
    await usage.chooseDays(invalid);
    await usage.showsDaysProblem(
      "Enter a positive whole number of days. Showing the last 30 days.",
    );
    await usage.showsPointCount(1);
    expect(requests).toHaveLength(1);
  }
  await usage.chooseDays("30");
  await usage.showsPointCount(1);
  expect(requests).toHaveLength(1);
  await usage.chooseDays("7");
  await usage.showsPointCount(1);
  expect(requests.at(-1)?.get("from")).toBe("2026-11-09T05:00:00.000Z");
  await usage.choose("Launch workflow", "Refinement");
  await usage.showsPointCount(1);
  await usage.showsDays("7");
  expect(requests.at(-1)?.get("workflow")).toBe("refinement");
  expect(requests.at(-1)?.get("from")).toBe("2026-11-09T05:00:00.000Z");
});

test("empty periods explain their counts and do not show an old median", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-15T18:00:00.000Z") });
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) =>
      route.fulfill({
        json: makeMe.aTokenIndexAnswer
          .with({ indexes: [] })
          .withUnpricedTasks(2)
          .please(),
      }),
  );
  const usage = await visitUsage(page);
  await usage.showsCohortNote("2 tasks · 2 unpriced · Last 30 days");
  await usage.showsNoPoints(
    "No priced finished task matches in the last 30 days.",
  );
  await usage.showsNoMedian(
    "A rolling median needs 10 eligible tasks; none is available in this period",
  );
});
