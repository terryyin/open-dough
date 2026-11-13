// Retained intent and incomparable later attempts remain honest after restart.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import {
  followUpCards,
  prepareRepeatScenario,
  readFollowUpLedger,
} from "../../tests/support/ciFollowUpScenario.ts";
import { landedCiHistory } from "../../tests/support/landedCiHistory.ts";
test.use({ serverMode: "boundary" });

test("interruption while the provider reply is lost retains intent and reconciles observed evidence without a resend", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  const first = await startServer();
  let release!: () => void;
  const reply = new Promise<void>((resolve) => {
    release = resolve;
  });
  scenario.holdSubmission(() => reply);
  await scenario.ingest(first);
  await expect.poll(() => scenario.repeatCalls.length).toBe(1);
  expect(
    Object.values(readFollowUpLedger(first).landings).find(
      (landing) => landing.request,
    )?.request?.submission.kind,
  ).toBe("intent");
  await first.close();
  release();
  scenario.setRepeat({ seconds: 106 });
  const restarted = await startServer();
  await expect
    .poll(() => followUpCards(restarted))
    .toMatchObject([{ kind: "unverified", repeatMs: 106000 }]);
  expect((await followUpCards(restarted))[0]?.explanation).toContain(
    "acceptance is unverified",
  );
  expect(scenario.repeatCalls).toEqual([71]);
});

for (const unavailable of ["repeat proof", "multiple attempts"] as const) {
  test(`${unavailable} retains specific unverified evidence without inventing recovery`, async ({
    origin,
    github,
    startServer,
  }) => {
    const scenario = await prepareRepeatScenario(origin, github);
    const server = await startServer();
    await scenario.ingest(server);
    await expect.poll(() => scenario.repeatCalls.length).toBe(1);
    if (unavailable === "repeat proof") scenario.repeatProofAvailable(false);
    scenario.setRepeat({
      seconds: 100,
      ...(unavailable === "multiple attempts" ? { attempt: 3 } : {}),
    });
    await expect
      .poll(async () => (await followUpCards(server))[0]?.explanation)
      .toContain(
        unavailable === "repeat proof"
          ? "comparable CI proof is incomplete"
          : "Multiple later attempts",
      );
    expect((await followUpCards(server))[0]?.kind).toBe("unverified");
  });
}

test("new current reference and history eviction cannot rewrite the frozen decision or substitute the faster repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { makeMe } = await import("../../../tests/support/makeMe.mjs");
  const { keepLandedCiHistory } =
    await import("../../tests/support/landedCiHistory.ts");
  const scenario = await prepareRepeatScenario(origin, github, 120);
  const server = await startServer();
  await scenario.ingest(server);
  await expect.poll(() => scenario.repeatCalls.length).toBe(1);
  scenario.setRepeat({ status: "in_progress" });
  await expect
    .poll(() => followUpCards(server))
    .toMatchObject([{ kind: "progress" }]);
  const stored = (
    JSON.parse(
      readFileSync(
        join(server.home, ".open-dough/dashboard/landed-ci-history.json"),
        "utf8",
      ),
    ) as Record<string, ProjectHistory>
  )["open-dough"];
  if (stored?.trunkOrder === undefined)
    throw new Error("Collected history order is missing");
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(stored.trunkOrder);
  for (const [receipt, retained] of Object.entries(stored.landings)) {
    if (retained.observed.kind !== "build") continue;
    const build = stored.builds[retained.observed.build];
    if (build === undefined || build.startedAt === undefined)
      throw new Error("Collected build timing is missing");
    const landing = makeMe.aLaunchLanding
      .comparing({ base: "b".repeat(40), revision: retained.revision })
      .capturedFrom({
        repository: origin.project,
        ...(retained.identity === undefined
          ? {}
          : { identity: retained.identity }),
      })
      .receivedAt(retained.receivedAt)
      .deliveredAs({
        receipt,
        delivery: "00000000-0000-4000-8000-000000000001",
      })
      .please();
    builder.recording(
      landing,
      retained.observed.build,
      makeMe.aKeptBuild
        .with({
          ...build,
          ...(build.runId === 71
            ? {}
            : {
                completedAt: new Date(
                  Date.parse(build.startedAt) + 300000,
                ).toISOString(),
              }),
        })
        .please(),
    );
  }
  await keepLandedCiHistory(server.home, builder.please());
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({ body: { reference: { averageMs: 300000 } } });
  scenario.setRepeat({ seconds: 106 });
  await expect
    .poll(() => followUpCards(server))
    .toMatchObject([
      {
        kind: "slow",
        originalMs: 120000,
        repeatMs: 106000,
        averageMs: 100000,
      },
    ]);
  expect(await landedCiHistory(server)).toMatchObject({
    body: { reference: { selected: { key: "run/71/1", ms: 120000 } } },
  });
  await keepLandedCiHistory(server.home, makeMe.aLandedCiHistory.please());
  expect((await followUpCards(server))[0]).toMatchObject({
    kind: "slow",
    averageMs: 100000,
    originalMs: 120000,
  });
  await server.close();
  const restarted = await startServer();
  await expect
    .poll(() => landedCiHistory(restarted))
    .toMatchObject({
      body: { reference: { selected: { key: "run/71/1", ms: 120000 } } },
    });
  expect((await followUpCards(restarted))[0]).toMatchObject({
    kind: "slow",
    averageMs: 100000,
    repeatMs: 106000,
  });
  expect(scenario.repeatCalls).toEqual([71]);
});
