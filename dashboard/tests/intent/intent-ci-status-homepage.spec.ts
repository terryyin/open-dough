// CI status is Intent's homepage (../../src/IntentCiStatus.tsx): opening Intent
// with nothing selected fills the reading pane with the judged branch's
// status; the mode strip offers Intent and Optimization Candidates only;
// with a location, nested folder or file selected there is no return button,
// and directly activating the already chosen Intent tab by click, Enter or
// Space clears that selection and shows it again, keeping the tree open;
// not-configured locations still show CI status beside the explanation
// (SEED-239#show-ci-status-on-intent-home example 1).

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  browseSpec,
  doughnut,
  openDough,
  openDoughSettings,
} from "../intentCodeBrowseFixtures.ts";
import {
  activateIntentHome,
  chooseCiStatus,
  ciPanel,
  expectChecked,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { intentModeTab } from "../intentModePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  intentFolderName,
  intentGroupToggle,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";

test("CI status fills Intent's reading with nothing selected; the strip has no CI status mode; activating Intent again returns home from an entry, folder or file; not-configured shows it beside the explanation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, openDough, {
    ".planning/open-dough.json": `${openDoughSettings}\n`,
    "dashboard/tests/browse.spec.ts": browseSpec,
    "dashboard/tests/nested/deep.spec.ts": browseSpec,
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

  await test.step("entry, nested folder or file selected: no return button; activating the chosen Intent tab by click, Enter or Space returns home with the tree still open", async () => {
    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    const intentTab = intentModeTab(intent, "Intent");
    const selections = [
      {
        name: "the entry",
        select: intentLocationName(intent, "dashboard/tests"),
        reading: intent.getByRole("region", { name: "Summary", exact: true }),
        how: "click",
      },
      {
        name: "a nested folder",
        select: intentFolderName(intent, "nested"),
        reading: intent.getByRole("region", { name: "Summary", exact: true }),
        how: "Enter",
      },
      {
        name: "a test file",
        select: intent.getByRole("button", {
          name: "dashboard/tests/browse.spec.ts",
          exact: true,
        }),
        reading: intent.getByRole("region", { name: "Purpose" }),
        how: "Space",
      },
    ] as const;
    for (const { name, select, reading, how } of selections) {
      await select.click();
      await expect(select, name).toHaveAttribute("aria-pressed", "true");
      await expect(ciPanel(intent), name).toHaveCount(0);
      await expect(reading, name).toBeVisible();
      await expect(
        intent.getByRole("button", { name: /Return to CI status/ }),
        name,
      ).toHaveCount(0);
      await expect(intentTab, name).toHaveAttribute("aria-selected", "true");
      const panel = await activateIntentHome(intent, how);
      await expect(panel.locator(".intent-ci-state"), name).toHaveText(
        "Passed at a1b2c3d (Add login)",
      );
      await expect(reading, name).toHaveCount(0);
      await expect(
        intent.locator('.intent-locations [aria-pressed="true"]'),
        name,
      ).toHaveCount(0);
      await expect(
        intentGroupToggle(intent, "dashboard/tests"),
        name,
      ).toHaveAttribute("aria-expanded", "true");
      await expect(
        intent.getByRole("button", {
          name: "dashboard/tests/nested/deep.spec.ts",
          exact: true,
        }),
        name,
      ).toBeVisible();
    }
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
