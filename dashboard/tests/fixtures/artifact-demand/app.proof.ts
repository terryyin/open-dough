import { expect, test } from "../../support/pageTest.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../support/dashboardServer.ts";
import { startFrontendAppServer } from "../../support/frontendAppServer.ts";
import { observeArtifactConsumer } from "./observeArtifactConsumer.ts";

async function serve(
  start: () => Promise<{
    baseURL: string;
    outDir: string | undefined;
    close(): Promise<void>;
  }>,
) {
  await observeArtifactConsumer(start, async (server) => {
    const page = await fetch(server.baseURL);
    expect(page.status).toBe(200);
    expect(await page.text()).toMatch(/<script type="module".*\/assets\//);
    return server.outDir;
  });
}

test("serves the app with a static server", async () => {
  await serve(startFrontendAppServer);
});

test("serves the app with a preview server", async () => {
  await serve(() =>
    startDashboardServer({ mode: "preview", prebuilt: sharedDashboardBuild }),
  );
});
