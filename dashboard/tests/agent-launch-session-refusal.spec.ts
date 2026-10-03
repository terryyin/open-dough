// A session policy that cannot be honored is refused at the launch
// boundary before any start or native call, over raw HTTP against the
// project's real installed start and a real bare origin: an installation
// without the shared policy, or default main or automatic landing without
// one-shot tracking.

import { rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { keptStarts, launch } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  oneShot,
  originState,
  requestFor,
  startPreview,
} from "./support/oneShotLaunch.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";

test.describe("a policy the installation or tracking cannot take", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeEach(async () => {
    origin = await startOrigin();
    server = await startPreview(origin);
  });

  test.afterEach(async () => {
    await server.close();
    origin.cleanup();
  });

  const sessionPolicies = async () =>
    (
      JSON.parse(
        (
          await rawRequest({
            url: `${server.baseURL}/__agent-launch`,
            headers: { Origin: server.origin },
          })
        ).body,
      ) as { sessionPolicies: unknown[] }
    ).sessionPolicies;

  test("an installation without the shared session policy is refused before any start or native call", async () => {
    expect(await sessionPolicies()).toEqual(
      expect.arrayContaining([
        { source: "open-dough", workflow: "execution", host: "claude" },
        { source: "open-dough", workflow: "refinement", host: "claude" },
      ]),
    );
    rmSync(
      path.join(
        origin.project,
        ".claude/skills/dough-execute-plan/scripts/session-policy.mjs",
      ),
    );
    expect(await sessionPolicies()).toEqual([]);
    const before = await originState(origin);
    for (const workflow of ["execution", "refinement"] as const) {
      const response = await launch(
        server,
        requestFor(workflow, oneShot("default-checkout", "auto-land")),
      );
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        error: `Default main · One-shot · Automatically land cannot be selected: the installed skills in ~/git/open-dough do not start ${workflow} with a session policy.`,
      });
    }
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(await keptStarts(server)).toEqual([]);
    expect(await originState(origin)).toEqual(before);
  });

  test("default main or automatic landing without one-shot tracking is refused, not ignored", async () => {
    for (const policy of [
      {
        tracking: "standard",
        workspace: "default-checkout",
        landing: "review",
      },
      { tracking: "standard", workspace: "isolated", landing: "auto-land" },
    ] as const) {
      const response = await launch(server, requestFor("execution", policy));
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        error:
          "Default main and Automatically land apply to one-shot sessions; standard tracking publishes through its workflow.",
      });
    }
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(await originState(origin)).toMatchObject({ profiles: [] });
  });
});
