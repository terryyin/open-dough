// Which requests the local launch boundary (../server/agentLaunchPlugin.ts)
// refuses before it starts any `claude`, over raw HTTP in dev and preview:
// another site or Host, an unknown project, an activity or host it does not
// launch, malformed text, a body that is not a JSON launch request, and any
// method but GET and POST; and a read of a project's launch records from
// another site or for an unknown project. The synthetic `claude`
// (./fixtures/fake-claude) records every call, so each refusal proves none was
// made. What an admitted request answers is ./agent-launch-boundary.spec.ts.

import { expect, test } from "@playwright/test";
import {
  identity,
  launch,
  launchRequest,
  title,
} from "./agentLaunchBoundary.ts";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";

for (const mode of ["dev", "preview"] as const) {
  test.describe(`agent launch boundary refusal (${mode} launch mode)`, () => {
    test.describe.configure({ mode: "serial" });
    let server: DashboardServer;

    test.beforeAll(async () => {
      server = await startDashboardServer({
        mode,
        prebuilt: mode === "preview" ? builtDashboardDir : undefined,
        projectFolders: ["open-dough"],
      });
    });

    test.afterAll(async () => {
      await server.close();
    });

    const oversized = "x".repeat(201);
    for (const refused of [
      {
        request: "from another site",
        status: 403,
        headers: { Origin: "http://evil.example" },
      },
      { request: "with no Origin", status: 403, headers: {} },
      {
        request: "a browser marks cross-site",
        status: 403,
        headers: { "Sec-Fetch-Site": "cross-site" },
      },
      // Vite's own host check answers this one first, as plain text.
      {
        request: "naming a foreign Host",
        status: 403,
        headers: { Host: "evil.example", Origin: "http://evil.example" },
        answeredByVite: true,
      },
      {
        request: "for an unknown project",
        status: 404,
        body: { ...launchRequest, source: "not-a-real-project" },
      },
      {
        request: "for preparation",
        status: 400,
        body: { ...launchRequest, activity: "preparation" },
      },
      {
        request: "for Codex",
        status: 400,
        body: { ...launchRequest, host: "codex" },
      },
      {
        request: "for an unknown activity",
        status: 400,
        body: { ...launchRequest, activity: "review" },
      },
      {
        request: "with an empty identity",
        status: 400,
        body: { ...launchRequest, identity: "" },
      },
      {
        request: "with a multi-line identity",
        status: 400,
        body: { ...launchRequest, identity: `${identity}\n--help` },
      },
      {
        request: "with an oversized title",
        status: 400,
        body: { ...launchRequest, title: oversized },
      },
      {
        request: "with a multi-line title",
        status: 400,
        body: { ...launchRequest, title: `${title}\rmore` },
      },
      {
        request: "with an empty title",
        status: 400,
        body: { ...launchRequest, title: "" },
      },
      {
        request: "with an oversized instruction",
        status: 400,
        body: { ...launchRequest, instruction: "x".repeat(4_001) },
      },
      { request: "whose body is not a launch request", status: 400, body: [] },
    ]) {
      test(`refuses a launch request ${refused.request} before starting claude`, async () => {
        server.claudeScenario("launched");
        const callsBefore = server.claudeCalls().length;
        const response = await launch(
          server,
          refused.body ?? launchRequest,
          refused.headers ?? { Origin: server.origin },
        );

        expect(response.status).toBe(refused.status);
        if (refused.answeredByVite !== true) {
          expect(JSON.parse(response.body)).toHaveProperty("error");
        }
        expect(server.claudeCalls()).toHaveLength(callsBefore);
      });
    }

    for (const refused of [
      {
        read: "from another site",
        status: 403,
        headers: { Origin: "http://evil.example" },
      },
      { read: "with no Origin", status: 403, headers: {} },
      {
        read: "a browser marks cross-site",
        status: 403,
        headers: { "Sec-Fetch-Site": "cross-site" },
      },
      {
        read: "for an unknown project",
        status: 404,
        source: "not-a-real-project",
      },
    ]) {
      test(`refuses a launch records read ${refused.read}`, async () => {
        const response = await rawRequest({
          url: `${server.baseURL}${agentLaunchEndpoint}?source=${refused.source ?? "open-dough"}`,
          headers: refused.headers ?? { Origin: server.origin },
        });

        expect(response.status).toBe(refused.status);
        expect(JSON.parse(response.body)).toEqual({
          error: expect.any(String) as unknown,
        });
      });
    }

    test("refuses a launch request that is not JSON before starting claude", async () => {
      const callsBefore = server.claudeCalls().length;
      for (const [contentType, body, status] of [
        ["text/plain", JSON.stringify(launchRequest), 415],
        ["application/json", "{not json", 400],
      ] as const) {
        const response = await rawRequest({
          url: `${server.baseURL}${agentLaunchEndpoint}`,
          method: "POST",
          headers: { "Content-Type": contentType, Origin: server.origin },
          body,
        });
        expect(response.status).toBe(status);
      }
      expect(server.claudeCalls()).toHaveLength(callsBefore);
    });

    for (const method of ["PUT", "DELETE", "PATCH"]) {
      test(`refuses ${method} before starting claude`, async () => {
        const callsBefore = server.claudeCalls().length;
        const response = await rawRequest({
          url: `${server.baseURL}${agentLaunchEndpoint}?source=open-dough`,
          method,
          headers: { Origin: server.origin },
        });

        expect(response.status).toBe(405);
        expect(server.claudeCalls()).toHaveLength(callsBefore);
      });
    }
  });
}
