// Import and Refresh agree on launch workflows without rewriting unchanged history.
import { readFileSync, utimesSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
  type UsageHistory,
} from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  runImport,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  counters,
  expect,
  finished,
  sol,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";
import type { TokenIndexAnswer } from "../../src/usageTokenIndex.ts";

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
  machine,
}) => {
  const { home } = machine;
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
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const expected = [
    ["executing", "execution", 100],
    ["refining", "refinement", 200],
  ];
  expect(await taskFacts(store)).toEqual(expected);
  const initial = readFileSync(store);
  const usage = await usageServer(machine);
  await usage.refresh();
  expect(readFileSync(store)).toEqual(initial);
  const longAgo = new Date("2026-11-01T00:00:00.000Z");
  utimesSync(older, longAgo, longAgo);

  // Earlier imports stored the recovered skill on launch tasks. Keep this
  // exact stale representation outside the builder that supplies valid state.
  const legacy = JSON.parse(readFileSync(store, "utf8")) as UsageHistory;
  for (const task of Object.values(legacy.tasks))
    if (task.workflow === "execution") task.workflow = "dough-execute-plan";
  writeFileSync(store, `${JSON.stringify(legacy)}\n`);
  runImport(home, sessions);
  expect(await taskFacts(store)).toEqual(expected);
  const normalized = readFileSync(store);
  for (const write of [
    () => usage.refresh(),
    () => runImport(home, sessions),
    () => usage.refresh(),
  ]) {
    await write();
    expect(await taskFacts(store)).toEqual(expected);
    expect(readFileSync(store)).toEqual(normalized);
  }
  const refreshing = usage.refresh();
  runImport(home, sessions);
  await refreshing;
  expect(await taskFacts(store)).toEqual(expected);
  expect(readFileSync(store)).toEqual(normalized);
  for (const [workflow, identity] of [
    ["execution", "SEED-7#executing"],
    ["refinement", "SEED-7#refining"],
  ]) {
    const answer = await usage.request(
      "GET",
      `/__usage/token-index?workflow=${workflow}`,
    );
    expect(answer.status).toBe(200);
    expect(
      (answer.body as TokenIndexAnswer).tasks.map((task) => task.identity),
    ).toEqual([identity]);
  }
});

test("recovered skills fill a missing launch workflow and remain on a recovered-only Refinement task", async ({
  machine,
}) => {
  const { home } = machine;
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
  runImport(home, sessions);
  const history = await readUsageHistory(store);
  expect(
    Object.values(history.tasks)
      .map(({ sessionId, kind, workflow }) => [sessionId, kind, workflow])
      .toSorted(),
  ).toEqual([
    ["missing", "launch", "dough-story-refinement"],
    ["recovered", "recovered", "dough-story-refinement"],
  ]);
  const usage = await usageServer(machine);
  const answer = await usage.request(
    "GET",
    "/__usage/token-index?workflow=refinement",
  );
  expect(answer.status).toBe(200);
  expect(
    (answer.body as TokenIndexAnswer).tasks.map((task) => task.id),
  ).toContain(JSON.stringify(["codex", "recovered", "recovered-turn"]));
});
