// System settings → Usage's moving average on the shared history chart, from
// a substituted Token index answer: with exactly ten eligible tasks the
// average has one value, drawn as a short level at the tenth task, so only
// fewer than ten eligible tasks draw no line
// (../../e2e/configuration/system-settings-usage-coverage.spec.ts).
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { usageTokenIndexEndpoint } from "../src/usageTokenIndex.ts";
import { test } from "../tests/support/frontendApp.ts";
import { openUsage } from "../tests/support/systemSettingsUsagePage.ts";

test("ten eligible tasks draw their one moving average value", async ({
  page,
}) => {
  const answer = makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        1_000, 1_100, 1_200, 1_300, 1_400, 1_500, 1_600, 1_700, 1_800, 1_900,
      ],
    })
    .please();
  await page.route(
    (url) => url.pathname === usageTokenIndexEndpoint,
    (route) => route.fulfill({ json: answer }),
  );
  await page.goto("/?view=settings");
  const usage = await openUsage(page);

  await usage.showsAverage("1,450");
});
