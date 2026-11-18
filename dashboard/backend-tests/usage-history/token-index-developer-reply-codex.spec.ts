// A dashboard launch's Token index includes the responses of a Codex turn the
// developer opens after the launch, and the workers that turn spawns.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  readImported,
  runImport,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  counters,
  expect,
  finished,
  sol,
  storedUsage,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

// The launch `SEED-7#first`'s rollout: its launch turn with 100 output tokens,
// then a turn the developer opens with "yes", answered with 300.
const codexReply = () =>
  makeMe.aCodexRollout
    .forSession("first")
    .withTurnContext("first-turn", sol, "xhigh")
    .withDeveloperInput("/dough-execute-plan SEED-7#first")
    .withResponse("first-turn", "first-100", counters(100))
    .withTurnContext("reply-turn", sol, "xhigh")
    .withDeveloperInput("yes")
    .withResponse("reply-turn", "reply-300", counters(300));

async function codexUsage(
  machine: Parameters<typeof usageServer>[0],
  rollouts: object[][],
  imports = 1,
) {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  for (const rows of rollouts)
    writeCodexSession(path.join(sessions, "2026/11/14"), rows);
  for (let i = 0; i < imports; i++) runImport(home, sessions);
  await (await usageServer(machine)).refresh();
  return (await storedUsage(home)).get("SEED-7#first");
}

test("a Codex reply turn's responses count in the launch", async ({
  machine,
}) => {
  expect(await codexUsage(machine, [codexReply().please()])).toMatchObject([
    { root: true, responses: 2, tokens: { output: 400 } },
  ]);
});

test("a reply turn that opens with host-injected context counts once in the launch on every import", async ({
  machine,
}) => {
  const rollout = makeMe.aCodexRollout
    .forSession("first")
    .withTurnContext("first-turn", sol, "xhigh")
    .withDeveloperInput("/dough-execute-plan SEED-7#first")
    .withResponse("first-turn", "first-100", counters(100))
    .withTurnContext("reply-turn", sol, "xhigh")
    .withDeveloperInput("<environment_context>restart</environment_context>")
    .withResponse("reply-turn", "reply-300", counters(300))
    .withDeveloperInput("yes")
    .withResponse("reply-turn", "reply-500", counters(500))
    .please();
  expect(await codexUsage(machine, [rollout], 2)).toMatchObject([
    { root: true, responses: 3, tokens: { output: 900 } },
  ]);
  const { tasks, associations } = readImported(machine.home);
  const launches = Object.values(tasks).filter(
    (task) => task.rootTurnId === "first-turn",
  );
  expect(launches).toHaveLength(1);
  expect(
    new Set(Object.values(associations).map(({ taskId }) => taskId)),
  ).toEqual(new Set([launches[0]?.id]));
});

test("a Codex worker spawned in the reply turn counts once in the launch", async ({
  machine,
}) => {
  const worker = makeMe.aCodexRollout
    .forSession("first-worker")
    .withParent("first")
    .withTurnContext("worker-turn", sol, "xhigh")
    .withResponse("worker-turn", "worker-own", counters(70), {
      rootTurnId: "reply-turn",
    })
    .please();
  expect(
    await codexUsage(machine, [
      codexReply().withSpawnedAgent("first-worker").please(),
      worker,
    ]),
  ).toEqual([
    expect.objectContaining({
      root: true,
      responses: 2,
      tokens: expect.objectContaining({ output: 400 }),
    }),
    expect.objectContaining({
      root: false,
      responses: 1,
      tokens: expect.objectContaining({ output: 70 }),
    }),
  ]);
});

test("a reply turn's compaction response, recorded before its turn context, counts at that turn's model", async ({
  machine,
}) => {
  // Codex starts the turn, records its compaction's usage and the compacted
  // history, and only then writes the turn's `turn_context` and the input.
  const rollout = makeMe.aCodexRollout
    .forSession("first")
    .withTurnContext("first-turn", sol, "xhigh")
    .withDeveloperInput("/dough-execute-plan SEED-7#first")
    .withResponse("first-turn", "first-100", counters(100))
    .withRow({
      type: "event_msg",
      payload: { type: "task_started", turn_id: "reply-turn" },
    })
    .withResponse("reply-turn", "compaction-300", counters(300))
    .withRow({ type: "compacted", payload: { message: "" } })
    .withTurnContext("reply-turn", sol, "xhigh")
    .withDeveloperInput("yes")
    .please();
  expect(await codexUsage(machine, [rollout])).toMatchObject([
    { root: true, model: sol, responses: 2, tokens: { output: 400 } },
  ]);
});
