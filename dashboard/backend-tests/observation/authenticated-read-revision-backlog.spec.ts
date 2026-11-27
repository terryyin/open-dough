// The local authenticated read boundary reading the backlog, tested directly
// against real HTTP and the synthetic `gh`, not through the browser: at a
// revision already resolved (`revision` without `path`,
// ../../server/authenticatedRead.ts) it never resolves `main` again. The cold
// membership read is the verified Git trunk
// (../review/verified-origin-trunk.spec.ts). Revision checks:
// ./authenticated-read-revision-check.spec.ts.

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

test.describe.configure({ mode: "serial" });

const revisionB = "b2".repeat(20);
// An empty project's backlog.
const backlog = describedBacklog(makeMe.aRepository.please());

test.describe("authenticated read boundary backlog (development environment)", () => {
  let server: DashboardServer;
  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("reads the backlog pinned to the named revision without resolving main", async () => {
    server.github.serve(
      everyRepository,
      publishes({ revision: revisionB, backlog }),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=pygardon&revision=${revisionB}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(JSON.parse(response.body)).toEqual({ revision: revisionB, backlog });
    expect(server.ghCalls()).toEqual([
      [
        "api",
        "--include",
        "-H",
        "Accept: application/vnd.github.raw",
        `repos/terryyin/pygardon/contents/.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`,
      ],
    ]);
  });

  test("refuses a revision that is not a commit sha before launching gh", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=pygardon&revision=main`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(400);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });
});
