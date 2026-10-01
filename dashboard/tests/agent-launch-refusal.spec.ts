// Which requests the local launch boundary (../server/agentLaunchPlugin.ts)
// refuses before it starts any session, over raw HTTP in dev and preview:
// another site or Host, an unknown project, a workflow it does not launch
// (including an activity named as one) or an unsupported host,
// malformed text, a body that is not a JSON launch request, and any method but
// GET and POST; and a read of the machine's sessions from another site. The
// synthetic Claude CLI and Codex protocol record every call; the parameterized
// launch refusals prove neither host was called. What an admitted request answers is
// ./agent-launch-boundary.spec.ts.

import { expect, test } from "@playwright/test";
import {
  identity,
  launch,
  launchRequest,
  title,
} from "./agentLaunchBoundary.ts";
import {
  agentAcceptEndpoint,
  agentChangedEndpoint,
  agentLaunchEndpoint,
} from "../src/agentLaunch.ts";
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
      // An activity is not a workflow.
      {
        request: "for preparation",
        status: 400,
        body: { ...launchRequest, workflow: "preparation" },
      },
      {
        request: "for Cursor",
        status: 400,
        body: { ...launchRequest, host: "cursor" },
      },
      {
        request: "for an unknown workflow",
        status: 400,
        body: { ...launchRequest, workflow: "review" },
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
      test(`refuses a launch request ${refused.request} before starting a session`, async () => {
        server.claudeScenario("launched");
        const callsBefore = server.claudeCalls().length;
        const codexCallsBefore = server.codex.calls.length;
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
        expect(server.codex.calls).toHaveLength(codexCallsBefore);
      });
    }

    for (const refused of [
      {
        read: "from another site",
        headers: { Origin: "http://evil.example" },
      },
      { read: "with no Origin", headers: {} },
      {
        read: "a browser marks cross-site",
        headers: { "Sec-Fetch-Site": "cross-site" },
      },
    ]) {
      test(`refuses a read of the machine's sessions ${refused.read}`, async () => {
        const response = await rawRequest({
          url: `${server.baseURL}${agentLaunchEndpoint}`,
          headers: refused.headers,
        });

        expect(response.status).toBe(403);
        expect(JSON.parse(response.body)).toEqual({
          error: expect.any(String) as unknown,
        });
      });
    }

    test("refuses a wait for an attempt from another site, or naming no attempt", async () => {
      const waitFor = (attempt: string, origin: string) =>
        rawRequest({
          url: `${server.baseURL}${agentChangedEndpoint}?attempt=${attempt}`,
          headers: { Origin: origin },
        });
      const attempt = "00000000-0000-4000-8000-000000000000";
      expect((await waitFor(attempt, "http://evil.example")).status).toBe(403);
      expect((await waitFor("not-an-attempt", server.origin)).status).toBe(400);
      // An attempt no server runs is answered at once.
      const answered = await waitFor(attempt, server.origin);
      expect(answered.status).toBe(200);
      expect(JSON.parse(answered.body)).toEqual({ changed: true });
    });

    test("refuses a launch request that is not JSON before starting claude", async () => {
      const callsBefore = server.claudeCalls().length;
      for (const [contentType, body, status] of [
        ["text/plain", JSON.stringify(launchRequest), 415],
        ["application/json", "{not json", 400],
      ] as const) {
        const response = await rawRequest({
          url: `${server.baseURL}${agentAcceptEndpoint}`,
          method: "POST",
          headers: { "Content-Type": contentType, Origin: server.origin },
          body,
        });
        expect(response.status).toBe(status);
      }
      expect(server.claudeCalls()).toHaveLength(callsBefore);
    });

    for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
      test(`refuses ${method} before starting claude`, async () => {
        const callsBefore = server.claudeCalls().length;
        const response = await rawRequest({
          url: `${server.baseURL}${agentLaunchEndpoint}`,
          method,
          headers: { Origin: server.origin },
        });

        expect(response.status).toBe(405);
        expect(server.claudeCalls()).toHaveLength(callsBefore);
      });
    }
  });
}
