// Which addition reads the local authenticated read boundary
// (../../server/authenticatedRead.ts) refuses before launching `gh`: an
// addition read (`committed=added`) names only a pinned revision and an agent
// profile path of a catalog project, never an arbitrary record, a traversal,
// a moving ref, a branch, or another repository. What it answers is
// ./authenticated-read-profile-addition.spec.ts; the shared harness is
// ../support/dashboardServer.ts.

import { expect, test } from "../support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import { everyRepository, publishes } from "../support/fakeGitHub.ts";
import { rawRequest } from "../support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const revision = "fa".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const agents = ".planning/agents";

test.describe("authenticated profile addition refusal (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  // An addition read asks which commit added one agent profile, only at a
  // pinned trunk revision and only for a path shaped as a profile: never an
  // arbitrary record, a traversal, a moving ref, or a branch.
  const yuiProfile = encodeURIComponent(`${agents}/yui-chan.json`);
  const onlyProfile = "An addition read names only an agent profile path.";
  for (const refused of [
    {
      read: "at a moving ref instead of a commit sha",
      query: `revision=main&path=${yuiProfile}`,
      error: "The pinned revision is not a commit sha.",
    },
    {
      read: "without a pinned revision",
      query: `path=${yuiProfile}`,
      error: "The pinned revision is not a commit sha.",
    },
    {
      read: "for a record that is not an agent profile",
      query: `revision=${revision}&path=${encodeURIComponent(".planning/PRODUCT-BACKLOG.md")}`,
      error: onlyProfile,
    },
    {
      read: "for a profile-named path that leaves its directory",
      query: `revision=${revision}&path=${encodeURIComponent(".planning/agents/../secrets/yui-chan.json")}`,
      error: onlyProfile,
    },
    {
      read: "combined with a revision check",
      query: `since=${revision}&path=${yuiProfile}`,
      error:
        "An addition read names only a pinned revision and an agent profile path.",
    },
    {
      read: "on a story branch",
      query: `revision=${revision}&branch=story%2Fexample&head=${revision}&path=${yuiProfile}`,
      error:
        "An addition read names only a pinned revision and an agent profile path.",
    },
  ]) {
    test(`refuses an addition read ${refused.read} before launching gh`, async () => {
      server.github.serve(everyRepository, publishes({ revision, backlog }));
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&committed=added&${refused.query}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toMatchObject({ error: refused.error });
      expect(server.ghCalls()).toHaveLength(callsBefore);
    });
  }
  test("refuses an addition read for another repository before launching gh", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${encodeURIComponent("someone/elses-repo")}&committed=added&revision=${revision}&path=${yuiProfile}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(404);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });
});
