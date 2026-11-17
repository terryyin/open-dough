// The sender's own URL, not a fixture-built destination, is opened in a real
// page. Published files decide only membership; routing/focus stay production.
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";
import type { FakeGitHub } from "../../dashboard/tests/support/fakeGitHub.ts";
import { launchRequest } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { expectProjectChoice } from "../../dashboard/tests/dashboardPage.ts";
import {
  notificationOrigins,
  notifiedIdentity,
  notifiedTitle,
  otherTitle,
} from "../../dashboard/tests/notificationStoryJourney.ts";
import {
  afterFurtherListings,
  notificationUrls,
  start,
} from "../../dashboard/tests/support/sessionAlerts.ts";

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
    projectFolders: ["open-dough", "doughnut"],
    alertCheckMs: 100,
  });
  await use(server);
  await server.close();
}

// Each delivery mode's server waits only for the shared inputs it serves from:
// source serving prepares none; a preview needs the worker's app and bundle.
const dashboardServedIn = {
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

for (const mode of ["dev", "preview"] as const) {
  test.describe(`${mode} on its own ephemeral port`, () => {
    test.use({ dashboard: dashboardServedIn[mode] });

    test("the notification's serving URL reaches its published story without another host action", async ({
      page,
      dashboard,
    }) => {
      await page.setViewportSize({ width: 1440, height: 1100 });
      await notificationOrigins(page);
      const session = await start(dashboard, {
        ...launchRequest,
        source: "doughnut",
        identity: notifiedIdentity,
        title: "An old title that no longer identifies the card",
      });
      await afterFurtherListings(dashboard);
      dashboard.claudeSessionBecomes(session, "blocked", "Review this story");
      await expect.poll(() => dashboard.notifierCalls().length).toBe(1);
      const destination = notificationUrls(dashboard)[0];
      expect(destination).toBe(
        `${dashboard.origin}/?project=doughnut&story=SEED-777%23shared-story`,
      );
      expect(new URL(dashboard.origin).port).not.toBe("4173");
      const before = dashboard.claudeLaunchCalls();
      await page.goto(destination ?? "");
      await expectProjectChoice(page, "Doughnut");
      const card = page.getByRole("article", {
        name: notifiedTitle,
        exact: true,
      });
      await expect(card).toBeFocused();
      await expect(card).toBeInViewport({ ratio: 0.99 });
      await expect(page.getByRole("article", { name: otherTitle })).toHaveCount(
        0,
      );
      expect(dashboard.claudeLaunchCalls()).toEqual(before);
      expect(dashboard.claudeAttaches()).toEqual([]);
      expect(
        dashboard.claudeCalls().filter(({ argv }) => argv.includes("resume")),
      ).toEqual([]);
      expect(
        dashboard.codex.calls.filter(({ method }) =>
          ["thread/start", "thread/resume", "turn/start"].includes(method),
        ),
      ).toEqual([]);
    });
  });
}
