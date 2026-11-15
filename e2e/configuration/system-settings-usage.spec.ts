// Terry opens System settings → Usage on a machine whose usage store
// (./usageFixtureStore.ts) holds finished dashboard Codex tasks. Usage is its
// own view beside General and shows, for Codex, Execution, All models and
// Any effort, one Token index point per task over its end time, the trailing
// 10-task moving average, the tariff version and when the usage was checked.
// Choosing another cohort is ./system-settings-usage-cohort.spec.ts; how the
// endpoint weighs responses and leaves the store unchanged,
// ../../dashboard/backend-tests/usage-history/token-index.spec.ts.
import { readFileSync } from "node:fs";
import { usageTaskSummaryFile } from "../../dashboard/server/usageTaskSummary.ts";
import { codexTariff } from "../../dashboard/server/usageTariffs.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import {
  expectGeneralSettingsShown,
  openUsage,
} from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
import {
  astra,
  averageOf,
  finishedTask,
  readouts,
  sol,
  writeUsageStore,
  type Response,
} from "./usageFixtureStore.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("Usage shows each finished Codex execution's Token index with the 10-task moving average and the tariff version", async ({
  page,
}) => {
  const tasks = [...Array<number>(12).keys()].map((day) => {
    const responses: Response[] = [
      {
        model: sol,
        effort: "xhigh",
        tokens: {
          uncachedInput: 1_000 * (day + 1),
          cacheRead: 20_000 - 1_000 * day,
          output: 150 + 37 * day,
        },
      },
    ];
    if (day === 7)
      responses.push({
        model: astra,
        effort: "xhigh",
        worker: true,
        tokens: { uncachedInput: 4_000, cacheRead: 6_000, output: 500 },
      });
    return finishedTask(
      `Execution ${String(day)}`,
      "execution",
      day + 1,
      responses,
      {
        recovered: day === 0,
      },
    );
  });
  const store = await writeUsageStore(fixture.home, tasks);
  const server = await fixture.start("preview");

  await page.goto(`${server.baseURL}/?view=settings`);
  await expectGeneralSettingsShown(page);
  const usage = await openUsage(page);

  await usage.showsCohort({
    Tool: "Codex",
    "Launch workflow": "Execution",
    Model: "All models",
    Effort: "Any effort",
  });
  await usage.showsPoints(readouts(tasks));
  await usage.showsAverage(averageOf(tasks));
  await usage.showsTariff(codexTariff.label);
  const summary = JSON.parse(
    readFileSync(usageTaskSummaryFile(store), "utf8"),
  ) as { checkedAt: string };
  await usage.showsCheckedAt(summary.checkedAt);
});
