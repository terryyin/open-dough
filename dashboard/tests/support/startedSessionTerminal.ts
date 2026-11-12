// The terminal of a session a journey started only as its setup. The journey
// does not depend on whether the start presented that terminal: when the page
// shows none once the startup has ended, the session's entry opens it with
// Open terminal, as a developer would. A journey whose promise is the
// presentation itself does not use this.
import { expect, type Locator, type Page } from "@playwright/test";
import { expectQuietAdHocActionsRow } from "../launchStoryCardPage.ts";
import { launchWaitMs } from "./launchWait.ts";

// `entry` is the started session's entry, which may not be listed yet. The
// page ends a startup's progress and presents its terminal together, so
// with the progress gone the panel is there or will not come by itself.
export async function startedSessionTerminal(
  page: Page,
  entry: Locator,
): Promise<Locator> {
  await expect(entry).toHaveCount(1, { timeout: launchWaitMs });
  await expectQuietAdHocActionsRow(page);
  const panel = page.getByRole("region", { name: "Terminal" });
  if ((await panel.count()) === 0) {
    const open = entry.getByRole("button", {
      name: "Open terminal",
      exact: true,
    });
    // Keyboard focus first reveals a paged-out Board column.
    await open.focus();
    await open.click();
  }
  await expect(panel).toHaveCount(1);
  return panel;
}
