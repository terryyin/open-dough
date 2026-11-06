// Intent settings problems retain classified transient eligibility, while
// location-listing failures keep the common whole-read response.

import { expect, test } from "../tests/support/pageTest.ts";
import {
  backlog,
  featurePath,
  featureText,
  knownSourceId,
  revisionOf,
  settings,
  settingsPath,
} from "../tests/intentLocationsBoundaryFixtures.ts";
import { httpErrorAnswer, noConnection } from "../tests/originAnswers.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../tests/support/fakeGitHub.ts";
import { rawRequest } from "../tests/support/rawHttp.ts";

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
    const malformedRevision = revisionOf("a5");
    server.github.serve(
      everyRepository,
      publishes({
        revision: malformedRevision,
        backlog,
        files: { [settingsPath]: "{not json\n" },
      }),
    );
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

    const unreadableRevision = revisionOf("a6");
    const published = publishes({
      revision: unreadableRevision,
      backlog,
      files: { [settingsPath]: "{}\n" },
    });
    server.github.serve(everyRepository, async (call) => {
      if (
        call.request.kind === "content" &&
        call.request.path === settingsPath
      ) {
        return noConnection;
      }
      return published(call);
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
    const refusedRevision = revisionOf("a7");
    const listingRevision = revisionOf("a8");
    const refused = publishes({
      revision: refusedRevision,
      backlog,
      files: { [settingsPath]: settings },
    });
    const listing = publishes({
      revision: listingRevision,
      backlog,
      files: { [settingsPath]: settings, [featurePath]: featureText },
    });
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
