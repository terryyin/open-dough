// This browser keeps Intent's reader layout, tabs or Side by side
// (../src/IntentBrowser.tsx), as one disposable preference for every project:
// it lasts across perspective switches, reloads and later visits, while the
// chosen Purpose or Proof tab does not. Where the browser keeps none, keeps an
// unusable one or refuses storage, Intent starts with tabs and a choice lasts
// for the page, without error. Side by side itself is
// `./intent-purpose-proof-side-by-side.spec.ts`. Each test's browser context
// keeps its own storage.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts, shortRevision } from "./dashboardPage.ts";
import { watchPageErrors } from "./pageErrors.ts";
import { openUntilRead, reloadUntilRead } from "./pageRequestNotes.ts";
import { expandIntentGroup } from "./intentPerspectivePage.ts";
import {
  chooseReadingTab,
  expectSideBySide,
  readingTab,
  sideBySideToggle,
} from "./intentFileReadingPage.ts";
import {
  doughnut,
  publishIntentProject,
  pygardon,
} from "./intentCodeBrowseFixtures.ts";
import type { Project } from "./catalogProjectRecords.ts";
import {
  featurePath,
  publishedFeature,
  runFiles,
  settings,
} from "./intentCucumberProofFixtures.ts";

const layoutKey = "open-dough.intent.layout";

// Two projects whose Intent reads the same feature and its proof.
async function publishTwoProjects(page: Page) {
  for (const project of [pygardon, doughnut]) {
    await publishIntentProject(page, project, settings, {
      [featurePath]: publishedFeature,
      ...runFiles,
    });
  }
}

async function openIntent(page: Page, project: Project = pygardon) {
  const address = `/?project=${project.repository.split("/")[1]}&perspective=intent`;
  await openUntilRead(page, address);
  await expect(sideBySideToggle(parts(page).intent)).toBeVisible();
}

// Select the feature, unless it is selected, and wait for its source.
async function selectFeature(intent: Locator) {
  await expandIntentGroup(intent, "e2e_test/features");
  const file = intent.getByRole("button", { name: featurePath, exact: true });
  if ((await file.getAttribute("aria-pressed")) !== "true") await file.click();
  await expect(file).toHaveAttribute("aria-pressed", "true");
  await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
    "Feature: Jobs",
  );
}

// Tabs, with `tab` chosen and its region the one shown.
async function expectTabs(intent: Locator, tab: "Purpose" | "Proof") {
  await expect(sideBySideToggle(intent)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(readingTab(intent, tab)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    intent.getByRole("region", { name: tab, exact: true }),
  ).toBeVisible();
}

async function switchToDevelopmentAndBack(page: Page) {
  const { development, intentChoice, intent } = parts(page);
  await development.click();
  await expect(intent).toHaveCount(0);
  await intentChoice.click();
  await expect(sideBySideToggle(intent)).toBeVisible();
}

async function chooseProject(page: Page, project: Project) {
  await parts(page)
    .project.getByRole("radio", { name: project.label, exact: true })
    .check();
  await expect(page).toHaveURL(
    new RegExp(`project=${project.repository.split("/")[1]}`),
  );
  // The project's own source names its revision.
  const { intent } = parts(page);
  await selectFeature(intent);
  await expect(intent).toContainText(
    `at revision ${shortRevision(project.revision)}`,
  );
}

test("Side by side is kept across perspective switches, reloads, later visits and projects, and the chosen tab is not", async ({
  page,
}) => {
  await publishTwoProjects(page);
  await openIntent(page);
  const { intent } = parts(page);

  await test.step("with nothing kept, Intent starts with tabs on Purpose", async () => {
    await expectTabs(intent, "Purpose");
  });

  await test.step("on, Development and back keeps Side by side", async () => {
    await selectFeature(intent);
    await sideBySideToggle(intent).click();
    await expectSideBySide(intent);
    await switchToDevelopmentAndBack(page);
    await expectSideBySide(intent);
  });

  await test.step("a reload and a later visit in this browser keep it", async () => {
    await reloadUntilRead(page);
    await expectSideBySide(intent);
    const later = await page.context().newPage();
    await openIntent(later);
    await expectSideBySide(parts(later).intent);
    await later.close();
  });

  await test.step("another project's Intent opens side by side, under one browser-wide key", async () => {
    await chooseProject(page, doughnut);
    await expectSideBySide(intent);
    const kept = await page.evaluate(() =>
      Object.entries(window.localStorage).filter(([key]) =>
        key.startsWith("open-dough.intent"),
      ),
    );
    expect(kept).toEqual([[layoutKey, "side-by-side"]]);
  });

  await test.step("off with Proof chosen, a reload shows tabs on Purpose in every project", async () => {
    await sideBySideToggle(intent).click();
    await chooseReadingTab(intent, "Proof");
    await reloadUntilRead(page);
    await expectTabs(intent, "Purpose");
    await chooseProject(page, pygardon);
    await expectTabs(intent, "Purpose");
  });

  await test.step("the chosen tab is not kept across leaving Intent either", async () => {
    await chooseReadingTab(intent, "Proof");
    await switchToDevelopmentAndBack(page);
    await expectTabs(intent, "Purpose");
  });
});

test("an unusable kept layout starts with tabs, and the next choice is kept", async ({
  page,
}) => {
  const errors = watchPageErrors(page);
  await publishTwoProjects(page);
  await page.addInitScript((key) => {
    if (window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, "sideways");
    }
  }, layoutKey);
  await openIntent(page);
  const { intent } = parts(page);
  await expectTabs(intent, "Purpose");
  await sideBySideToggle(intent).click();
  await expectSideBySide(intent);
  await reloadUntilRead(page);
  await expectSideBySide(intent);
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, Intent starts with tabs and Side by side lasts for the page without error", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const refused = () => {
      throw new DOMException("Storage is refused.", "SecurityError");
    };
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: refused,
    });
  });
  const errors = watchPageErrors(page);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await publishTwoProjects(page);
  await openIntent(page);
  const { intent } = parts(page);
  await expectTabs(intent, "Purpose");

  await sideBySideToggle(intent).click();
  await expectSideBySide(intent);
  await switchToDevelopmentAndBack(page);
  await expectSideBySide(intent);
  await chooseProject(page, doughnut);
  await expectSideBySide(intent);

  await reloadUntilRead(page);
  await expectTabs(intent, "Purpose");
  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
