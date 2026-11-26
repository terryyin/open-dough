import { expect, test } from "../../support/pageTest.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../support/dashboardServer.ts";
import { observeArtifactConsumer } from "./observeArtifactConsumer.ts";

async function serve() {
  await observeArtifactConsumer(
    () =>
      startDashboardServer({ mode: "preview", prebuilt: sharedDashboardBuild }),
    async (server) => {
      const page = await fetch(server.baseURL);
      expect(page.status).toBe(200);
      expect(await page.text()).toMatch(/<script type="module".*\/assets\//);
      return server.outDir;
    },
  );
}

test("serves the app with a first preview server", async () => {
  await serve();
});

test("serves the app with a second preview server", async () => {
  await serve();
});
