// Recently done reads the outcome actually collected from provider attempts.
import { expect, test } from "../support/preparationPage.ts";
import { recheckingLandedCi } from "../support/landedCiHistory.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
} from "../support/ciFollowUpScenario.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { settings, projectRow, back } from "../support/systemSettingsPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";

test.use({ extraEnv: recheckingLandedCi });

test("machine setting defaults off and a real collected full repeat gives a red textual Done warning and saved totals on a phone", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: scenario.story.completion,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  scenario.serve();
  await page.clock.install();
  await page.goto(dashboard.baseURL);
  await settings(page).click();
  const project = projectRow(page, "Open Dough");
  await expect(project).toContainText("Automatic CI follow-up: Off");
  await project
    .getByRole("button", {
      name: "Enable automatic CI follow-up on this machine",
    })
    .click();
  await expect(project).toContainText("Automatic CI follow-up: On");
  await expect(project).toContainText(
    "Provisional rule: repeat once at or above 5%",
  );
  await scenario.ingest(dashboard);
  await expect.poll(() => scenario.repeatCalls.length).toBe(1);
  scenario.setRepeat({ status: "queued" });
  await expect
    .poll(() => followUpSettings(dashboard))
    .toMatchObject({ body: { cards: [{ kind: "progress" }] } });
  await back(page).click();
  await page.clock.runFor(15000);
  const card = page.getByRole("article", { name: "Story A", exact: true });
  await expect(card).toContainText("CI rerun in progress");
  scenario.setRepeat({ seconds: 106 });
  await expect
    .poll(() => followUpSettings(dashboard))
    .toMatchObject({ body: { cards: [{ kind: "slow" }] } });
  await page.clock.runFor(15000);
  await expect(card).toContainText("Possible CI slowdown");
  const warning = card.getByLabel("CI timing follow-up");
  await expect(warning).toHaveCSS("color", "rgb(220, 38, 38)");
  await expect(warning).toContainText("Original 1 min 45 s");
  await expect(warning).toContainText("Repeat 1 min 46 s");
  await expect(warning).toContainText("Saved average 1 min 40 s");
  await expect(warning).toContainText(
    "does not prove a regression or its cause",
  );
  await expect(card).toContainText("Done");
  await page.setViewportSize({ width: 390, height: 844 });
  await warning.scrollIntoViewIfNeeded();
  await expect(warning).toBeVisible();
  await expectNoSidewaysScrollIn(page, card);
  expect(scenario.repeatCalls).toEqual([71]);
});
