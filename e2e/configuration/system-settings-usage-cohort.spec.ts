// Terry chooses the cohort System settings → Usage shows, on a usage store
// (./usageFixtureStore.ts) of finished Execution and Refinement tasks:
// Launch workflow offers every launch workflow, and Model and Effort the
// broad option and the primary settings the observed tasks show. A specific
// model keeps the tasks whose root responses mostly ran on it; a root tie
// appears only under All models. How a task's primary setting is decided is
// ../../dashboard/backend-tests/usage-history/token-index-cohort.spec.ts; the
// trend itself, ./system-settings-usage.spec.ts.
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { openUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
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

test("Launch workflow, Model and Effort choose the cohort from the observed tasks, a specific model matching what most root responses ran on", async ({
  page,
}) => {
  const root = (model: string, effort: string, step: number): Response => ({
    model,
    effort,
    tokens: {
      uncachedInput: 2_000 + 300 * step,
      cacheRead: 30_000 - 900 * step,
      output: 200 + 23 * step,
    },
  });
  const executions = [...Array<number>(11).keys()].map((day) =>
    finishedTask(`Execution ${String(day)}`, "execution", day + 1, [
      root(sol, "xhigh", day),
    ]),
  );
  const solRefinements = [...Array<number>(8).keys()].map((day) =>
    finishedTask(`Refinement ${String(day)}`, "refinement", day + 1, [
      root(sol, "high", day + 11),
      // Astra workers do not make the task an Astra one.
      ...(day === 2
        ? [
            { ...root(astra, "high", 1), worker: true as const },
            { ...root(astra, "high", 2), worker: true as const },
          ]
        : []),
    ]),
  );
  const astraRefinements = [9, 10].map((day) =>
    finishedTask(`Astra refinement ${String(day)}`, "refinement", day, [
      root(astra, "medium", day),
      root(astra, "medium", day + 1),
      root(sol, "medium", day + 2),
    ]),
  );
  const tie = finishedTask("Tied refinement", "refinement", 11, [
    root(sol, "high", 3),
    root(astra, "high", 4),
  ]);
  const refinements = [...solRefinements, ...astraRefinements, tie];
  await writeUsageStore(fixture.home, [...executions, ...refinements]);
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
  const usage = await openUsage(page);
  await usage.showsPoints(readouts(executions));
  await usage.showsAverage(averageOf(executions));

  await usage.offers("Launch workflow", ["Execution", "Refinement", "Ad hoc"]);
  await usage.offers("Model", ["All models", "GPT-6.1 Sol", "GPT-6 Astra"]);
  await usage.offers("Effort", ["Any effort", "xhigh", "high", "medium"]);

  await usage.choose("Launch workflow", "Refinement");
  await usage.showsPoints(readouts(refinements));
  await usage.showsAverage(averageOf(refinements));

  await usage.choose("Model", "GPT-6 Astra");
  await usage.showsPoints(readouts(astraRefinements));
  await usage.choose("Model", "GPT-6.1 Sol");
  await usage.showsPoints(readouts(solRefinements));
  await usage.choose("Model", "All models");
  await usage.choose("Effort", "medium");
  await usage.showsPoints(readouts(astraRefinements));
});
