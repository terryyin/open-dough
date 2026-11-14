import { comparisonReading } from "../intentCiComparisonPage.ts";
import { expectStackedInOrder } from "../partArrangement.ts";
import {
  doneHistoryRead,
  doneWallTimeHistory,
} from "../priorBuildReferencePage.ts";
// CI state transitions move the independent local history between the gap
// and the shown comparison; they cannot own, reread or discard it.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { doneWallReferenceHistory } from "../support/doneWallReferenceHistory.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { withBrokenCollectedHistory } from "../support/collectedScopeHistory.ts";
import { selectDoneStoryInIntent } from "../support/selectDoneStoryInIntent.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { checkAgainOf } from "../support/storyCiComparisonRetry.ts";

const average = "Prior-build average · 1 min 43 s · 5 prior builds used";

// Each comparison read answers as `mode` says when it is read: a failure, an
// unavailable answer, or the real read.
async function routeComparison(
  page: Page,
  identity: string,
  mode: () => "failed" | "unavailable" | "real",
) {
  const unavailable = makeMe.aStoryCiComparison
    .with({
      kind: "unavailable",
      identity,
      explanation: "Comparison evidence incomplete",
      checkedAt: "2026-11-07T12:00:00Z",
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-comparison/,
    async (route) => {
      const now = mode();
      if (now === "failed")
        await route.fulfill({
          status: 503,
          json: { error: "CI comparison read failed" },
        });
      else if (now === "unavailable")
        await route.fulfill({ json: unavailable });
      else await route.continue();
    },
  );
}

test("failed and unavailable CI comparisons keep the local history after their gap, and its failed refresh and retry leave the comparison as it was", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup),
  );
  let mode: "failed" | "unavailable" = "failed";
  await routeComparison(page, setup.identity, () => mode);
  const { panel, intent } = await selectDoneStoryInIntent(page);
  const history = doneWallTimeHistory(panel);
  const gap = comparisonReading(panel).gap;
  await expect(gap).toContainText("CI comparison read failed");
  await expect(history.average).toHaveText(average);
  await expectStackedInOrder([gap, history.region]);
  mode = "unavailable";
  const reread = doneHistoryRead(page);
  await checkAgainOf(panel).click();
  await expect(gap).toHaveText("Comparison evidence incomplete");
  await reread;
  await expect(history.average).toHaveText(average);
  const actions = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = actions().length;
  await withBrokenCollectedHistory(dashboard.home, async (restore) => {
    await history.refresh.click();
    await expect(history.alert).toContainText(
      "The collected CI history could not be read",
    );
    await expect(history.average).toHaveText(average);
    await expect(gap).toHaveText("Comparison evidence incomplete");
    restore();
    await history.retry.click();
    await expect(history.alert).toHaveCount(0);
    await expect(history.retry).toHaveCount(0);
    await expect(history.average).toHaveText(average);
    await expect(gap).toHaveText("Comparison evidence incomplete");
    await expect(intent).toHaveAttribute("data-selected-story", setup.identity);
    expect(actions()).toHaveLength(before);
  });
});

test("a shown comparison's later CI failure and recovery move the local history without rereading or discarding it", async ({
  page,
  dashboard,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup),
  );
  let mode: "failed" | "real" = "real";
  await routeComparison(page, setup.identity, () => mode);
  let historyReads = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === "/__authenticated-read" &&
      url.searchParams.get("intent") === "ci-history" &&
      url.searchParams.has("revision")
    )
      historyReads += 1;
  });
  // The first real comparison read waits through the shared read bound.
  const { panel } = await selectDoneStoryForCiComparison(page);
  const reading = comparisonReading(panel);
  const history = doneWallTimeHistory(panel);
  await expect(history.average).toHaveText(average);
  await expectStackedInOrder([
    reading.endpointTable,
    history.region,
    reading.entryTable,
  ]);
  expect(historyReads).toBe(1);
  mode = "failed";
  await checkAgainOf(panel).click();
  await expect(reading.gap).toContainText("CI comparison read failed");
  await expect(history.average).toHaveText(average);
  await expect(history.alert).toHaveCount(0);
  expect(historyReads).toBe(1);
  // Its final answer is remembered, so this read asks the provider nothing.
  mode = "real";
  await checkAgainOf(panel).click();
  await expect(reading.wallTimes.nth(2)).toHaveText("4 min");
  await expect(history.average).toHaveText(average);
  await expectStackedInOrder([
    reading.endpointTable,
    history.region,
    reading.entryTable,
  ]);
});
