// Import and Refresh agree on launch workflows without rewriting unchanged history.
import { mkdirSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { readTokenIndex } from "../../server/tokenIndexRead.ts";
import { lastUsageCheck } from "../../server/usageCheck.ts";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
  type UsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import { refreshUsage } from "../../server/usageRefreshRun.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { currentUsageTaskSummary } from "../../server/usageTaskSummaryCache.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { projectConfigurationFile } from "../../test-support/support/projectConfiguration.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";
import { test } from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  counters,
  finished,
  sol,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const project = makeMe.aConfiguredProject
  .with({
    ...makeMe.aPublishedSource.openDough.please(),
    localPath: "~/git/open-dough",
  })
  .please();

function keepProject(home: string) {
  const file = projectConfigurationFile(home, "production");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify([project]));
}

const chart = (home: string, store: string, query: URLSearchParams) =>
  readTokenIndex("GET", query, async (tool) => ({
    summary: await currentUsageTaskSummary(store),
    projects: [project],
    launches: await retainedLaunchEnds(home),
    tariff: usageTariffs[tool],
    checkedAt: await lastUsageCheck(store),
  }));

function rollout(home: string, session: string, skill: string, output: number) {
  return makeMe.aCodexRollout
    .forSession(session)
    .withCwd(path.join(home, "git/open-dough"))
    .withTurnContext(`${session}-turn`, sol, "xhigh")
    .withRow({
      type: "response_item",
      payload: {
        role: "user",
        content: [
          {
            text: `$${skill} SEED-7#${session}\nDashboard reporting context:\n- project: open-dough\n- host: codex\n- launch reference: ca7430bd-0d52-499d-a1bd-660263c77c12\n`,
          },
        ],
      },
    })
    .withResponse(`${session}-turn`, `${session}-answer`, counters(output))
    .please();
}

const taskFacts = async (store: string) => {
  const history = await readUsageHistory(store);
  return Object.values(history.tasks)
    .map((task) => [
      task.sessionId,
      task.workflow,
      taskUsage(history, task.id).tokens.output,
    ])
    .toSorted();
};

test("alternating writers keep launch workflows, cohort membership, totals and bytes after normalizing an old skill spelling", async ({
  home,
}) => {
  keepProject(home);
  const sessions = path.join(home, ".codex/sessions");
  const refinement = makeMe.aLaunchRecord
    .refining({ identity: "SEED-7#refining", title: "Refining story" })
    .inCodexSession({ sessionId: "refining" })
    .launchedAt("2026-11-14T09:00:00.000Z")
    .withFirstInput({ state: "confirmed", turnId: "refining-turn" })
    .completedWith({ message: "" })
    .please();
  keepLaunchStore(home, { "open-dough": [finished("executing"), refinement] });
  const older = writeCodexSession(
    sessions,
    rollout(home, "executing", "dough-execute-plan", 100),
  );
  writeCodexSession(
    sessions,
    rollout(home, "refining", "dough-story-refinement", 200),
  );
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const { store } = options;
  const expected = [
    ["executing", "execution", 100],
    ["refining", "refinement", 200],
  ];
  expect(await taskFacts(store)).toEqual(expected);
  const initial = readFileSync(store);
  await refreshUsage(home, store);
  expect(readFileSync(store)).toEqual(initial);
  const longAgo = new Date("2026-11-01T00:00:00.000Z");
  utimesSync(older, longAgo, longAgo);

  // Earlier imports stored the recovered skill on launch tasks. Keep this
  // exact stale representation outside the builder that supplies valid state.
  const legacy = JSON.parse(readFileSync(store, "utf8")) as UsageHistory;
  for (const task of Object.values(legacy.tasks))
    if (task.workflow === "execution") task.workflow = "dough-execute-plan";
  writeFileSync(store, `${JSON.stringify(legacy)}\n`);
  await importUsageHistory(options);
  expect(await taskFacts(store)).toEqual(expected);
  const normalized = readFileSync(store);
  for (const write of [
    () => refreshUsage(home, store),
    () => importUsageHistory(options),
    () => refreshUsage(home, store),
  ]) {
    await write();
    expect(await taskFacts(store)).toEqual(expected);
    expect(readFileSync(store)).toEqual(normalized);
  }
  await Promise.all([refreshUsage(home, store), importUsageHistory(options)]);
  expect(await taskFacts(store)).toEqual(expected);
  expect(readFileSync(store)).toEqual(normalized);
  for (const [workflow, identity] of [
    ["execution", "SEED-7#executing"],
    ["refinement", "SEED-7#refining"],
  ] as const) {
    const answer = await chart(home, store, new URLSearchParams({ workflow }));
    expect(answer.tasks.map((task) => task.identity)).toEqual([identity]);
  }
});

test("recovered skills fill a missing launch workflow and remain on a recovered-only Refinement task", async ({
  home,
}) => {
  keepProject(home);
  const sessions = path.join(home, ".codex/sessions");
  const store = usageHistoryFile(home);
  await writeUsageHistory(
    {
      tasks: [
        makeMe.aUsageTask
          .with({
            id: "missing-workflow",
            kind: "launch",
            project: "open-dough",
            sessionId: "missing",
            rootTurnId: "missing-turn",
            workflow: null,
          })
          .please(),
      ],
    },
    store,
  );
  writeCodexSession(
    sessions,
    rollout(home, "missing", "dough-story-refinement", 30),
  );
  writeCodexSession(
    sessions,
    rollout(home, "recovered", "dough-story-refinement", 40),
  );
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store,
      codexRoots: [sessions],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  const history = await readUsageHistory(store);
  expect(
    Object.values(history.tasks)
      .map(({ sessionId, kind, workflow }) => [sessionId, kind, workflow])
      .toSorted(),
  ).toEqual([
    ["missing", "launch", "dough-story-refinement"],
    ["recovered", "recovered", "dough-story-refinement"],
  ]);
  const answer = await chart(
    home,
    store,
    new URLSearchParams({ workflow: "refinement" }),
  );
  expect(answer.tasks.map((task) => task.id)).toContain(
    JSON.stringify(["codex", "recovered", "recovered-turn"]),
  );
});
