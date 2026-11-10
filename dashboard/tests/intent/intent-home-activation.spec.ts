// Directly activating Project Intent's CI status tab
// (../../src/IntentPage.tsx, ../../src/intentWorkspaceSelection.ts) or the
// selected story's CI comparison tab (../../src/intentStoryTabs.tsx) returns
// that scope to its CI view. The story's tab judges the selected story's branch
// under its header, while Changed tests keeps the file it read, and a visit
// to Project Intent judges main and browses in a selection of its own; arrow
// keys, Home and End only choose the view, so a file read before Optimization
// Candidates is still selected and read, until CI status itself is activated;
// with a newer revision waiting behind its notice, returning home keeps that
// notice and the shown revision, reading nothing newer.
// Project Intent's landing journey from an entry, folder and file by click,
// Enter and Space: ./intent-ci-status-homepage.spec.ts. Opening a candidate's
// file: ./intent-test-optimization-candidates-open.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  browseSpec,
  openDough,
  openDoughSettings,
  pygardon,
} from "../intentCodeBrowseFixtures.ts";
import {
  activateIntentHome,
  chooseCiStatus,
  ciPanel,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { failing } from "../intentCiStoryBoard.ts";
import {
  expectNamed,
  publishStoryCi,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";
import {
  expectIntentModeChosen,
  intentModeTab,
  openProjectIntent,
  returnToStory,
} from "../intentModePage.ts";
import { chooseStoryTab, expectStoryTab } from "../support/intentStoryPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  revisionNotice,
} from "../intentPerspectivePage.ts";
import { openUntilRead, untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { shortRevision } from "../dashboardParts.ts";
import {
  intentReads,
  jobsFeatures,
  openWithFeatureSelected,
  publishedFiles,
} from "../intentRevisionJourney.ts";
import type { Locator } from "@playwright/test";
import { intentSettingsText } from "../support/intentSettingsFile.ts";

const intentFiles = {
  ".planning/open-dough.json": intentSettingsText(openDoughSettings),
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

test("with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection", async ({
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

  await chooseStoryTab(intent, "Changed tests");
  await selectFile(intent);
  const panel = await activateIntentHome(intent);
  await expectStoryTab(intent, "CI comparison");
  await expectNamed(panel, failing.branch);
  await expect(panel.locator(".intent-ci-story")).toHaveText("Story branch.");
  await expect(panel).not.toContainText(failing.title);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Failed at fa11ed0 (Break the login)",
  );
  await expect(summary).toBeVisible();
  const selected = `SEED-219#${failing.anchor}`;
  await expect(intent).toHaveAttribute("data-selected-story", selected);
  await chooseStoryTab(intent, "Changed tests");
  await expect(fileName(intent)).toHaveAttribute("aria-pressed", "true");

  await test.step("Project Intent judges main and browses the same file in its own selection", async () => {
    await openProjectIntent(intent);
    await expect(intent).toHaveAttribute("data-selected-story", selected);
    await expect(intent.locator(".intent-page-frame")).toHaveAttribute(
      "data-intent-context",
      "project",
    );
    await expect(
      intent.getByRole("region", { name: "Project Intent", exact: true }),
    ).toBeVisible();
    const trunk = ciPanel(intent);
    await expectNamed(trunk, "main");
    await expect(trunk.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login)",
    );
    // Nothing the story's Changed tests selected is selected here.
    await expect(
      intent.locator('.intent-locations [aria-pressed="true"]'),
    ).toHaveCount(0);
    await selectFile(intent);
    await activateIntentHome(intent, "Enter");
    await expect(fileName(intent)).toHaveAttribute("aria-pressed", "false");
    await expectNamed(ciPanel(intent), "main");
  });

  await returnToStory(intent);
  await expectStoryTab(intent, "Changed tests");
  await expect(fileName(intent)).toHaveAttribute("aria-pressed", "true");
  await expect(intent.getByRole("region", { name: "Purpose" })).toBeVisible();
});

test("arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, openDough, intentFiles).serveCi(
    trunkCi(openDough.revision, () => [
      makeMe.aCiRun
        .with({ headSha: judged, conclusion: "success", url: runUrl })
        .please(),
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
      await intentModeTab(intent, "CI status").press(away);
      await expectIntentModeChosen(intent, "Optimization Candidates");
      await expect(candidates).toBeFocused();
      await candidates.press(back);
      await expectIntentModeChosen(intent, "CI status");
      await expect(intentModeTab(intent, "CI status")).toBeFocused();
      await expect(page).toHaveURL(/project=open-dough/);
      await expectFileRead(intent);
    });
  }

  await test.step("clicking CI status from Optimization Candidates returns home", async () => {
    await candidates.click();
    await expectIntentModeChosen(intent, "Optimization Candidates");
    const panel = await activateIntentHome(intent);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expect(fileName(intent)).toHaveAttribute("aria-pressed", "false");
  });
});

test("with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision", async ({
  page,
}) => {
  const files = publishedFiles(jobsFeatures);
  const reads = intentReads(page);
  const { moveTrunk, intent, feature } = await openWithFeatureSelected(
    page,
    files,
  );
  await moveTrunk("eb".repeat(20), files);
  const waiting = `New revision available — showing ${shortRevision(pygardon.revision)}`;
  const notice = revisionNotice(intent);
  await expect(notice).toContainText(waiting);

  await activateIntentHome(intent);
  await expect(feature).toHaveAttribute("aria-pressed", "false");
  await expect(notice).toHaveCount(1);
  await expect(notice).toContainText(waiting);
  await expect(notice.getByRole("button")).toHaveText(["Show latest"]);
  await untilPageReadsAnswered(page);
  expect(reads.filter((read) => read.startsWith("locations@"))).toEqual([
    `locations@${pygardon.revision}`,
  ]);
});
