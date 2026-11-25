// The sender's own URL, not a fixture-built destination, is opened in a real
// page. Published files decide only membership; routing/focus stay production.
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import { expectProjectChoice } from "../../dashboard/test-support/dashboardPage.ts";
import {
  notificationOrigins,
  notifiedIdentity,
  notifiedTitle,
  otherTitle,
} from "../../dashboard/test-support/notificationStoryJourney.ts";
import {
  afterFurtherListings,
  notificationUrls,
} from "../../dashboard/test-support/support/sessionAlerts.ts";
import { dashboardServedIn } from "../../dashboard/test-support/support/sessionAlertServers.ts";

for (const mode of ["dev", "preview"] as const) {
  test.describe(`${mode} on its own ephemeral port`, () => {
    test.use({ dashboard: dashboardServedIn[mode] });

    test("the notification's serving URL reaches its published story without another host action", async ({
      page,
      dashboard,
    }) => {
      await page.setViewportSize({ width: 1440, height: 1100 });
      await notificationOrigins(page);
      const { sessionId: session } = await composeSession(
        dashboard,
        "doughnut",
        {
          identity: notifiedIdentity,
          title: "An old title that no longer identifies the card",
        },
      );
      await afterFurtherListings(dashboard);
      dashboard.claudeSessionBecomes(session, "blocked", "Review this story");
      await expect.poll(() => dashboard.notifierCalls().length).toBe(1);
      const destination = notificationUrls(dashboard)[0];
      expect(destination).toBe(
        `${dashboard.origin}/?project=doughnut&story=SEED-777%23shared-story`,
      );
      expect(new URL(dashboard.origin).port).not.toBe("4173");
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
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
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
