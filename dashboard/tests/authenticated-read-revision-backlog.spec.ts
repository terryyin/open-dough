// The local authenticated read boundary reading the backlog at a revision
// already resolved (`revision` without `path`, ../server/authenticatedRead.ts),
// tested directly against real HTTP and the synthetic `gh`, not through the
// browser: it never resolves `main` again. Revision checks:
// ./authenticated-read-revision-check.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer";
import { rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";

test.describe("authenticated read boundary backlog at a known revision (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("reads the backlog pinned to the named revision without resolving main", async () => {
    server.setControl({ mode: "normal", revision: revisionA, backlog });
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
        "-H",
        "Accept: application/vnd.github.raw+json",
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
