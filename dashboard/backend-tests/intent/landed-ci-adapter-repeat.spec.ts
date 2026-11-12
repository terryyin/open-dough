// Custom CI uses the same real receipt, allowance and saved-reference flow.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { prepareAdapterRepeatScenario } from "../../tests/support/ciFollowUpAdapterScenario.ts";
import {
  followUpCards,
  readFollowUpLedger,
} from "../../tests/support/ciFollowUpScenario.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { retainedHistory } from "../../tests/support/collectedScopeHistory.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";
import { landedCiHistory } from "../../tests/support/landedCiHistory.ts";

test.use({ serverMode: "boundary" });
for (const [seconds, kind, explanation] of [
  [106, "slow", "Possible CI slowdown"],
  [98, "recovered", "CI timing returned to range"],
] as const) {
  test(`a custom105-second landing requests one exact rebuild, progresses, then${seconds} seconds reads ${kind}`, async ({
    origin,
    github,
    startServer,
  }) => {
    const scenario = await prepareAdapterRepeatScenario(origin, github);
    scenario.holdRebuild();
    const server = await startServer();
    await scenario.collectPriors(server);
    if (seconds === 106)
      expect(await scenario.advanceBranch()).not.toBe(scenario.original.sha);
    await scenario.ingest(server);
    await expect
      .poll(() => scenario.adapter.rebuildRequests())
      .toEqual([
        {
          operation: "rebuild",
          check: { repo: "terryyin/open-dough", branch: "main" },
          attempt: {
            runId: scenario.original.runId,
            attemptId: scenario.original.attemptId,
            sha: scenario.original.sha,
          },
        },
      ]);
    expect(
      Object.values(readFollowUpLedger(server).landings).find((l) => l.request)
        ?.request?.submission.kind,
    ).toBe("intent");
    scenario.setRepeat();
    scenario.releaseRebuild();
    await expect
      .poll(() => followUpCards(server))
      .toMatchObject([
        { kind: "progress", explanation: "CI rerun in progress" },
      ]);
    scenario.setRepeat(seconds);
    await expect
      .poll(() => followUpCards(server))
      .toMatchObject([
        {
          kind,
          explanation,
          originalMs: 105000,
          repeatMs: seconds * 1000,
          averageMs: 100000,
        },
      ]);
    expect(scenario.adapter.rebuildRequests()).toHaveLength(1);
    expect(scenario.adapter.proofRequests()).toContainEqual(
      expect.objectContaining({
        attempt: {
          runId: scenario.accepted.runId,
          attemptId: scenario.accepted.attemptId,
          sha: scenario.accepted.sha,
        },
      }),
    );
    expect(scenario.repeatCalls).toEqual([]);
  });
}

test("an adapter-only project finishes collection with its readings and no repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareAdapterRepeatScenario(origin, github, {
    rebuild: false,
  });
  const server = await startServer();
  await scenario.collectPriors(server);
  await scenario.ingest(server);
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: { reference: { selected: { ms: 105000 }, sampleCount: 5 } },
    });
  await server.close();
  await scenario.collectFollowUps(server);
  const history = retainedHistory(server.home);
  if (history === undefined)
    throw new Error("Collected custom history missing");
  const collected = Object.values(history.builds).find(
    (b) => b.revision === scenario.original.sha,
  );
  if (collected?.proof?.kind !== "summary")
    throw new Error("Collected original proof missing");
  const original = makeMe.aKeptBuild
    .with({
      revision: scenario.original.sha,
      state: "pass",
      runId: 71,
      runAttempt: 1,
      startedAt: scenario.original.startedAt,
      completedAt: scenario.original.completedAt,
      proof: makeMe.aCiProof
        .summaryFor(
          { runId: 71, runAttempt: 1, revision: scenario.original.sha },
          collected.proof.summary.entries,
          "terryyin/open-dough",
        )
        .please(),
    })
    .please();
  const key = buildKeyOf(original);
  const earlier = makeMe.aLandedCiHistory.inTrunkOrder([
    ...(history.trunkOrder ?? []),
  ]);
  for (const [receipt, landing] of Object.entries(history.landings)) {
    if (landing.observed.kind !== "build")
      throw new Error("Expected collected build");
    const retained = history.builds[landing.observed.build];
    if (retained === undefined) throw new Error("Expected retained build");
    earlier.recording(
      makeMe.aLaunchLanding
        .comparing({ base: "b".repeat(40), revision: landing.revision })
        .capturedFrom({
          repository: "open-dough",
          ...(landing.identity === undefined
            ? {}
            : { identity: landing.identity }),
        })
        .deliveredAs({ delivery: `historic-${receipt}`, receipt })
        .receivedAt(landing.receivedAt)
        .please(),
      landing.revision === original.revision ? key : landing.observed.build,
      landing.revision === original.revision ? original : retained,
    );
  }
  await scenario.collectFollowUps(server, earlier.please());
  expect(scenario.adapter.rebuildRequests()).toEqual([]);
  expect(scenario.repeatCalls).toEqual([]);
});

test("development follow-up collection with a declared trigger never starts custom CI", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareAdapterRepeatScenario(origin, github, {
    rebuild: false,
  });
  const server = await startServer();
  await scenario.collectPriors(server);
  await scenario.ingest(server);
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: { reference: { selected: { ms: 105000 }, sampleCount: 5 } },
    });
  await server.close();
  scenario.adapter.enableRebuild();
  await scenario.collectFollowUps(server, undefined, "development");
  expect(scenario.adapter.rebuildRequests()).toEqual([]);
  expect(scenario.repeatCalls).toEqual([]);
});
