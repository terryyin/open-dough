// Receipt identity, including legacy retained representations, owns admission.
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
  readFollowUpLedger,
} from "../../tests/support/ciFollowUpScenario.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
} from "../../tests/support/landedCiHistory.ts";
import { postLanding } from "../../tests/support/startSessionLandingCapture.ts";

test.use({ serverMode: "boundary" });

test("an old targetless retained receipt and its new explicit-target alias share the pre-enable exclusion", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  const original = scenario.original;
  if (original.startedAt === undefined || original.completedAt === undefined)
    throw new Error("Missing stated original timing");
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder([
      ...scenario.prior.map((run) => run.headSha),
      original.headSha,
    ])
    .measuredLanding({
      receipt: "00000000-0000-4000-8000-000000000071",
      revision: original.headSha,
      receivedAt: original.startedAt,
      repository: origin.project,
      identity: scenario.identity,
      runId: 71,
      startedAt: original.startedAt,
      completedAt: original.completedAt,
    })
    .proofFor(
      "run/71/1",
      makeMe.aCiProof
        .forRun({ revision: original.headSha, runId: 71 })
        .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
        .please(),
    )
    .please();
  keepLandedCiHistory(path.join(origin.machine, "home"), history);
  const server = await startServer();
  await followUpSettings(server, true);
  await scenario.ingest(server);
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: {
        reference: {
          selected: { key: "run/71/1", ms: 105000 },
          sampleCount: 5,
        },
      },
    });
  const aliases = Object.values(readFollowUpLedger(server).landings).filter(
    (landing) => landing.revision === original.headSha,
  );
  expect(aliases).toHaveLength(1);
  expect(aliases[0]).toMatchObject({
    eligible: false,
    target: "refs/heads/main",
  });
  expect(aliases[0]?.receipts).toHaveLength(2);
  await server.close();
  expect(scenario.repeatCalls).toEqual([]);
});

test("enablement racing immutable receipt ingestion follows the one durable linearization and never acquires a second allowance", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  const server = await startServer();
  const [submission, enabled] = await Promise.all([
    scenario.ingest(server, { prepareOnly: true }),
    followUpSettings(server, true),
  ]);
  expect(enabled.status).toBe(200);
  const receipt = Object.values(readFollowUpLedger(server).landings).find(
    (landing) => landing.revision === scenario.original.headSha,
  );
  expect(receipt).toBeDefined();
  expect((await postLanding(server, submission, false)).status).toBe(200);
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: { reference: { selected: { ms: 105000 }, sampleCount: 5 } },
    });
  if (receipt?.eligible === true)
    await expect.poll(() => scenario.repeatCalls).toEqual([71]);
  await server.close();
  expect(scenario.repeatCalls.length).toBe(receipt?.eligible === true ? 1 : 0);
});
