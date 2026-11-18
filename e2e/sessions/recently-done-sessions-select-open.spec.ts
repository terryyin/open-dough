// Open on a linked Recently done sessions row attaches the real terminal and
// leaves Recently done for the open list. Intent Select UI lives in
// dashboard/frontend-tests/sessions/recently-done-sessions-select.spec.ts.
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  linked,
  openSelectionPage,
} from "../../dashboard/test-support/recentlyDoneSelectionJourney.ts";
import {
  closeTerminal,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test("Open on a linked Recently done row goes to Development, attaches its terminal, and Close returns focus to its Board entry", async ({
  page,
  dashboard,
}) => {
  const { shown } = await openSelectionPage(page, dashboard);
  const { development, intent } = parts(page);
  await shown.open(linked.title).click();
  const terminal = terminalPanel(page);
  await expect(terminal.getByRole("heading")).toHaveText(linked.title);
  await expect(development).toBeChecked();
  await expect(intent).toHaveCount(0);
  await expect.poll(() => dashboard.claudeAttaches()).toHaveLength(1);
  const reopened = sessionsSidebarParts(page).entry(linked.title);
  await expect(reopened).toHaveAttribute("aria-current", "true");
  await expect(shown.select(linked.title)).toHaveCount(0);
  await closeTerminal(terminal);
  await expect(page.locator(":focus")).toHaveAccessibleName(
    `Execution session for ${linked.title}`,
  );
});
