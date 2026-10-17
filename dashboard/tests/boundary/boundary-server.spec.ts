// What every boundary spec here starts: the local boundaries alone, run by
// Node from ../../server/boundaryServer.ts, without Vite or a build.
import { execFileSync } from "node:child_process";
import { test, expect } from "../support/pageTest.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { boundaryServerCommand } from "../support/serverAddress.ts";
import { rawRequest } from "../support/rawHttp.ts";

test("a boundary-mode server is the Node entry alone, naming no Vite and serving no page", async () => {
  const server = await startDashboardServer({ mode: "boundary" });
  try {
    const command = execFileSync(
      "ps",
      ["-o", "command=", "-p", String(server.pid)],
      {
        encoding: "utf8",
      },
    ).trim();
    expect(command).toBe(
      [
        boundaryServerCommand.command,
        ...boundaryServerCommand.args,
        "--port",
        "0",
      ].join(" "),
    );
    expect(server.output()).not.toMatch(/vite/i);
    expect(server.outDir).toBeUndefined();
    expect(
      (await rawRequest({ url: `${server.baseURL}/`, method: "GET" })).status,
    ).toBe(404);
  } finally {
    await server.close();
  }
});
