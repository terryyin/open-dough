import { expect, test } from "../../dashboardTest.ts";

// Opens the page its own preview server serves, which starts that server's
// Cursor runner, and passes.
test("opens the dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
