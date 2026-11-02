// Real authenticated pinned reads preserve one project-owned command or skill.
// Malformed generation instructions never discard the location or its proof.

import { expect, test } from "../support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import { everyRepository, publishes } from "../support/fakeGitHub.ts";
import { rawRequest } from "../support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const settingsPath = ".planning/open-dough.json";
const locationPath = "features";
const featurePath = `${locationPath}/one.feature`;
const proofPath = "proof";
const command = "RECORD_CUCUMBER_PROOF=1 npm run test:e2e";
const skill = "record-feature-proof";

test.describe("authenticated Intent proof generation", () => {
  let server: DashboardServer;
  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });
  test.afterAll(async () => {
    await server.close();
  });

  for (const [at, generation, expected] of [
    [1, { command }, { proofGeneration: { command } }],
    [2, { skill }, { proofGeneration: { skill } }],
    [3, undefined, {}],
    [4, { command, skill }, { proofGenerationProblem: "malformed" }],
    [5, { command: "  " }, { proofGenerationProblem: "malformed" }],
    [6, "npm run test:e2e", { proofGenerationProblem: "malformed" }],
  ] as const) {
    test(`generation declaration ${String(at)} preserves readable proof`, async () => {
      const revision = `a${String(at)}`.repeat(20);
      server.github.serve(
        everyRepository,
        publishes({
          revision,
          backlog: "# Product backlog\n\n## Taken\n\n## Backlog list\n",
          files: {
            [settingsPath]: JSON.stringify({
              intent: {
                locations: [
                  {
                    path: locationPath,
                    kind: "gherkin",
                    proof: proofPath,
                    ...(generation === undefined
                      ? {}
                      : { proofGeneration: generation }),
                  },
                ],
              },
            }),
            [featurePath]: "Feature: One\n  Scenario: Run one\n",
            [`${proofPath}/latest.json`]: JSON.stringify({
              version: 1,
              observations: [],
            }),
          },
        }),
      );
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=open-dough&revision=${revision}&intent=locations`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        revision,
        locations: [
          {
            path: locationPath,
            files: [featurePath],
            proof: { path: proofPath, observations: [] },
            ...expected,
          },
        ],
      });
      const location = (
        JSON.parse(response.body) as { locations: Record<string, unknown>[] }
      ).locations[0];
      if (generation === undefined)
        expect(location).not.toHaveProperty("proofGeneration");
      if ("proofGenerationProblem" in expected)
        expect(location).not.toHaveProperty("proofGeneration");
    });
  }
});
