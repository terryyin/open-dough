// Live launch outcomes determine which imported tasks the endpoint plots.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedUsageTasks } from "../../server/retainedUsageTasks.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { keepRetainedLaunch } from "../../tests/usage-history/importHarness.ts";
import {
  day,
  expect,
  test,
  usageServer,
  writeTaskUsage,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const sol = "gpt-6.1-sol",
  astra = "gpt-6-astra";
const story = { identity: "SEED-7#same-story", title: "The same story" };
const launch = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing(story)
    .inCodexSession({ sessionId })
    .launchedAt(day(2));

test("each launch keeps its own detail and outcome; current reports, Done marks and retained history finish imported tasks", async ({
  machine,
}) => {
  const running = launch("running");
  const records = [
    launch("returned")
      .completedWith({ message: "", receivedAt: day(3) })
      .returnedToBacklog()
      .please(),
    launch("completed")
      .requestingModel(astra)
      .requestingEffort("high")
      .completedWith({ message: "Check the follow-up", receivedAt: day(5) })
      .please(),
    launch("reported-later")
      .completedWith({ message: "", outcome: "unfinished", receivedAt: day(6) })
      .please(),
    launch("done").markedDoneAt(day(8)).please(),
  ];
  keepRetainedLaunch(
    machine.home,
    launch("aged-out").markedDoneAt(day(4)).please(),
  );
  keepLaunchStore(machine.home, {
    "open-dough": [...records, running.please()],
  });
  const imported = await retainedUsageTasks(machine.home);
  const histories = imported.map((task) => {
    const usage = makeMe.aUsageTaskHistory
      .withTask({ ...task, lastActivityAt: day(9) })
      .endedAt(day(9));
    if (task.sessionId === "reported-later") usage.withTask({ outcome: null });
    if (task.sessionId === "completed")
      usage
        .withResponse({})
        .withResponse({})
        .withResponse({ model: astra, effort: "high" });
    return usage.please();
  });
  await writeTaskUsage(machine.home, [
    ...histories,
    makeMe.aUsageTaskHistory
      .identifiedAs("recovered")
      .recovered()
      .endedAt(day(10))
      .please(),
  ]);
  const usage = await usageServer(machine);
  const answer = await usage.chart();
  const sessionOf = (id: string) =>
    imported.find((task) => task.id === id)?.sessionId ?? id;

  expect(
    answer.tasks.map(({ id, endedAt, outcome }) => [
      sessionOf(id),
      endedAt,
      outcome,
    ]),
  ).toEqual([
    [
      "returned",
      day(3),
      {
        kind: "reported-complete",
        attention: false,
        disposition: "returned-to-backlog",
      },
    ],
    ["completed", day(5), { kind: "reported-complete", attention: true }],
    [
      "reported-later",
      day(6),
      { kind: "reported-incomplete", attention: false },
    ],
    ["aged-out", day(9), null],
    ["done", day(9), null],
    ["recovered", day(10), null],
  ]);
  expect(
    answer.tasks.filter(({ identity }) => identity === story.identity),
  ).toHaveLength(5);
  expect(
    answer.tasks.find(({ id }) => sessionOf(id) === "completed"),
  ).toMatchObject({
    project: { id: "open-dough", label: "Open Dough" },
    identity: story.identity,
    title: story.title,
    workflow: "execution",
    requested: { model: { id: astra, name: "GPT-6 Astra" }, effort: "high" },
    observed: { model: { id: sol, name: "GPT-6.1 Sol" }, effort: "xhigh" },
    index: 15_900,
    coverage: { kind: "measured" },
  });

  keepLaunchStore(machine.home, {
    "open-dough": [...records, running.markedDoneAt(day(11)).please()],
  });
  const finished = (await usage.chart()).tasks.find(
    ({ id }) => sessionOf(id) === "running",
  );
  expect(finished).toMatchObject({ endedAt: day(9), outcome: null });
});
