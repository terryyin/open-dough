// Intent's CI status tab (../src/IntentCiStatus.tsx): the third reading tab
// judges the project's trunk with the launch's base-CI rule
// (../server/baseCiJudgment.ts) and names `main`, the state, the judged
// revision, later commits without their own result, the run link, and when
// it was checked. It is offered whether Intent locations are configured,
// absent, or unreadable (SEED-219 examples 1, 9); a cancelled run reads
// Failed here, and every completed conclusion's state is the unit test
// ../../tests/support/dashboard-story-branch-ci.test.mjs. Reading it again,
// the ciAdapter and the read's refusals are in
// ./intent-ci-status-reads.spec.ts; a running head with its nearest
// completed ancestor is in ./intent-ci-status-story.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts } from "./dashboardPage.ts";
import {
  doughnut,
  openDough,
  openDoughSettings,
  pygardon,
  browseSpec,
} from "./intentCodeBrowseFixtures.ts";
import {
  chooseCiStatus,
  expectChecked,
  judged,
  judgmentCalls,
  publishProject,
  runUrl,
  trunkCi,
} from "./intentCiStatusPage.ts";
import { intentModeTab } from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

test("CI status names main, its nearest Passed result, later commits without a result, the run, and when it was checked; the tabs keep their keys", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const published = publishProject(page, openDough, {
    ".planning/open-dough.json": `${openDoughSettings}\n`,
    "dashboard/tests/browse.spec.ts": browseSpec,
  });
  published.serveCi(
    trunkCi(openDough.revision, () => [
      { headSha: judged, conclusion: "success", url: runUrl },
    ]),
  );
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const tabs = intent.getByRole("tablist", { name: "Intent reading" });
  await expect(tabs.getByRole("tab")).toHaveText([
    "Intent",
    "Optimization Candidates",
    "CI status",
  ]);
  await expect(intent.locator(".intent-locations")).toBeVisible();

  const panel = await chooseCiStatus(intent);
  await expect(panel).toBeVisible();
  await expect(intent.locator(".intent-locations")).toBeHidden();
  await expect(
    panel.getByRole("heading", { name: "CI status of main" }),
  ).toBeVisible();
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Passed at a1b2c3d (Add login)",
  );
  await expect(panel).toContainText(
    "2 later commits have no result of their own.",
  );
  await expect(panel.getByRole("link", { name: runUrl })).toHaveAttribute(
    "href",
    runUrl,
  );
  await expectChecked(panel);
  expect(judgmentCalls(published.requests)).toEqual([
    "actions-runs",
    "actions-workflow",
    "commit-list main",
  ]);

  await test.step("arrow keys, Home and End move between the three tabs", async () => {
    const ci = intentModeTab(intent, "CI status");
    await expect(ci).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(intentModeTab(intent, "Intent")).toBeFocused();
    await expect(intentModeTab(intent, "Intent")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(intent.locator(".intent-locations")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(ci).toBeFocused();
    await expect(ci).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(intentModeTab(intent, "Intent")).toBeFocused();
    await page.keyboard.press("End");
    await expect(ci).toBeFocused();
    await expect(ci).toHaveAttribute("aria-selected", "true");
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
  });
});

test("CI status is offered without Intent locations and with unreadable Intent settings; a cancelled run is Failed and no result never reads as passed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, doughnut).serveCi(
    trunkCi(doughnut.revision, () => [
      { headSha: judged, conclusion: "cancelled", url: runUrl },
    ]),
  );
  publishProject(page, pygardon, {
    ".planning/open-dough.json": "{ not json\n",
  }).serveCi(trunkCi(pygardon.revision, () => []));
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  await test.step("no Intent locations: the strip offers CI status beside the explanation", async () => {
    await expect(intent).toContainText(
      "No intent locations are configured for Doughnut.",
    );
    const panel = await chooseCiStatus(intent);
    await expect(
      intent.getByText("No intent locations are configured for Doughnut."),
    ).toBeHidden();
    await expect(
      panel.getByRole("heading", { name: "CI status of main" }),
    ).toBeVisible();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Failed at a1b2c3d (Add login)",
    );
    await expect(panel.getByRole("link", { name: runUrl })).toBeVisible();
    await expectChecked(panel);
    await intentModeTab(intent, "Intent").click();
    await expect(intent).toContainText(
      "No intent locations are configured for Doughnut.",
    );
  });

  await test.step("unreadable Intent settings: CI status still offered; no result is Could not be read", async () => {
    await chooseProject(page, "Pygardon");
    await expect(intent.getByRole("alert")).toContainText("is not valid JSON");
    const panel = await chooseCiStatus(intent);
    await expect(
      panel.getByRole("heading", { name: "CI status of main" }),
    ).toBeVisible();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Could not be read",
    );
    await expect(panel).toContainText(
      "No result of the selected check was found in the readable history",
    );
    await expect(panel).not.toContainText(/passed/i);
    await expectChecked(panel);
  });
});
