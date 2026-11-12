// What a phone reads of automatic CI follow-up with no receipt journey: the
// machine's setting in Settings, and in Recently done the card of a landing
// the machine keeps with an accepted rerun request
// (../support/ciFollowUpPageLanding.ts), as the page's collecting dashboard
// saves what the provider's repeat becomes.
import { expect, test } from "../support/preparationPage.ts";
import { recheckingLandedCi } from "../support/landedCiHistory.ts";
import { keepRepeatLandingForPage } from "../support/ciFollowUpPageLanding.ts";
import {
  rerunRuns,
  savedRepeatRequest,
} from "../support/ciFollowUpSavedRequests.ts";
import { settings, projectRow } from "../support/systemSettingsPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import {
  ciFollowUpWarning,
  expectWholeOnPhone,
  shownCiFollowUpCard,
} from "../support/ciFollowUpReadingPage.ts";

test.use({
  extraEnv: recheckingLandedCi,
  viewport: { width: 390, height: 844 },
});

test("automatic CI follow-up is off on a machine until its user enables it in Settings, then on with the provisional rule", async ({
  page,
  dashboard,
}) => {
  await page.goto(dashboard.baseURL);
  await settings(page).click();
  const project = projectRow(page, "Open Dough");
  await expect(project, "off until enabled").toContainText(
    "Automatic CI follow-up: Off",
  );
  await project
    .getByRole("button", {
      name: "Enable automatic CI follow-up on this machine",
    })
    .click();
  await expect(project, "on once enabled").toContainText(
    "Automatic CI follow-up: On",
  );
  await expect(project, "provisional rule").toContainText(
    "Provisional rule: repeat once at or above 5%",
  );
});

test("a kept accepted request reads its repeat in progress, then at 106 seconds a red textual Done warning with the 105 second original and 100 second average on a phone", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  // Story A, published as completed, whose run 71 first passed in 105 s
  // against five prior builds of 100 s each, its rerun request accepted; the
  // provider answers for that run over the page's own reads of the
  // repository.
  const kept = await keepRepeatLandingForPage(page, origin, github, {
    stage: "accepted request",
    run: 71,
    seconds: 105,
    averageSeconds: 100,
  });
  const saved = () => savedRepeatRequest(dashboard, 71)?.outcome;
  kept.provider(71).setRepeat({ status: "in_progress" });
  await expect.poll(() => saved()?.kind, "progress saved").toBe("progress");
  await page.clock.install();
  await page.goto(dashboard.baseURL);
  const card = await shownCiFollowUpCard(page, "Story A");
  await expect(card, "progress card").toContainText("CI rerun in progress");
  kept.provider(71).setRepeat({ seconds: 106 });
  // The pass that reads the finished repeat settles the request.
  await expect.poll(() => saved()?.settled, "repeat saved").toBe(true);
  // The page reads its cards again at its own pace.
  await page.clock.runFor(15000);
  await expect(card, "slow card").toContainText("Possible CI slowdown");
  const warning = ciFollowUpWarning(card);
  await expect(warning, "red warning").toHaveCSS("color", "rgb(220, 38, 38)");
  await expect(warning, "original").toContainText("Original 1 min 45 s");
  await expect(warning, "repeat").toContainText("Repeat 1 min 46 s");
  await expect(warning, "saved average").toContainText(
    "Saved average 1 min 40 s",
  );
  await expect(warning, "caution").toContainText(
    "does not prove a regression or its cause",
  );
  await expect(card, "Done").toContainText("Done");
  await expectWholeOnPhone(warning, "warning");
  await expectNoSidewaysScrollIn(page, card);
  expect(rerunRuns(github), "no rerun request").toEqual([]);
});
