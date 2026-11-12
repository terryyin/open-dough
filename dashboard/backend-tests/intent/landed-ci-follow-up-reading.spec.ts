// Collection/classification is observed before reading fixtures or restart.
import { writeFileSync } from "node:fs";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  followUpCards,
  followUpFile,
  prepareRepeatScenario,
  readFollowUpLedger,
} from "../../tests/support/ciFollowUpScenario.ts";
import {
  landedCiHistory,
  restartAsLandedCiReader,
  keepLandedCiHistory,
} from "../../tests/support/landedCiHistory.ts";
import {
  passedFrom,
  trunkRun,
  trunkActions,
  usableProofOf,
} from "../../tests/support/landedCiTrunk.ts";
import { keepMoreLaunchRecords } from "../../tests/support/launchStore.ts";
import { pull } from "../../tests/support/storyReviewTrunkCommits.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";

test.use({ serverMode: "boundary" });

async function retained(
  server: DashboardServer,
  identity: string,
  revision: string,
) {
  const params = new URLSearchParams({ id: "open-dough", identity, revision });
  const response = await rawRequest({
    url: `${server.origin}/__project-configuration/ci-follow-up?${params}`,
    headers: { Origin: server.origin },
  });
  return {
    status: response.status,
    body: JSON.parse(response.body) as unknown,
  };
}

test("a subsequent landing considers original 120 seconds once, excludes that actual slow outlier, and never samples the 100-second repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github, 120);
  const server = await startServer();
  await scenario.ingest(server);
  await expect.poll(() => scenario.repeatCalls.length).toBe(1);
  scenario.setRepeat({ seconds: 100 });
  await expect
    .poll(() => followUpCards(server))
    .toMatchObject([{ kind: "recovered" }]);
  pull(origin.project);
  const next = await origin.publishRevision({
    message: "A newer publication for the same story",
    files: { "next.txt": "new work\n" },
  });
  const run = trunkRun(
    next,
    80,
    passedFrom("2026-11-10T08:00:00.000Z", 110000),
  );
  const answer = trunkActions([run], { 80: usableProofOf(run) });
  const prior = github.serve(
    "terryyin/open-dough",
    async (call) =>
      answer(call.argv, next) ??
      prior?.(call) ?? {
        status: 404,
        contentType: "text/plain",
        body: "Not found",
      },
  );
  keepMoreLaunchRecords(server, [
    makeMe.aLaunchRecord
      .executing({ identity: scenario.identity, title: "Story A" })
      .launchedAt("2026-11-10T08:00:00.000Z")
      .landedAt(next, { receipt: "88888888-0000-4000-8000-000000000080" })
      .please(),
  ]);
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: {
        reference: {
          endpoint: next,
          selected: { key: "run/80/1", ms: 110000 },
          averageMs: 100000,
          evidence: expect.arrayContaining([
            {
              key: "run/71/1",
              date: scenario.original.startedAt,
              ms: 120000,
              status: "excluded",
              reason: "Slow outlier: more than 15% above the median",
            },
          ]),
        },
      },
    });
  const history = JSON.stringify((await landedCiHistory(server)).body);
  expect(history).not.toContain("run/71/2");
  const summary = await followUpCards(server);
  expect(summary).toHaveLength(1);
  expect(summary[0]).toMatchObject({
    revision: scenario.story.completion,
    originalMs: 120000,
    repeatMs: 100000,
  });
  expect(summary[0]).not.toHaveProperty("repeat");
  expect(scenario.repeatCalls).toEqual([71]);
});

test("saved samples, exclusions and workflow survive window eviction and a newer same-identity record", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(
    origin,
    github,
    120,
    [100, 100, 100, 100, 100, 116],
  );
  const server = await startServer();
  await scenario.ingest(server);
  await expect.poll(() => scenario.repeatCalls.length).toBe(1);
  scenario.setRepeat({ seconds: 100 });
  await expect
    .poll(() => followUpCards(server))
    .toMatchObject([{ kind: "recovered" }]);
  const before = await retained(
    server,
    scenario.identity,
    scenario.story.completion,
  );
  pull(origin.project);
  const newer = await origin.publishRevision({
    message: "Later publication",
    files: { "later.txt": "same story identity, different landing\n" },
  });
  await server.close();
  const ledger = readFollowUpLedger(server);
  const original = Object.values(ledger.landings).find(
    (landing) => landing.request !== undefined,
  );
  if (original?.request === undefined)
    throw new Error("Collected repeat request missing");
  const request = original.request;
  // These canonical snapshots are reading inputs, not collection/classification proof.
  ledger.landings["newer-reading-input"] = makeMe.aCiFollowUpEntry
    .with({
      ...original,
      revision: newer,
      request: makeMe.aCiRepeatRequest
        .with({
          ...request,
          workflow: "other.yml",
          workflowId: 9000,
          original: { ...request.original, revision: newer },
          reference: {
            ...request.reference,
            endpoint: newer,
            averageMs: 300000,
          },
        })
        .please(),
    })
    .please();
  ledger.landings = Object.fromEntries(
    Object.entries(ledger.landings).reverse(),
  );
  writeFileSync(followUpFile(server), JSON.stringify(ledger));
  await keepLandedCiHistory(server.home, makeMe.aLandedCiHistory.please());
  const reader = await restartAsLandedCiReader(server, origin, "boundary");
  try {
    const calls = github.calls.filter(({ request }) =>
      request.kind.startsWith("actions-"),
    ).length;
    expect(await followUpCards(reader)).toEqual([
      expect.objectContaining({
        revision: scenario.story.completion,
        averageMs: 100000,
        originalMs: 120000,
        repeatMs: 100000,
        kind: "recovered",
      }),
    ]);
    const reading = await retained(
      reader,
      scenario.identity,
      scenario.story.completion,
    );
    expect(reading).toMatchObject({
      status: 200,
      body: {
        workflow: "ci.yml",
        workflowId: 7001,
        original: { runId: 71, runAttempt: 1, ms: 120000 },
        repeat: { runId: 71, runAttempt: 2, ms: 100000 },
        reference: {
          averageMs: 100000,
          evidence: expect.arrayContaining([
            {
              key: "run/6/1",
              date: "2026-11-10T05:00:00.000Z",
              ms: 116000,
              status: "excluded",
              reason: "Slow outlier: more than 15% above the median",
            },
          ]),
        },
      },
    });
    expect(before).toMatchObject({
      status: 200,
      body: { kind: "recovered", reference: { averageMs: 100000 } },
    });
    expect((await retained(reader, scenario.identity, newer)).status).toBe(404);
    expect(
      github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
    ).toHaveLength(calls);
  } finally {
    await reader.close();
  }
});
