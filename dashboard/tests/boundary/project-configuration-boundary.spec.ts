import { expect, test } from "../support/pageTest.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { rawRequest } from "../support/rawHttp.ts";

test("project list stays local and omits checkout paths", async () => {
  const server = await startDashboardServer({ mode: "boundary" });
  try {
    const url = `${server.baseURL}/__project-configuration`;
    const response = await rawRequest({
      url,
      headers: { "Sec-Fetch-Site": "same-origin" },
    });
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    const projects = JSON.parse(response.body) as Record<string, unknown>[];
    expect(projects.map((project) => project["id"])).toEqual([
      "open-dough",
      "doughnut",
      "pygardon",
      "terry-talks",
    ]);
    for (const project of projects) {
      expect(Object.keys(project).sort()).toEqual([
        "backlogPath",
        "id",
        "label",
        "ref",
        "repository",
      ]);
    }
    for (const headers of [
      { Origin: "http://other.example" },
      { "Sec-Fetch-Site": "cross-site" },
      { Origin: server.origin, Host: "other.example" },
      {},
    ]) {
      expect((await rawRequest({ url, headers })).status).toBe(403);
    }
    expect(
      (
        await rawRequest({
          url,
          method: "POST",
          headers: { Origin: server.origin },
        })
      ).status,
    ).toBe(405);
    expect(server.ghCalls()).toEqual([]);
    expect(server.claudeCalls()).toEqual([]);
  } finally {
    await server.close();
  }
});
