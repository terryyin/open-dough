// Coarse Session details for Done rows in Recently done sessions: completion
// identity, not launch age.
import { tapWhereShown } from "./pageLayout.ts";
import {
  doneRecord,
  keepProjectLaunchRecords,
  recentlyDoneParts,
  showThreeProjectPage,
} from "./recentlyDoneSessionsSidebarPage.ts";
import { expect, test } from "./support/cursorStart.ts";
import { launchTouchViewports } from "./touchLaunchPage.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test.describe("touch Session details for Done entries", () => {
  const phone = launchTouchViewports[0]?.portrait ?? {
    width: 390,
    height: 844,
  };
  test.use({ viewport: phone, hasTouch: true });

  test("Session details identifies completion, not launch age", async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(120_000);
    const doneAt = new Date(Date.now() - 2 * 60_000).toISOString();
    const launchedAt = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const title = "Touch done completion age";
    await keepProjectLaunchRecords(dashboard, {
      "open-dough": [
        doneRecord({
          source: "open-dough",
          title,
          sessionId: "touch-done-completion",
          launchedAt,
          doneAt,
          identity: "SEED-902#touch-done",
          workflow: "execution",
        }),
      ],
    });
    await showThreeProjectPage(page, origin);
    const shown = recentlyDoneParts(page);
    await tapWhereShown(shown.button);
    // Section headers are not the coarse Session details control under test.
    await shown.header.click();
    const row = shown.entries.filter({ hasText: title });
    await expect(row).toHaveCount(1);
    await expect(row.locator("time")).toHaveAttribute(
      "aria-label",
      /^Completed \d+m ago$/,
    );
    const disclosure = row.locator("summary", { hasText: "Session details" });
    await expect(disclosure).toBeVisible();
    await tapWhereShown(disclosure);
    const details = row.locator(".sessions-sidebar-session-entry-facts");
    const completedWords = `Completed ${new Date(doneAt).toLocaleString()}`;
    const launchedWords = `Launched ${new Date(launchedAt).toLocaleString()}`;
    await expect(
      details.getByText(completedWords, { exact: true }),
    ).toBeVisible();
    await expect(details.getByText(launchedWords, { exact: true })).toHaveCount(
      0,
    );
    await expect(details.getByText(title, { exact: true })).toBeVisible();
    await expect(
      details.getByText("SEED-902#touch-done", { exact: true }),
    ).toBeVisible();
  });
});
