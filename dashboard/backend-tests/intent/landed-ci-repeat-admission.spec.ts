// Default-off authority and new-receipt boundary through actual ingestion.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
} from "../../tests/support/ciFollowUpScenario.ts";
import { landedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { postLanding } from "../../tests/support/startSessionLandingCapture.ts";
test.use({ serverMode: "boundary" });

test("eligible105-second receipt prepared before enablement stays old after acceptance", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github, 105);
  const server = await startServer();
  await scenario.collectPriors(server);
  const submission = await scenario.ingest(server, { prepareOnly: true });
  await followUpSettings(server, true);
  expect((await postLanding(server, submission, false)).status).toBe(200);
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

test("a new104-second Done original is collected with sufficient history without a repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github, 104);
  const server = await startServer();
  await scenario.collectPriors(server);
  await followUpSettings(server, true);
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
  await followUpSettings(server, true);
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

test("an unspent eligible receipt disabled while original jobs are unavailable stays old on re-enable", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  scenario.originalJobsAvailable(false);
  const server = await startServer();
  await scenario.collectPriors(server);
  await followUpSettings(server, true);
  await scenario.ingest(server);
  await expect
    .poll(
      async () => (await followUpSettings(server)).body.cards[0]?.explanation,
    )
    .toContain("Original exact-attempt jobs are incomplete");
  expect(scenario.repeatCalls).toEqual([]);
  await followUpSettings(server, false);
  scenario.originalJobsAvailable(true);
  await followUpSettings(server, true);
  const reader = await startServer();
  expect((await followUpSettings(reader)).body.enabled).toBe(true);
  await reader.close();
  await server.close();
  expect(scenario.repeatCalls).toEqual([]);
});

test("development mode and unsupported providers retain reading but cannot enable automatic actions", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  const development = await startServer({ environment: "development" });
  expect((await followUpSettings(development)).body).toMatchObject({
    enabled: false,
    available: false,
    explanation:
      "Development dashboards have no automatic CI action authority.",
  });
  expect((await followUpSettings(development, true)).status).toBe(409);
  await development.close();
  const { writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { makeMe } = await import("../../../tests/support/makeMe.mjs");
  const configuration = makeMe.aRepository
    .withRevision("adapter", {
      files: {
        ".planning/open-dough.json": JSON.stringify(
          makeMe.projectCiSettings
            .with({ ciAdapter: ["node", "provider.mjs"] })
            .please(),
        ),
      },
    })
    .please().revisions[0];
  const text = configuration.files?.[".planning/open-dough.json"];
  if (text === undefined) throw new Error("Missing adapter configuration fact");
  writeFileSync(join(origin.project, ".planning/open-dough.json"), text);
  const production = await startServer();
  expect((await followUpSettings(production)).body).toMatchObject({
    available: false,
    explanation:
      "Automatic CI follow-up is unavailable for this provider; existing CI reading remains available.",
  });
  expect((await followUpSettings(production, true)).status).toBe(409);
  expect(scenario.repeatCalls).toEqual([]);
});
