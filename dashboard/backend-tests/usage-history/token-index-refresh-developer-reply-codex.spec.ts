// A Refresh counts the turns after a developer reply in a dashboard launch's
// Codex thread, and the workers they spawn, into the launch, as an import
// does, once the thread goes on after the launch was imported.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { recordUsageCheck } from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
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
  storedUsage,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

// The launch `SEED-7#first`'s rollout so far: its launch turn with 100 output
// tokens.
const launchTurn = () =>
  makeMe.aCodexRollout
    .forSession("first")
    .withTurnContext("first-turn", sol, "xhigh")
    .withDeveloperInput("/dough-execute-plan SEED-7#first")
    .withResponse("first-turn", "first-100", counters(100));

// The launch's rollout after the developer answers "yes", answered with 300.
const replied = () =>
  launchTurn()
    .withTurnContext("reply-turn", sol, "xhigh")
    .withDeveloperInput("yes")
    .withResponse("reply-turn", "reply-300", counters(300));

// Imports the launch with only its launch turn answered.
function importLaunchTurn(home: string) {
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(sessionsDay(home), launchTurn().please());
  runImport(home, path.join(home, ".codex/sessions"));
}

const sessionsDay = (home: string) =>
  path.join(home, ".codex/sessions/2026/11/14");

test("Refresh counts a Codex reply turn read late, the worker it spawns after the last check, each response once", async ({
  machine,
}) => {
  const { home } = machine;
  importLaunchTurn(home);
  writeCodexSession(
    sessionsDay(home),
    replied().withSpawnedAgent("first-worker").please(),
  );
  // A check past the reply, as a Refresh that read the launch before it
  // finished leaves it.
  await recordUsageCheck(usageHistoryFile(home), new Date().toISOString());
  writeCodexSession(
    sessionsDay(home),
    makeMe.aCodexRollout
      .forSession("first-worker")
      .withParent("first")
      .withTurnContext("worker-turn", sol, "xhigh")
      .withResponse("worker-turn", "worker-own", counters(70), {
        rootTurnId: "reply-turn",
      })
      .please(),
  );
  const usage = await usageServer(machine);
  const points = [];
  for (let check = 0; check < 3; check++) {
    await usage.refresh();
    points.push(
      ((await storedUsage(home)).get("SEED-7#first") ?? []).map(
        ({ root, responses, tokens }) => [root, responses, tokens.output],
      ),
    );
  }
  // The launch and reply responses at the root, the worker's once beside.
  const corrected = [
    [true, 2, 400],
    [false, 1, 70],
  ];
  expect(points).toEqual([corrected, corrected, corrected]);
});

test("Refresh leaves a typed workflow turn after a Codex reply out of the launch", async ({
  machine,
}) => {
  const { home } = machine;
  importLaunchTurn(home);
  writeCodexSession(
    sessionsDay(home),
    replied()
      .withTurnContext("land-turn", sol, "xhigh")
      .withDeveloperInput("/dough-land")
      .withResponse("land-turn", "land-700", counters(700))
      .please(),
  );
  await (await usageServer(machine)).refresh();
  expect((await storedUsage(home)).get("SEED-7#first")).toMatchObject([
    { root: true, responses: 2, tokens: { output: 400 } },
  ]);
});
