// A finished task that used a model missing from its tool's rate card plots at
// an estimated rate, and the tool's summary asks for the rate card update.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../dashboard/server/usageHistory.ts";
import { test } from "../../dashboard/test-support/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/test-support/support/systemSettingsMachine.ts";
import { visitUsage } from "../../dashboard/test-support/support/systemSettingsUsagePage.ts";

const nova = "gpt-9-nova";
const exactDates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("Usage warns once per unlisted model and shows each task's substitution", async ({
  page,
}) => {
  const exact = exactDates.map((date) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`exact-${String(date)}`)
      .endedAt(day(date))
      .please(),
  );
  const estimated = makeMe.aUsageTaskHistory
    .identifiedAs("estimated")
    .endedAt(day(10))
    .withResponse({ model: nova })
    .please();
  const worker = makeMe.aUsageTaskHistory
    .identifiedAs("worker")
    .endedAt(day(11))
    .withResponse({})
    .withWorkerResponse({ model: nova })
    .withWorkerGaps("missing-worker-evidence")
    .please();
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({ tasks: [...exact, estimated, worker] })
      .please(),
    usageHistoryFile(fixture.home),
  );
  const server = await fixture.start("preview");
  const usage = await visitUsage(page, server.baseURL);

  await usage.showsRateCardWarnings([
    "Codex used gpt-9-nova, which is not on its Token Index rate card; estimated at GPT-6.1 Sol rates. The Token Index rate card needs an update.",
  ]);
  await usage.showsPoints([
    ...exactDates.map((date) => `Nov ${String(date)} · Codex · 1,950`),
    "Nov 10 · Codex · 1,950 · Estimated rate",
    "Nov 11 · Codex · 3,900 · Partial · Estimated rate",
  ]);
  await usage.showsEstimatedPoints(2);
  await usage.showsNoMedian("none is available in this period");
  await usage.selectPoint(
    "Nov 11 · Codex · 3,900 · Partial · Estimated rate",
    "keyboard",
  );
  await usage.showsFact("Estimated rate", "gpt-9-nova at GPT-6.1 Sol rates");
  await usage.showsFact("Observed model", "GPT-6.1 Sol · xhigh effort");
  await usage.showsFact("Coverage", "Partial · Worker usage missing");
  await usage.choose("Launch workflow", "Refinement");
  await usage.showsRateCardWarnings([]);
});
