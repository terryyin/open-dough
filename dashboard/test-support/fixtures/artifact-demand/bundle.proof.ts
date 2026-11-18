import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../support/pageTest.ts";
import { startDashboardServer } from "../../support/dashboardServer.ts";
import { observeArtifactConsumer } from "./observeArtifactConsumer.ts";

for (const environment of ["development", "production"] as const) {
  test(`starts the ${environment} boundary from the bundle`, async () => {
    await observeArtifactConsumer(
      () => startDashboardServer({ mode: "boundary", environment }),
      async (server) => {
        expect((await fetch(server.baseURL)).status).toBe(404);
        const directory = server.serverBundle ?? "";
        expect(existsSync(path.join(directory, "runnerMain.mjs"))).toBe(true);
        return directory;
      },
    );
  });
}
