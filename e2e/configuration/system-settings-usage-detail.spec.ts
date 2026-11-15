// Terry inspects single tasks behind the Usage trend, on a usage store
// (./usageFixtureStore.ts) holding what an import of this machine's launch
// records stores and a recovered task. Selecting a point by pointer or by
// keyboard shows its detail, and Close returns focus to the point. One story
// launched twice, once returned to the backlog and once completed, gives two
// points with their own outcomes; a recovered October task without a
// reported outcome reads "Outcome unknown"; a launch neither reported nor
// marked done is plotted only once its launch is marked done. The finished
// rule's variants and the detail on the wire are
// ../../dashboard/backend-tests/usage-history/token-index-detail.spec.ts.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { retainedUsageTasks } from "../../dashboard/server/retainedUsageTasks.ts";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { openUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
import {
  finishedTask,
  indexWords,
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

const story = {
  identity: "SEED-42#keep-launch-history",
  title: "Keep launch history",
};
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;

// A launch of the story in its own Codex session, asking for GPT-6.1 Sol at
// high effort.
const launch = (sessionId: string, date: number) =>
  makeMe.aLaunchRecord
    .executing(story)
    .inCodexSession({ sessionId })
    .launchedAt(day(date))
    .requestingModel(sol)
    .requestingEffort("high");

const response = (step: number): Response => ({
  model: sol,
  effort: "xhigh",
  tokens: {
    uncachedInput: 3_000 * step,
    cacheRead: 40_000 - 2_000 * step,
    output: 300 + 50 * step,
  },
});

test("each launch of a story is its own point whose detail a pointer or Enter opens and Close leaves, and a launch is plotted once it is marked done", async ({
  page,
}) => {
  const returned = launch("first-launch", 3)
    .completedWith({ message: "" })
    .returnedToBacklog()
    .markedDoneAt(day(3))
    .please();
  const completed = launch("second-launch", 5)
    .completedWith({ message: "" })
    .please();
  const running = launch("third-launch", 7);
  keepLaunchStore(fixture.home, {
    "open-dough": [returned, completed, running.please()],
  });
  const imported = await retainedUsageTasks(fixture.home);
  const launched = (sessionId: string, step: number, lastActive: string) => {
    const task = imported.find((each) => each.sessionId === sessionId);
    if (task === undefined) throw new Error(`${sessionId} was not imported`);
    return launchedTask(task, [response(step)], lastActive);
  };
  const first = launched("first-launch", 1, day(4));
  const second = launched("second-launch", 2, day(6));
  const third = launched("third-launch", 3, day(8));
  const recovered = finishedTask(
    "Recovered execution",
    "execution",
    20,
    [response(4)],
    { recovered: true, month: "2026-10" },
  );
  await writeUsageStore(fixture.home, [recovered, first, second, third]);
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
  let usage = await openUsage(page);
  await usage.showsPoints(readouts([recovered, first, second]));

  const about = `Open Dough · ${story.identity} · Codex · Execution`;
  const observed = ["Observed model", "GPT-6.1 Sol · xhigh effort"] as const;
  const requested = ["Requested model", "GPT-6.1 Sol · high effort"] as const;
  const measured = ["Coverage", "No known gaps"] as const;
  await usage.selectPoint(first.readout, "pointer");
  await usage.showsDetail({
    title: story.title,
    about,
    facts: [
      ["Token index", indexWords(first)],
      observed,
      requested,
      ["Ended", { at: day(3), outcome: "Returned to backlog" }],
      measured,
    ],
  });
  await usage.closeDetail(first.readout);

  await usage.selectPoint(second.readout, "keyboard");
  await usage.showsDetail({
    title: story.title,
    about,
    facts: [
      ["Token index", indexWords(second)],
      observed,
      requested,
      ["Ended", { at: day(5), outcome: "Completed" }],
      measured,
    ],
  });
  await usage.closeDetail(second.readout);

  await usage.selectPoint(recovered.readout, "pointer");
  await usage.showsDetail({
    title: "Recovered execution",
    about: "Open Dough · Codex · Execution",
    facts: [
      ["Token index", indexWords(recovered)],
      observed,
      ["Ended", { at: "2026-10-20T12:00:00.000Z", outcome: "Outcome unknown" }],
      measured,
    ],
  });

  keepLaunchStore(fixture.home, {
    "open-dough": [returned, completed, running.markedDoneAt(day(9)).please()],
  });
  await page.reload();
  usage = await openUsage(page);
  await usage.showsPoints(readouts([recovered, first, second, third]));
  await usage.selectPoint(third.readout, "keyboard");
  await usage.showsDetail({
    title: story.title,
    about,
    facts: [
      ["Token index", indexWords(third)],
      observed,
      requested,
      ["Ended", { at: day(8), outcome: "Outcome unknown" }],
      measured,
    ],
  });
});
