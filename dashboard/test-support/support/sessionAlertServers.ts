// The dashboard server a session-alert notification journey serves from, in
// each delivery mode. Each mode waits only for the shared inputs it serves
// from: source serving prepares none; a preview needs the worker's app and
// bundle. The development mode's demand is proved by
// ../../backend-tests/runtime/test-preparation-boundary.spec.ts.
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";

type UseDashboard = (server: DashboardServer) => Promise<void>;

async function serveAlerts(
  github: FakeGitHub,
  mode: "dev" | "preview",
  use: UseDashboard,
) {
  const server = await startDashboardServer({
    mode,
    ...(mode === "preview" ? { prebuilt: sharedDashboardBuild } : {}),
    github,
    alertCheckMs: 100,
  });
  await use(server);
  await server.close();
}

export const dashboardServedIn = {
  dev: ({ github }: { github: FakeGitHub }, use: UseDashboard) =>
    serveAlerts(github, "dev", use),
  preview: async (
    {
      dashboardPreviewReady,
      github,
    }: { dashboardPreviewReady: undefined; github: FakeGitHub },
    use: UseDashboard,
  ) => {
    await Promise.resolve(dashboardPreviewReady);
    await serveAlerts(github, "preview", use);
  },
};
