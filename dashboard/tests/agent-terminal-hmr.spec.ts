// The launch boundary's upgrade guard (../server/agentTerminals.ts,
// ../server/agentLaunchAdmission.ts) leaves the dev server's own HMR socket
// working: an upgrade that is not a terminal attachment is not refused. Only
// a real Vite dev server has that socket, so this runs there; the terminal
// upgrades themselves are ./boundary/agent-terminal-boundary.spec.ts.

import WebSocket from "ws";
import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

test.describe("agent terminal upgrade guard beside the dev server", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "dev",
      projectFolders: ["open-dough"],
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("leaves Vite's own HMR socket working", async () => {
    // Without an Origin, Vite's HMR asks for no page token.
    const hmr = new WebSocket(
      server.baseURL.replace(/^http/, "ws"),
      "vite-hmr",
    );
    try {
      const first = await new Promise<string>((resolve, reject) => {
        hmr.once("message", (data: Buffer) => {
          resolve(data.toString("utf8"));
        });
        hmr.once("error", reject);
      });
      expect(JSON.parse(first)).toMatchObject({ type: "connected" });
    } finally {
      hmr.close();
    }
  });
});
