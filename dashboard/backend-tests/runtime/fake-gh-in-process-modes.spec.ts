// Real startup profiles reach the ordinary fast default, even with a caller's
// NODE_OPTIONS probe. The API executable is poisoned independently of answers.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../../tests/support/fakeGitHub.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { expect, test } from "../support/fakeGhInProcess.ts";

const revision = "ab".repeat(20);

for (const mode of ["boundary", "dev", "preview"] as const) {
  test(`${mode} uses the default fast owner alongside a custom preload`, async ({
    client,
    // Request worker preparation; this fixture deliberately yields no value.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dashboardPreviewReady: _dashboardPreviewReady,
  }) => {
    expect(client.gh.transport).toBe("in-process");
    client.github.serve(everyRepository, publishes({ revision }));
    const probe = path.join(client.root, "server-probe.mjs");
    const noted = path.join(client.root, "probe-ran");
    writeFileSync(
      probe,
      `import {writeFileSync} from 'node:fs'; writeFileSync(${JSON.stringify(noted)}, 'caller preload ran');`,
    );
    const server = await startDashboardServer({
      mode,
      environment: "development",
      prebuilt: sharedDashboardBuild,
      github: client.github,
      pathPrefix: [client.gh.binDir],
      requestOwnerRoot: client.gh.requestOwnerRoot,
      extraEnv: { NODE_OPTIONS: `--import=${JSON.stringify(probe)}` },
    });
    try {
      const answer = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=open-dough`,
        headers: { Origin: server.origin },
      });
      expect(answer.status).toBe(200);
      expect(JSON.parse(answer.body)).toMatchObject({ revision });
      expect(client.github.calls.length).toBeGreaterThan(0);
      expect(readFileSync(noted, "utf8")).toBe("caller preload ran");
      expect(client.apiLaunched()).toBe(false);
      expect(server.ghPid()).toBeUndefined();
      expect(existsSync(client.gh.pidPath)).toBe(false);
    } finally {
      await server.close();
    }
    expect(client.github.unansweredCalls).toBe(0);
  });
}
