// Returning to Intent's CI status homepage by directly activating the Intent
// reading tab (../src/IntentModeTabs.tsx, ../src/intentWorkspaceSelection.ts):
// with a selected story it clears the browsing selection and the homepage
// still judges that story's branch with its summary kept; arrow keys, Home
// and End only choose the mode, so a file read before Optimization
// Candidates is still selected and read, until Intent itself is activated
// (SEED-243#improve-intent-home-and-selection-summaries examples 4 and 7).
// The homepage journey from an entry, folder and file by click, Enter and
// Space: ./intent-ci-status-homepage.spec.ts. Opening a candidate's file:
// ./intent-test-optimization-candidates-open.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  browseSpec,
  openDough,
  openDoughSettings,
} from "./intentCodeBrowseFixtures.ts";
import {
  activateIntentHome,
  chooseCiStatus,
  ciPanel,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "./intentCiStatusPage.ts";
import { failing } from "./intentCiStoryBoard.ts";
import {
  expectNamed,
  publishStoryCi,
  toggleOnDevelopment,
} from "./intentCiStoryRecords.ts";
import { expectIntentModeChosen, intentModeTab } from "./intentModePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { Locator } from "@playwright/test";

const intentFiles = {
  ".planning/open-dough.json": `${openDoughSettings}\n`,
  "dashboard/tests/browse.spec.ts": browseSpec,
};

function fileName(intent: Locator) {
  return intent.getByRole("button", {
    name: "dashboard/tests/browse.spec.ts",
    exact: true,
  });
}

async function selectFile(intent: Locator) {
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  await fileName(intent).click();
  await expectFileRead(intent);
}

async function expectFileRead(intent: Locator) {
  await expect(fileName(intent)).toHaveAttribute("aria-pressed", "true");
  await expect(intent.getByRole("region", { name: "Purpose" })).toBeVisible();
  await expect(ciPanel(intent)).toHaveCount(0);
}

test("activating Intent with a story selected returns home judging that story's branch, keeping its summary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishStoryCi(page, intentFiles);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  await chooseCiStatus(intent);
  const before = await toggleOnDevelopment(page, failing.title);
  await expectNamed(before, failing.branch);
  const summary = intent.getByRole("region", {
    name: "Selected story",
    exact: true,
  });
  await expect(summary).toBeVisible();

  await selectFile(intent);
  const panel = await activateIntentHome(intent);
  await expectNamed(panel, failing.branch);
  await expect(panel).toContainText(`Story branch of ${failing.title}.`);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Failed at fa11ed0 (Break the login)",
  );
  await expect(summary).toBeVisible();
  await expect(intent).toHaveAttribute(
    "data-selected-story",
    `SEED-219#${failing.anchor}`,
  );
  await expect(fileName(intent)).toHaveAttribute("aria-pressed", "false");
});

test("arrow keys, Home and End choose Intent again with the file still read; activating Intent from Optimization Candidates returns home", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, openDough, intentFiles).serveCi(
    trunkCi(openDough.revision, () => [
      { headSha: judged, conclusion: "success", url: runUrl },
    ]),
  );
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  await chooseCiStatus(intent);
  await selectFile(intent);
  const candidates = intentModeTab(intent, "Optimization Candidates");

  for (const [away, back] of [
    ["ArrowRight", "ArrowLeft"],
    ["End", "Home"],
    ["ArrowLeft", "ArrowRight"],
  ] as const) {
    await test.step(`${away} then ${back}`, async () => {
      await intentModeTab(intent, "Intent").press(away);
      await expectIntentModeChosen(intent, "Optimization Candidates");
      await expect(candidates).toBeFocused();
      await candidates.press(back);
      await expectIntentModeChosen(intent, "Intent");
      await expect(intentModeTab(intent, "Intent")).toBeFocused();
      await expect(page).toHaveURL(/project=open-dough/);
      await expectFileRead(intent);
    });
  }

  await test.step("clicking Intent from Optimization Candidates returns home", async () => {
    await candidates.click();
    await expectIntentModeChosen(intent, "Optimization Candidates");
    const panel = await activateIntentHome(intent);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expect(fileName(intent)).toHaveAttribute("aria-pressed", "false");
  });
});
