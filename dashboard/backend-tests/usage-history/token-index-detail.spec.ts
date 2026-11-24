// Live launch outcomes determine which imported tasks the chart plots.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  retainedLaunchEnds,
  retainedUsageTasks,
} from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { writeUsageHistory } from "../../server/usageHistory.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { keepRetainedLaunch } from "../../test-support/usage-history/importHarness.ts";

const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
const sol = "gpt-6.1-sol",
  astra = "gpt-6-astra";
const story = { identity: "SEED-7#same-story", title: "The same story" };
const launch = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing(story)
    .inCodexSession({ sessionId })
    .launchedAt(day(2));

test("each launch keeps its own detail and outcome; current reports, Done marks and retained history finish imported tasks", async () => {
  const home = await mkdtemp(path.join(tmpdir(), "token-index-detail-"));
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  const store = path.join(home, "usage.json");
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
  keepRetainedLaunch(home, launch("aged-out").markedDoneAt(day(4)).please());
  keepLaunchStore(home, {
    "open-dough": [...records, running.please()],
  });
  const imported = await retainedUsageTasks(home);
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
  const tasks = [
    ...histories,
    makeMe.aUsageTaskHistory
      .identifiedAs("recovered")
      .recovered()
      .endedAt(day(10))
      .please(),
  ];
  await writeUsageHistory(makeMe.aUsageHistory.with({ tasks }).please(), store);
  const reading = {
    projects: [makeMe.aPublishedSource.openDough.please()],
    tariff: codexTariff,
    checkedAt: day(12),
    summary: await deriveUsageTaskSummary(store),
  };
  const answer = tokenIndexAnswer(
    { ...reading, launches: await retainedLaunchEnds(home) },
    defaultCohort,
  );
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

  keepLaunchStore(home, {
    "open-dough": [...records, running.markedDoneAt(day(11)).please()],
  });
  const finished = tokenIndexAnswer(
    { ...reading, launches: await retainedLaunchEnds(home) },
    defaultCohort,
  ).tasks.find(({ id }) => sessionOf(id) === "running");
  expect(finished).toMatchObject({ endedAt: day(9), outcome: null });
});
