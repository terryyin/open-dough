// The sender's own URL, not a fixture-built destination, is opened in a real
// page. Published files decide only membership; routing/focus stay production.
import { expect, test as base } from "./dashboardTest.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import {
  notificationOrigins,
  notifiedIdentity,
  notifiedTitle,
  otherTitle,
} from "./notificationStoryJourney.ts";
import {
  afterFurtherListings,
  notificationUrls,
  start,
} from "./support/sessionAlerts.ts";

const test = base.extend<{ deliveryMode: "dev" | "preview" }>({
  deliveryMode: ["preview", { option: true }],
  dashboard: async ({ github, deliveryMode }, use) => {
    const server = await startDashboardServer({
      mode: deliveryMode,
      ...(deliveryMode === "preview" ? { prebuilt: builtDashboardDir } : {}),
      github,
      projectFolders: ["open-dough", "doughnut"],
      alertCheckMs: 100,
    });
    await use(server);
    await server.close();
  },
});

for (const mode of ["dev", "preview"] as const) {
  test.describe(`${mode} on its own ephemeral port`, () => {
    test.use({ deliveryMode: mode });

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
      await expect(
        parts(page).project.getByRole("radio", {
          name: "Doughnut",
          exact: true,
        }),
      ).toBeChecked();
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
