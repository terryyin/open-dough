// The environment a launch runs in, at the local launch boundary
// (../server/agentLaunchPlugin.ts) over raw HTTP, in dev and preview: a server
// started as a deployment's is (./support/launchEnvironment.ts) launches
// Claude Code in the developer's shell environment. What a launch starts and
// keeps is ./agent-launch-boundary.spec.ts. The synthetic `claude`
// (./fixtures/fake-claude) on each server's PATH records every call and its
// environment; the real one is never reached.

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { launch, launchRequest } from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  deploymentLikeStart,
  expectDeveloperShellEnvironment,
  type DeploymentLikeStart,
} from "./support/launchEnvironment.ts";

for (const mode of ["dev", "preview"] as const) {
  const prebuilt = mode === "preview" ? builtDashboardDir : undefined;

  test.describe(`agent launch environment from a deployment's start (${mode} launch mode)`, () => {
    let start: DeploymentLikeStart;
    let server: DashboardServer;

    test.beforeAll(async () => {
      start = deploymentLikeStart(
        mkdtempSync(path.join(tmpdir(), "dough-deployment-")),
      );
      start.create();
      server = await startDashboardServer({
        mode,
        prebuilt,
        projectFolders: ["open-dough"],
        pathPrefix: start.pathPrefix,
        extraEnv: start.extraEnv,
      });
    });

    test.afterAll(async () => {
      await server.close();
      start.remove();
    });

    test("launches Claude Code without the dashboard's start-up additions and with everything else", async () => {
      server.claudeScenario("launched");
      const response = await launch(server, launchRequest);

      expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
      expect(server.claudeLaunchEnvironments()).toHaveLength(1);
      expectDeveloperShellEnvironment(server.claudeLaunchEnvironments()[0]);
    });
  });
}
