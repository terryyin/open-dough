// A launch's usage includes the Codex replies and workers it owns.
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readUsageHistory } from "../../server/usageHistory.ts";
import {
  importUsageHistory,
  usageHistorySince,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";

const identity = "SEED-7#first";
const sol = "gpt-6.1-sol";
const counters = (output: number) => ({
  input_tokens: 10_000,
  cached_input_tokens: 8_000,
  cache_write_input_tokens: 0,
  output_tokens: output,
});
const launchTurn = () =>
  makeMe.aCodexRollout
    .forSession("first")
    .withTurnContext("first-turn", sol, "xhigh")
    .withDeveloperInput(`/dough-execute-plan ${identity}`)
    .withResponse("first-turn", "first-100", counters(100));
const replied = () =>
  launchTurn()
    .withTurnContext("reply-turn", sol, "xhigh")
    .withDeveloperInput("yes")
    .withResponse("reply-turn", "reply-300", counters(300));

async function keptLaunch() {
  const home = await mkdtemp(path.join(tmpdir(), "token-index-codex-reply-"));
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  keepLaunchRecords(home, [
    makeMe.aLaunchRecord
      .executing({ identity, title: "First story" })
      .inCodexSession({ sessionId: "first" })
      .launchedAt("2026-11-14T09:00:00.000Z")
      .withFirstInput({ state: "confirmed", turnId: "first-turn" })
      .completedWith({})
      .please(),
  ]);
  const rollouts = path.join(home, "rollouts");
  const sources = {
    home,
    store: path.join(home, "usage.json"),
    codexRoots: [rollouts],
    since: usageHistorySince,
  };
  return { rollouts, sources };
}

test("a Codex reply turn's responses count in the launch", async () => {
  const { rollouts, sources } = await keptLaunch();
  writeCodexSession(rollouts, replied().please());

  await importUsageHistory(sources);
  const { tasks } = await deriveUsageTaskSummary(sources.store);

  expect(tasks.find((task) => task.identity === identity)?.usage).toMatchObject(
    [{ root: true, responses: 2, tokens: { output: 400 } }],
  );
});

test("a reply turn that opens with host-injected context counts once in the launch on every import", async () => {
  const { rollouts, sources } = await keptLaunch();
  const responses = path.join(sources.home, "responses.json");
  writeCodexSession(
    rollouts,
    launchTurn()
      .withTurnContext("reply-turn", sol, "xhigh")
      .withDeveloperInput("<environment_context>restart</environment_context>")
      .withResponse("reply-turn", "reply-300", counters(300))
      .withDeveloperInput("yes")
      .withResponse("reply-turn", "reply-500", counters(500))
      .please(),
  );

  const options = { ...sources, responses };
  await importUsageHistory(options);
  const first = await deriveUsageTaskSummary(sources.store);
  await importUsageHistory(options);
  const repeated = await deriveUsageTaskSummary(sources.store);
  const { tasks } = await readUsageHistory(sources.store);
  const { observations, associations } = JSON.parse(
    await readFile(responses, "utf8"),
  ) as UsageResponses;

  const firstUsage = first.tasks.find(
    (task) => task.identity === identity,
  )?.usage;
  expect(firstUsage).toMatchObject([
    { root: true, responses: 3, tokens: { output: 900 } },
  ]);
  expect(repeated.tasks).toEqual(first.tasks);
  const launches = Object.values(tasks).filter(
    ({ rootTurnId }) => rootTurnId === "first-turn",
  );
  expect(launches).toHaveLength(1);
  const launch = launches[0];
  expect(launch?.identity).toBe(identity);
  expect(
    Object.values(observations)
      .toSorted((left, right) =>
        left.responseId.localeCompare(right.responseId),
      )
      .map(({ id, responseId }) => [responseId, associations[id]?.taskId]),
  ).toEqual([
    ["first-100", launch?.id],
    ["reply-300", launch?.id],
    ["reply-500", launch?.id],
  ]);
});

test("a Codex worker spawned in the reply turn counts once in the launch", async () => {
  const { rollouts, sources } = await keptLaunch();
  writeCodexSession(
    rollouts,
    replied().withSpawnedAgent("first-worker").please(),
  );
  writeCodexSession(
    rollouts,
    makeMe.aCodexRollout
      .forSession("first-worker")
      .withParent("first")
      .withTurnContext("worker-turn", sol, "xhigh")
      .withResponse("worker-turn", "worker-own", counters(70), {
        rootTurnId: "reply-turn",
      })
      .please(),
  );

  await importUsageHistory(sources);
  const { tasks } = await deriveUsageTaskSummary(sources.store);

  expect(tasks.find((task) => task.identity === identity)?.usage).toMatchObject(
    [
      { root: true, responses: 2, tokens: { output: 400 } },
      { root: false, responses: 1, tokens: { output: 70 } },
    ],
  );
});

test("a reply turn's compaction response, recorded before its turn context, counts at that turn's model", async () => {
  const { rollouts, sources } = await keptLaunch();
  const astra = "gpt-6-astra";
  writeCodexSession(
    rollouts,
    launchTurn()
      .withRow({
        type: "event_msg",
        payload: { type: "task_started", turn_id: "reply-turn" },
      })
      .withResponse("reply-turn", "compaction-300", counters(300))
      .withRow({ type: "compacted", payload: { message: "" } })
      .withTurnContext("reply-turn", astra, "xhigh")
      .withDeveloperInput("yes")
      .please(),
  );

  await importUsageHistory(sources);
  const { tasks } = await deriveUsageTaskSummary(sources.store);
  const usage = tasks.find((task) => task.identity === identity)?.usage;

  expect(usage).toHaveLength(2);
  expect(usage?.find(({ model }) => model === sol)).toMatchObject({
    root: true,
    responses: 1,
    tokens: { output: 100 },
  });
  expect(usage?.find(({ model }) => model === astra)).toMatchObject({
    root: true,
    responses: 1,
    tokens: { output: 300 },
  });
});
