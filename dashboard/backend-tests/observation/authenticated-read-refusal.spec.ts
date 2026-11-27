// Listed-record and Done catalog parameter refusals over HTTP.

import { expect, test } from "../../test-support/support/pageTest.ts";
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
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { describedBacklog } from "../../test-support/describedRevisions.ts";
import { listedReadRefusals } from "./authenticatedReadRefusalCases.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
// An empty project's backlog.
const backlog = describedBacklog(makeMe.aRepository.please());
const published = publishes({ backlog });
const { revision } = published;

test.describe("authenticated read boundary refusal (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    // Cursor operations are outside this spec's proof; use the harness
    // stand-in so setup skips an unused real runner.
    server = await startDashboardServer({
      ...developmentBoundary,
      cursorRunner: "stand-in",
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  // A request refused for its parameters alone answers 400 with the reason,
  // before any `gh` call.
  async function expectRefusedParameters(query: string, error: string) {
    server.github.serve(everyRepository, published);
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&${query}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({ error });
    expect(server.ghCalls()).toHaveLength(callsBefore);
  }

  // A listed records read, or a done catalog read, names only the pinned
  // revision: never another path, never with a revision check or the other
  // listed read, and never a branch name it would resolve itself.
  for (const {
    listed,
    named,
    onlyPinned,
    path,
    combined,
    unpinnedRevision,
  } of listedReadRefusals) {
    for (const refused of [
      {
        read: "that also names a repository path",
        query: `revision=${revision}&path=${encodeURIComponent(path)}`,
        error: onlyPinned,
      },
      { ...combined, error: onlyPinned },
      {
        read: "at a revision that is not a commit sha",
        query: "revision=main",
        error: unpinnedRevision,
      },
    ]) {
      test(`refuses ${listed} ${refused.read} before launching gh`, () =>
        expectRefusedParameters(`${named}&${refused.query}`, refused.error));
    }
  }
});
