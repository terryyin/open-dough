import { test } from "../../dashboardTest.ts";

// Times out while one of its page's requests is still held, so the page's
// teardown waits on that handler past its own timeout and Playwright ends the
// worker before the dashboard server's teardown runs.
test("times out holding a request", async ({ page }) => {
  let reached: () => void = () => {};
  const held = new Promise<void>((resolve) => {
    reached = resolve;
  });
  await page.route("**/held-forever", () => {
    reached();
    return new Promise(() => {});
  });
  await page.goto("/");
  void page.evaluate(() => fetch("/held-forever")).catch(() => {});
  await held;
  await new Promise(() => {});
});
