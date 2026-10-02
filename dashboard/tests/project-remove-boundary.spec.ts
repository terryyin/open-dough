import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";

for (const mode of ["dev", "preview"] as const) {
  test(`remove protects the local boundary, writes only configuration and projects no local paths (${mode})`, async () => {
    const server = await startDashboardServer({
      mode,
      prebuilt: builtDashboardDir,
    });
    try {
      const file = path.join(
        server.home,
        ".open-dough/dashboard",
        `projects-${mode === "dev" ? "development" : "production"}.json`,
      );
      const before = readFileSync(file, "utf8");
      const url = `${server.baseURL}/__project-configuration/remove`;
      const body = JSON.stringify({ id: "open-dough" });
      for (const headers of [
        { Origin: "http://other.example" },
        { "Sec-Fetch-Site": "cross-site" },
        { Origin: server.origin, Host: "other.example" },
        {},
      ]) {
        expect(
          (await rawRequest({ url, method: "POST", headers, body })).status,
        ).toBe(403);
      }
      const headers = {
        Origin: server.origin,
        "Content-Type": "application/json",
      };
      for (const method of ["GET", "PUT", "DELETE"])
        expect((await rawRequest({ url, method, headers })).status).toBe(405);
      expect(
        (
          await rawRequest({
            url,
            method: "POST",
            headers,
            body: JSON.stringify({ id: "absent" }),
          })
        ).status,
      ).toBe(404);
      expect(
        (await rawRequest({ url, method: "POST", headers, body: "{}" })).status,
      ).toBe(400);
      expect(
        (
          await rawRequest({
            url,
            method: "POST",
            headers: { Origin: server.origin },
            body,
          })
        ).status,
      ).toBe(415);
      expect(readFileSync(file, "utf8")).toBe(before);
      const removed = await rawRequest({ url, method: "POST", headers, body });
      expect(removed.status).toBe(200);
      expect(removed.headers["cache-control"]).toBe("no-store");
      const answer = JSON.parse(removed.body) as {
        projects: Record<string, unknown>[];
      };
      expect(answer.projects.map((project) => project["id"])).toEqual([
        "doughnut",
        "pygardon",
        "terry-talks",
      ]);
      for (const project of answer.projects)
        expect(Object.keys(project).sort()).toEqual([
          "backlogPath",
          "id",
          "label",
          "ref",
          "repository",
        ]);
      expect(
        (JSON.parse(readFileSync(file, "utf8")) as { id: string }[]).map(
          ({ id }) => id,
        ),
      ).toEqual(["doughnut", "pygardon", "terry-talks"]);
      expect(server.ghCalls()).toEqual([]);
      expect(server.claudeCalls()).toEqual([]);
    } finally {
      await server.close();
    }
  });
}
