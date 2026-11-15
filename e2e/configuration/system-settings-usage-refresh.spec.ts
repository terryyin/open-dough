// Terry refreshes System settings → Usage after a new Execution launch
// finished, on a usage store (./usageFixtureStore.ts) an earlier import
// wrote, with the launch's record and its Codex rollout in the server's HOME.
// While Refresh checks, the chart stays with a checking note; then the
// launch's point and a new check time show. A Refresh that cannot read the
// store keeps the chart and its check time beside a readable error. This
// journey adds one boundary: it holds the store's document lock, as an
// offline import writing the store would, so the checking note can be seen
// before the Refresh writes. Which rollouts a Refresh reads, and how it
// assigns their responses, are
// ../../dashboard/backend-tests/usage-history/token-index-refresh.spec.ts.
import {
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { retainedUsageTasks } from "../../dashboard/server/retainedUsageTasks.ts";
import { usageCheckFile } from "../../dashboard/server/usageCheck.ts";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { openUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
import {
  codexRollout,
  finishedTask,
  launchedTask,
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

const response = (step: number): Response => ({
  model: sol,
  effort: "xhigh",
  tokens: {
    uncachedInput: 2_000 * step,
    cacheRead: 30_000 - 1_000 * step,
    output: 200 + 40 * step,
  },
});

test("Refresh checks with the chart in place, then adds the newly finished launch's point and a new check time, and a failed Refresh keeps both beside its error", async ({
  page,
}) => {
  const earlier = [
    finishedTask("Execution 3", "execution", 3, [response(1)]),
    finishedTask("Execution 4", "execution", 4, [response(2)]),
  ];
  const store = await writeUsageStore(fixture.home, earlier);
  const importedAt = statSync(store).mtime.toISOString();
  keepLaunchStore(fixture.home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#refresh", title: "Refresh usage" })
        .inCodexSession({ sessionId: "new-launch" })
        .launchedAt("2026-11-06T12:00:00.000Z")
        .withFirstInput({ state: "confirmed", turnId: "first-turn" })
        .completedWith({ message: "" })
        .please(),
    ],
  });
  const latestResponses = [response(3), response(4)];
  codexRollout(fixture.home, "new-launch", "first-turn", latestResponses);
  const [launch] = await retainedUsageTasks(fixture.home);
  if (launch === undefined) throw new Error("The launch was not retained");
  const latest = launchedTask(launch, latestResponses, launch.launchedAt ?? "");
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
  const usage = await openUsage(page);
  await usage.showsPoints(readouts(earlier));
  await usage.showsCheckedAt(importedAt);

  const lock = `${store}.lock`;
  mkdirSync(lock);
  await usage.refresh();
  await usage.showsChecking();
  await usage.showsPoints(readouts(earlier));
  await usage.showsCheckedAt(importedAt);
  rmSync(lock, { recursive: true });

  await usage.showsPoints(readouts([...earlier, latest]));
  await usage.showsChecked();
  const { checkedAt } = JSON.parse(
    readFileSync(usageCheckFile(store), "utf8"),
  ) as { checkedAt: string };
  await usage.showsCheckedAt(checkedAt);

  writeFileSync(store, "{ not a usage store");
  await usage.refresh();
  await usage.showsProblem(
    `Usage could not be refreshed: Usage history is unreadable: ${store}`,
  );
  await usage.showsChecked();
  await usage.showsPoints(readouts([...earlier, latest]));
  await usage.showsCheckedAt(checkedAt);
});
