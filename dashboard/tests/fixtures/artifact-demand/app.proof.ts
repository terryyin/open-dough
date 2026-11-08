import { appendFileSync } from "node:fs";
import { expect, test } from "../../support/pageTest.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../support/dashboardServer.ts";
import { startFrontendAppServer } from "../../support/frontendAppServer.ts";

async function serve(
  start: () => Promise<{
    baseURL: string;
    outDir: string | undefined;
    close(): Promise<void>;
  }>,
) {
  const record = process.env["OPEN_DOUGH_ARTIFACT_PROOF_CONSUMERS"];
  if (record === undefined) throw new Error("Missing consumer record path");
  let server;
  try {
    server = await start();
  } catch (error) {
    appendFileSync(
      record,
      `${JSON.stringify({ pid: process.pid, error: String(error) })}\n`,
    );
    throw error;
  }
  try {
    const page = await fetch(server.baseURL);
    expect(page.status).toBe(200);
    expect(await page.text()).toMatch(/<script type="module".*\/assets\//);
    appendFileSync(
      record,
      `${JSON.stringify({ pid: process.pid, directory: server.outDir })}\n`,
    );
  } finally {
    await server.close();
  }
}

test("serves the app with a static server", async () => {
  await serve(startFrontendAppServer);
});

test("serves the app with a preview server", async () => {
  await serve(() =>
    startDashboardServer({ mode: "preview", prebuilt: sharedDashboardBuild }),
  );
});
