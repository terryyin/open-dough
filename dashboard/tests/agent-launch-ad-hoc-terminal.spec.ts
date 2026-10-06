// A confirmed ad hoc launch opens its session in the page's terminal at once,
// on the committed origin of ./agent-launch-card.spec.ts (./launchJourney.ts):
// the keyboard is in the terminal, its toolbar names the label, "Ad hoc
// session" and the session id, what is typed reaches the session, a polite
// status says it started, the session's entry and sidebar entry show it, and
// the page does not scroll. Close detaches only and returns the keyboard to
// Start session. The synthetic `claude` (./fixtures/fake-claude) echoes what
// is typed; the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog, startSessionField } from "./launchCardPage.ts";
import { parts, sessionNamedBy } from "./dashboardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

for (const text of ["why is the CI slow on main?", ""]) {
  test(`starting ${text === "" ? "with an empty field" : "with text"} opens the session in the terminal with the keyboard in it, and Close returns the keyboard to Start session`, async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    await openTakenBacklog(page, journey);
    const button = page.getByRole("button", {
      name: "Start session in Open Dough",
    });
    const dialog = page.getByRole("dialog", {
      name: "Start a session in Open Dough in Claude Code",
    });
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    const { recentlyDone } = parts(page);

    await page.evaluate(() => {
      window.scrollTo(0, 40);
    });
    await button.click();
    await expect(dialog).toBeVisible();
    // Where the page is once the dialog is open; the launch does not move it.
    const scroll = await page.evaluate(() => window.scrollY);
    if (text !== "") {
      await startSessionField(dialog).fill(text);
    }
    await dialog.getByRole("button", { name: "Start" }).click();

    const entry = recentlyDone.getByRole("article");
    await expect(entry).toHaveCount(1);
    const sessionId = await sessionNamedBy(entry);
    const title = await entry.getByRole("heading", { level: 3 }).textContent();
    await expect(panel).toHaveCount(1);
    await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
      title ?? "",
    );
    await expect(panel).toContainText(`Ad hoc session ${sessionId}`);
    await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
    await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
    await page.keyboard.type("hello there");
    await page.keyboard.press("Enter");
    await expect(rows).toContainText("echo hello there");

    // A log is an implicitly polite live region that is neither a `status`
    // nor the page's `[aria-live='polite']` published-read announcement.
    const announcement = page
      .getByRole("log")
      .filter({ hasText: "Ad hoc session started" });
    await expect(announcement).toBeVisible();
    await expect(entry).toContainText("Shown in terminal");
    expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    const { button: sessions, entries } = sidebarParts(page);
    await sessions.click();
    await expect(entries.first().getByRole("button")).toHaveAttribute(
      "aria-current",
      "true",
    );

    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(entry).not.toContainText("Shown in terminal");
    await expect(
      entry.getByRole("button", { name: "Open terminal" }),
    ).toBeVisible();
    expect(dashboard.claudeAttaches().map((attach) => attach.id)).toEqual([
      sessionId.slice(0, 8),
    ]);
  });
}
