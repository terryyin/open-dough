// Incremental Refresh attributes replies and their workers to a kept launch.
import { mkdtemp, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { recordUsageCheck } from "../../server/usageCheck.ts";
import {
  importUsageHistory,
  usageHistorySince,
} from "../../server/usageImport.ts";
import { refreshUsageHistory } from "../../server/usageRefresh.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import {
  keepLaunchRecords,
  keepMoreLaunchRecords,
} from "../../test-support/support/launchStore.ts";
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
  const home = await mkdtemp(path.join(tmpdir(), "token-index-codex-refresh-"));
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  onTestFinished(() => {
    vi.useRealTimers();
  });
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
  writeCodexSession(rollouts, launchTurn().please());
  const sources = {
    home,
    store: path.join(home, "usage.json"),
    codexRoots: [rollouts],
    claudeRoots: [],
  };
  return { rollouts, sources };
}

test("Refresh counts a Codex reply turn read late, the worker it spawns after the last check, each response once", async () => {
  const { rollouts, sources } = await keptLaunch();
  await importUsageHistory({ ...sources, since: usageHistorySince });
  const before = await deriveUsageTaskSummary(sources.store);
  const root = writeCodexSession(
    rollouts,
    replied().withSpawnedAgent("first-worker").please(),
  );
  const repliedAt = new Date("2026-11-14T11:00:00.000Z");
  await utimes(root, repliedAt, repliedAt);
  await recordUsageCheck(sources.store, "2026-11-14T12:00:00.000Z");
  const worker = writeCodexSession(
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

  expect(
    before.tasks.find((task) => task.identity === identity)?.usage,
  ).toMatchObject([{ root: true, responses: 1, tokens: { output: 100 } }]);
  for (const time of ["2026-11-14T13:00:00.000Z", "2026-11-14T14:00:00.000Z"]) {
    const now = new Date(time);
    // The worker's same responses reappear after each check. Its unchanged
    // parent predates the cutoff and must be found through its lineage.
    await utimes(worker, now, now);
    vi.setSystemTime(now);
    await refreshUsageHistory(sources);
    const { tasks } = await deriveUsageTaskSummary(sources.store);

    expect(
      tasks.find((task) => task.identity === identity)?.usage,
    ).toMatchObject([
      { root: true, responses: 2, tokens: { output: 400 } },
      { root: false, responses: 1, tokens: { output: 70 } },
    ]);
  }
});

test("a later typed workflow starts its own attribution when Refresh finds its kept launch", async () => {
  const { rollouts, sources } = await keptLaunch();
  await importUsageHistory({ ...sources, since: usageHistorySince });
  await recordUsageCheck(sources.store, "2026-11-14T12:00:00.000Z");
  const landingTurn = "land-turn";
  const landingInput = "/dough-land";
  const root = writeCodexSession(
    rollouts,
    replied()
      .withTurnContext(landingTurn, sol, "xhigh")
      .withDeveloperInput(landingInput)
      .withResponse(landingTurn, "land-700", counters(700))
      .please(),
  );
  const changedAt = new Date("2026-11-14T13:00:00.000Z");
  await utimes(root, changedAt, changedAt);
  vi.setSystemTime(new Date("2026-11-14T14:00:00.000Z"));

  await refreshUsageHistory(sources);
  const before = await deriveUsageTaskSummary(sources.store);
  const original = [{ root: true, responses: 2, tokens: { output: 400 } }];
  expect(before.tasks).toMatchObject([{ identity, usage: original }]);

  const landing = makeMe.aLaunchRecord
    .adHoc({ title: "Land first story", instruction: landingInput })
    .inCodexSession({ sessionId: "first" })
    .launchedAt(changedAt.toISOString())
    .withFirstInput({ state: "confirmed", turnId: landingTurn })
    .completedWith({})
    .please();
  keepMoreLaunchRecords(sources.home, [landing]);
  const rereadAt = new Date("2026-11-14T15:00:00.000Z");
  await utimes(root, rereadAt, rereadAt);
  vi.setSystemTime(new Date("2026-11-14T16:00:00.000Z"));

  await refreshUsageHistory(sources);
  const after = await deriveUsageTaskSummary(sources.store);

  expect(
    after.tasks.find((task) => task.identity === identity)?.usage,
  ).toMatchObject(original);
  expect(
    after.tasks.find((task) => task.title === landing.request.title),
  ).toMatchObject({
    workflow: "ad-hoc",
    usage: [{ root: true, responses: 1, tokens: { output: 700 } }],
  });
});
