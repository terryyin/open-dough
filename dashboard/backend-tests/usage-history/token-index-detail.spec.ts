// Which dashboard Codex tasks the usage endpoint (../../server/usageBoundary.ts)
// plots and the detail each point carries, at the boundary server over raw
// HTTP with a usage store and launch records in the server's HOME. A task is
// finished once it has a reported outcome or its launch is marked done, as
// its launch record says now, whether the operational document or launch
// history keeps it; a recovered task is finished. A launch neither reported
// nor marked done is not plotted until it is marked done. Each point carries
// its story, project, launch workflow, outcome, end time, requested and
// primary observed model and effort, index and coverage. The page's journey
// is ../../../e2e/configuration/system-settings-usage-detail.spec.ts.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedUsageTasks } from "../../server/retainedUsageTasks.ts";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import type { UsageTask } from "../../server/usageRecords.ts";
import type { TokenIndexAnswer } from "../../src/usageTokenIndex.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { projectConfigurationFile } from "../../tests/support/projectConfiguration.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { systemSettingsMachine } from "../../tests/support/systemSettingsMachine.ts";
import { keepRetainedLaunch } from "../../tests/usage-history/importHarness.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

const sol = "gpt-6.1-sol";
const astra = "gpt-6-astra";
const tokens = { uncachedInput: 1_000, cacheRead: 9_000, output: 100 };
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;

function configureOpenDough(home: string) {
  const file = projectConfigurationFile(home, "production");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          id: "open-dough",
          label: "Open Dough",
          repository: "terryyin/open-dough",
          localPath: "~/git/open-dough",
        })
        .please(),
    ]),
  );
}

// An execution launch of the story in its own Codex session.
const launch = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#${sessionId}`, title: `Story ${sessionId}` })
    .inCodexSession({ sessionId })
    .launchedAt(day(2));

// The launch's usage task as an import stores it, last active on day 9 with
// one GPT-6.1 Sol response unless the case states its responses.
function stored(
  imported: readonly UsageTask[],
  sessionId: string,
  facts: Partial<UsageTask> = {},
  responses: readonly {
    readonly model: string;
    readonly effort?: string;
    readonly tokens: typeof tokens;
  }[] = [{ model: sol, effort: "xhigh", tokens }],
) {
  const task = imported.find((each) => each.sessionId === sessionId);
  if (task === undefined) throw new Error(`${sessionId} was not imported`);
  return {
    task: { ...task, lastActivityAt: day(9), ...facts },
    responses: responses.map((response) => ({ ...response, at: day(9) })),
  };
}

async function plotted(baseURL: string, origin: string) {
  const response = await rawRequest({
    url: `${baseURL}/__usage/token-index`,
    headers: { Origin: origin },
  });
  expect(response.status, response.body).toBe(200);
  return (JSON.parse(response.body) as TokenIndexAnswer).tasks;
}

test("a launch is plotted once its record reports an outcome or marks it done, in the operational document or launch history, and a recovered task always is", async () => {
  configureOpenDough(fixture.home);
  const running = launch("running");
  const records = {
    reported: launch("reported").completedWith({ message: "" }).please(),
    // Reported after the usage store imported it.
    reportedLater: launch("reported-later")
      .completedWith({ message: "", outcome: "unfinished", receivedAt: day(6) })
      .please(),
    done: launch("done").markedDoneAt(day(8)).please(),
  };
  const agedOut = launch("aged-out").markedDoneAt(day(4)).please();
  keepRetainedLaunch(fixture.home, agedOut);
  keepLaunchStore(fixture.home, {
    "open-dough": [...Object.values(records), running.please()],
  });
  const imported = await retainedUsageTasks(fixture.home);
  const recovered = {
    task: {
      id: "recovered",
      kind: "recovered" as const,
      origin: "dashboard" as const,
      project: "open-dough",
      workflow: "dough-execute-plan",
      lastActivityAt: day(10),
    },
    responses: [{ model: sol, effort: "xhigh", tokens, at: day(10) }],
  };
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({
        tasks: [
          stored(imported, "reported"),
          stored(imported, "reported-later", { outcome: null }),
          stored(imported, "done"),
          stored(imported, "aged-out"),
          stored(imported, "running"),
          recovered,
        ],
      })
      .please(),
    usageHistoryFile(fixture.home),
  );
  const server = await fixture.start("boundary");
  const ends = async () =>
    (await plotted(server.baseURL, server.origin)).map((task) => [
      task.identity ?? task.id,
      task.endedAt,
      task.outcome,
    ]);

  expect(await ends()).toEqual([
    [
      "SEED-7#reported",
      day(2),
      { kind: "reported-complete", attention: false },
    ],
    [
      "SEED-7#reported-later",
      day(6),
      { kind: "reported-incomplete", attention: false },
    ],
    ["SEED-7#aged-out", day(9), null],
    ["SEED-7#done", day(9), null],
    ["recovered", day(10), null],
  ]);

  keepLaunchStore(fixture.home, {
    "open-dough": [
      ...Object.values(records),
      running.markedDoneAt(day(11)).please(),
    ],
  });
  expect((await ends()).map(([id]) => id)).toContain("SEED-7#running");
});

test("a point carries its story, project, launch workflow, requested and primary observed model and effort, index and coverage", async () => {
  configureOpenDough(fixture.home);
  keepLaunchStore(fixture.home, {
    "open-dough": [
      launch("requested")
        .requestingModel(astra)
        .requestingEffort("high")
        .completedWith({ message: "Check the follow-up" })
        .please(),
    ],
  });
  const imported = await retainedUsageTasks(fixture.home);
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({
        tasks: [
          stored(imported, "requested", {}, [
            { model: sol, effort: "xhigh", tokens },
            { model: sol, effort: "xhigh", tokens },
            { model: astra, effort: "high", tokens },
          ]),
        ],
      })
      .please(),
    usageHistoryFile(fixture.home),
  );
  const server = await fixture.start("boundary");

  expect(await plotted(server.baseURL, server.origin)).toMatchObject([
    {
      project: { id: "open-dough", label: "Open Dough" },
      identity: "SEED-7#requested",
      title: "Story requested",
      workflow: "execution",
      outcome: { kind: "reported-complete", attention: true },
      endedAt: day(2),
      requested: { model: { id: astra, name: "GPT-6 Astra" }, effort: "high" },
      observed: { model: { id: sol, name: "GPT-6.1 Sol" }, effort: "xhigh" },
      coverage: { kind: "measured" },
    },
  ]);
});
