// Receipt admission through actual ingestion: a Done receipt gets no repeat
// below the 5% rule, for another story's Taken work, or without complete
// original jobs.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  followUpCards,
  prepareRepeatScenario,
} from "../../tests/support/ciFollowUpScenario.ts";
import { landedCiHistory } from "../../tests/support/landedCiHistory.ts";
test.use({ serverMode: "boundary" });

test("a new104-second Done original is collected with sufficient history without a repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github, 104);
  const server = await startServer();
  await scenario.collectPriors(server);
  await scenario.ingest(server);
  await expect
    .poll(() => landedCiHistory(server))
    .toMatchObject({
      body: {
        reference: {
          selected: { key: "run/71/1", ms: 104000 },
          sampleCount: 5,
        },
      },
    });
  await server.close();
  expect(scenario.repeatCalls).toEqual([]);
});

test("an otherwise eligible receipt for Taken work does not authorize a Done follow-up", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github, 105);
  await origin.takenByAnotherAgent("SEED-B#b");
  const server = await startServer();
  await scenario.collectPriors(server);
  await scenario.ingest(server, { identity: "SEED-B#b" });
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
  await server.close();
  expect(scenario.repeatCalls).toEqual([]);
});

test("an eligible Done receipt whose original jobs are incomplete explains why and requests no repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  scenario.originalJobsAvailable(false);
  const server = await startServer();
  await scenario.collectPriors(server);
  await scenario.ingest(server);
  await expect
    .poll(async () => (await followUpCards(server))[0]?.explanation)
    .toContain("Original exact-attempt jobs are incomplete");
  await server.close();
  expect(scenario.repeatCalls).toEqual([]);
});
