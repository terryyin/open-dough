// CI status is Intent's homepage (../src/IntentCiStatus.tsx): opening Intent
// with nothing selected fills the reading pane with the judged branch's
// status; the mode strip offers Intent and Optimization Candidates only; a
// file selection then Return to CI status shows it again; not-configured
// locations still show CI status beside the explanation
// (SEED-239#show-ci-status-on-intent-home example 1).

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  browseSpec,
  doughnut,
  openDough,
  openDoughSettings,
} from "./intentCodeBrowseFixtures.ts";
import {
  chooseCiStatus,
  ciPanel,
  expectChecked,
  judged,
  publishProject,
  returnToCiStatus,
  runUrl,
  trunkCi,
} from "./intentCiStatusPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

test("CI status fills Intent's reading with nothing selected; the strip has no CI status mode; return home shows it again; not-configured shows it beside the explanation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, openDough, {
    ".planning/open-dough.json": `${openDoughSettings}\n`,
    "dashboard/tests/browse.spec.ts": browseSpec,
  }).serveCi(
    trunkCi(openDough.revision, () => [
      { headSha: judged, conclusion: "success", url: runUrl },
    ]),
  );
  publishProject(page, doughnut).serveCi(
    trunkCi(doughnut.revision, () => [
      { headSha: judged, conclusion: "success", url: runUrl },
    ]),
  );
  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice, development } = parts(page);
  await intentChoice.click();

  await test.step("nothing selected: CI status fills the reading pane; strip is Intent and Optimization Candidates only", async () => {
    await expect(
      intent.getByRole("tablist", { name: "Intent reading" }).getByRole("tab"),
    ).toHaveText(["Intent", "Optimization Candidates"]);
    const panel = await chooseCiStatus(intent);
    await expect(intent.locator(".intent-locations")).toBeVisible();
    await expect(
      panel.getByRole("heading", { name: "CI status of main" }),
    ).toBeVisible();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expectChecked(panel);
    await expect(intent.getByRole("region", { name: "Purpose" })).toHaveCount(
      0,
    );
  });

  await test.step("select a file, then return home shows CI status again", async () => {
    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    await intent
      .getByRole("button", {
        name: "dashboard/tests/browse.spec.ts",
        exact: true,
      })
      .click();
    await expect(ciPanel(intent)).toHaveCount(0);
    await expect(intent.getByRole("region", { name: "Purpose" })).toBeVisible();
    await expect(
      intent.getByRole("button", { name: "Return to CI status" }),
    ).toBeVisible();
    const panel = await returnToCiStatus(intent);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expect(
      intent.getByRole("button", { name: "Return to CI status" }),
    ).toHaveCount(0);
  });

  await test.step("Development and back shows the CI homepage again", async () => {
    await development.click();
    await expect(intent).toHaveCount(0);
    await intentChoice.click();
    await expect(ciPanel(intent).locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
  });

  await test.step("not-configured: CI status beside the explanation", async () => {
    await page.goto("/?project=doughnut");
    await openUntilRead(page, "/?project=doughnut");
    await intentChoice.click();
    await expect(intent).toContainText(
      "No intent locations are configured for Doughnut.",
    );
    const panel = await chooseCiStatus(intent);
    await expect(
      intent.getByText("No intent locations are configured for Doughnut."),
    ).toBeVisible();
    await expect(
      panel.getByRole("heading", { name: "CI status of main" }),
    ).toBeVisible();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
  });
});
