// Terry reads how complete the Usage trend is, on a usage store
// (./usageFixtureStore.ts) of finished Codex Execution tasks: one whose
// import records an unattributed worker shows a hollow partial point, its
// detail reads "Partial" with the gap, and it stays out of the line; one
// with a fast-tier response has no point and is counted unpriced in the
// cohort note; nine eligible tasks show their points and "Fewer than 10
// eligible tasks" with no line; and a cohort with no finished task says so.
// Which tasks are partial, unpriced or eligible, and a measured zero, are
// ../../dashboard/backend-tests/usage-history/token-index-eligibility.spec.ts.
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { openUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
import {
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

const response = (step: number, serviceTier?: string): Response => ({
  model: sol,
  effort: "xhigh",
  ...(serviceTier === undefined ? {} : { serviceTier }),
  tokens: {
    uncachedInput: 2_000 * step,
    cacheRead: 30_000 - 1_000 * step,
    output: 200 + 40 * step,
  },
});

test("a partial task keeps a hollow point out of the line, an unpriced one is only counted, and fewer than ten eligible tasks draw no line", async ({
  page,
}) => {
  const eligible = [1, 2, 3, 4, 6, 7, 8, 9, 11].map((day) =>
    finishedTask(`Execution ${String(day)}`, "execution", day, [response(day)]),
  );
  const partial = finishedTask(
    "Missing worker",
    "execution",
    5,
    [response(5)],
    { workerGaps: ["missing-worker-evidence"] },
  );
  const fast = finishedTask("Fast tier", "execution", 10, [
    response(10, "default"),
    response(10, "fast"),
  ]);
  const points = [...eligible.slice(0, 4), partial, ...eligible.slice(4)];
  await writeUsageStore(fixture.home, [...points, fast]);
  const server = await fixture.start("preview");

  await page.goto(`${server.baseURL}/?view=settings`);
  const usage = await openUsage(page);

  await usage.showsCohortNote("11 tasks · 1 partial · 1 unpriced");
  await usage.showsPoints(readouts(points));
  await usage.showsPartialPoints(1);
  // Ten points, but the partial one is not among the ten eligible.
  await usage.showsNoAverage("Fewer than 10 eligible tasks");
  await usage.selectPoint(partial.readout, "pointer");
  await usage.showsFact("Coverage", "Partial · Worker usage missing");

  await usage.choose("Launch workflow", "Refinement");
  await usage.showsCohortNote("0 tasks");
  await usage.showsNoPoints("No finished task matches.");
});
