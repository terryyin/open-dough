// Intent settings problems retain classified transient eligibility, while
// location-listing failures keep the common whole-read response.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  backlog,
  featurePath,
  featureText,
  knownSourceId,
  settings,
  settingsPath,
} from "../../test-support/intentLocationsBoundaryFixtures.ts";
import {
  httpErrorAnswer,
  noConnection,
} from "../../test-support/originAnswers.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
} from "../../test-support/support/fakeGitHub.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { intentSettingsText } from "../../test-support/support/intentSettingsFile.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated Intent locations problems (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("answers malformed and unreadable settings distinctly from not-configured", async () => {
    const published = publishes({
      backlog,
      files: { [settingsPath]: "{not json\n" },
    });
    const { revision: malformedRevision } = published;
    server.github.serve(everyRepository, published);
    const malformed = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${malformedRevision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(malformed.status).toBe(200);
    expect(JSON.parse(malformed.body)).toEqual({
      revision: malformedRevision,
      locations: null,
      settingsProblem: "malformed",
    });

    const unreadableSettings = publishes({
      backlog,
      files: { [settingsPath]: "{}\n" },
    });
    const { revision: unreadableRevision } = unreadableSettings;
    server.github.serve(everyRepository, async (call) => {
      if (
        call.request.kind === "content" &&
        call.request.path === settingsPath
      ) {
        return noConnection;
      }
      return unreadableSettings(call);
    });
    const unreadable = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${unreadableRevision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(unreadable.status).toBe(200);
    expect(JSON.parse(unreadable.body)).toEqual({
      revision: unreadableRevision,
      locations: null,
      settingsProblem: "unreadable",
      recovery: "transient",
    });
  });

  test("keeps an unmarked settings refusal and a classified whole-read listing failure distinct", async () => {
    const refused = publishes({
      backlog,
      files: { [settingsPath]: intentSettingsText(settings) },
    });
    const listing = publishes({
      backlog,
      files: {
        [settingsPath]: intentSettingsText(settings),
        [featurePath]: featureText,
      },
    });
    const refusedRevision = refused.revision;
    const listingRevision = listing.revision;
    server.github.serve(everyRepository, (call) => {
      const { request } = call;
      if (request.kind === "content" && request.path === settingsPath) {
        return request.revision === refusedRevision
          ? Promise.resolve(httpErrorAnswer(403))
          : listing(call);
      }
      if (request.kind === "tree" && request.path === "e2e_test/features") {
        return Promise.resolve(httpErrorAnswer(503));
      }
      return refused(call);
    });

    const settingsResponse = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${refusedRevision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(settingsResponse.status).toBe(200);
    expect(JSON.parse(settingsResponse.body)).toEqual({
      revision: refusedRevision,
      locations: null,
      settingsProblem: "unreadable",
    });

    const listingResponse = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${listingRevision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(listingResponse.status).toBe(502);
    expect(JSON.parse(listingResponse.body)).toEqual({
      error: `GitHub answered HTTP 503 to the local GitHub CLI while reading e2e_test/features at ${listingRevision}.`,
      recovery: "transient",
    });
  });
});
