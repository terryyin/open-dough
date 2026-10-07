// Temporary probe for SEED-115#retain-cancelled-ci-evidence: a failure that
// completes before the shortened deadline, so its shard's kept report must
// hold its trace and error context. The next commit removes it.
import { expect, test } from "./support/pageTest.ts";

test("deadline probe fails before the deadline", async ({ page }) => {
  await page.setContent("<p>deadline probe</p>");
  await expect(page.getByText("deadline probe"), "deliberate").toHaveCount(2, {
    timeout: 1_000,
  });
});
