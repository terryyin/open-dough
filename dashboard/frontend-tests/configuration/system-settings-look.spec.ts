// System settings in the frame's look, against controlled settings answers:
// each setting group is a headed region in one shared column, its text
// readable and its controls recognisable, and the page and its project
// dialogs fit a narrow window, phone touch reading and 200% zoom without
// sideways scrolling. Open Dough's mark leads the page's name at each width.

import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import type { FrontendServiceState } from "../../test-support/support/frontendServiceState.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../test-support/support/frontendSettingsSubstitutes.ts";
import {
  back,
  settings,
} from "../../test-support/support/systemSettingsPage.ts";
import { themeChoice } from "../../test-support/support/terminalThemeSettingsPage.ts";
import {
  expectControlContrast,
  expectReadableAndRecognisable,
  expectReadableContrast,
} from "../../test-support/accessibleReading.ts";
import {
  box,
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
  tapWhereShown,
} from "../../test-support/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../test-support/touchLaunchPage.ts";
import { expectProductMark } from "../../test-support/productMark.ts";
import { expectProjectChoice } from "../../test-support/dashboardPage.ts";
import { readSetting } from "../../test-support/support/settingsTouchPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const settingGroups = ["Projects", "OpenAI", "Terminal theme"];

// Every piece of text a reader reads, and every control, in one area.
const settingsArea = {
  texts: "h2, h3, p, dt, dd, label, [role='alert']",
  controls: "button, input, select",
  hasControls: true,
};

async function openSettings(page: Page, services: FrontendServiceState) {
  await installFrontendSettingsSubstitutes(page, services, {
    projects: productionSeedProjects,
  });
  await page.goto("/?view=settings");
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("API key:", { exact: false })).toBeVisible();
  await expect(themeChoice(page)).toBeEnabled();
}

test("each setting group is a headed region in one column, with readable text and recognisable controls", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openSettings(page, frontendServices);
  await expectProductMark(page.getByRole("main"));
  await expectControlContrast(back(page));
  await expectReadableContrast(back(page));
  const regions = settingGroups.map((name) =>
    page.getByRole("region", { name, exact: true }),
  );
  for (const name of settingGroups) {
    const region = page.getByRole("region", { name, exact: true });
    await expect(
      region.getByRole("heading", { level: 2, name, exact: true }),
    ).toBeVisible();
    await expectReadableAndRecognisable(region, settingsArea);
  }
  // A further group drops in as one more region in the same column.
  const [projects, ...others] = await Promise.all(regions.map(box));
  for (const other of others) {
    expect(other.x).toBeCloseTo(projects?.x ?? Number.NaN, 0);
    expect(other.width).toBeCloseTo(projects?.width ?? Number.NaN, 0);
  }
});

test("settings and its project dialogs fit a 420 pixel window without sideways scrolling", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 420, height: 900 });
  await openSettings(page, frontendServices);
  await expectProductMark(page.getByRole("main"));
  await expect(back(page)).toBeInViewport({ ratio: 1 });
  await expectNoSidewaysScrollAndWholeText(page);

  await page.getByRole("button", { name: "Add project", exact: true }).click();
  const add = page.getByRole("dialog", { name: "Add project", exact: true });
  await expect(add.getByRole("textbox", { name: "GitHub URL" })).toBeFocused();
  await expectReadableAndRecognisable(add, settingsArea);
  await expect(add).toBeInViewport({ ratio: 1 });
  expect(
    await page.evaluate(
      "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
    ),
  ).toBe(true);
  await add.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(add).toBeHidden();

  await page
    .getByRole("button", { name: "Remove project Doughnut", exact: true })
    .click();
  const remove = page.getByRole("dialog", {
    name: "Remove Doughnut?",
    exact: true,
  });
  await expect(remove.getByRole("button", { name: "Cancel" })).toBeFocused();
  await expectReadableAndRecognisable(remove, settingsArea);
  await expect(remove).toBeInViewport({ ratio: 1 });
  await remove.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(remove).toBeHidden();
  await expectNoSidewaysScrollAndWholeText(page);
});

test("long configured facts reflow at narrow width and 200 percent zoom with keyboard return", async ({
  page,
  frontendServices,
}, testInfo) => {
  const localPath = `/Users/developer/${"long-checkout-directory/".repeat(10)}project`;
  await installFrontendSettingsSubstitutes(page, frontendServices, {
    projects: [
      makeMe.aConfiguredProject
        .with({
          id: "long-project",
          label: "Long Project",
          repository: `example/${"long-repository-name-".repeat(8)}project`,
          localPath,
        })
        .please(),
    ],
  });
  await page.goto("/");
  await settings(page).focus();
  await page.keyboard.press("Enter");
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.getByRole("listitem")).toContainText(localPath);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("settings-narrow.png"),
    fullPage: true,
  });
  // CSS zoom doubles every rendered dimension; 720 physical pixels leave the
  // same 360 CSS-pixel reading width as a 200% browser zoom.
  await page.setViewportSize({ width: 720, height: 1000 });
  await page.addStyleTag({ content: "html { zoom: 2; }" });
  await expect(page.getByRole("listitem")).toContainText(localPath);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("settings-narrow-200-percent.png"),
    fullPage: true,
  });
  await back(page).focus();
  await page.keyboard.press("Enter");
  await expect(settings(page)).toBeFocused();
});

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} settings reading`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch reads host-local groups and returns from the last group after rotation", async ({
    page,
    frontendServices,
  }) => {
    const [first] = productionSeedProjects;
    if (first === undefined) throw new Error("No project is configured.");
    await installFrontendSettingsSubstitutes(page, frontendServices, {
      projects: productionSeedProjects,
      clientConfigurations: { [first.id]: { status: "unreadable" } },
    });
    const changes: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "GET")
        changes.push(new URL(request.url()).pathname);
    });
    await page.goto("/?project=doughnut&view=roster");
    await tapWhereShown(settings(page));
    await expect(
      page.getByRole("heading", { name: "System settings", exact: true }),
    ).toBeFocused();
    await expectProductMark(page.getByRole("main"));
    const projects = page.getByRole("region", {
      name: "Projects",
      exact: true,
    });
    const firstRow = projects.getByRole("listitem").first();
    for (const fact of await firstRow.locator("h3, dt, dd").all())
      await readSetting(fact);
    await expect(firstRow.getByRole("heading", { level: 3 })).toHaveText(
      first.label,
    );
    await expect(firstRow.locator("dd")).toHaveText([
      first.repository,
      first.localPath,
      "The Client configuration could not be read from this project's local checkout.",
    ]);
    await expect(
      projects.getByText(
        "Configure projects for this dashboard on this machine.",
      ),
    ).toBeVisible();
    const openai = page.getByRole("region", { name: "OpenAI", exact: true });
    await readSetting(openai.getByRole("status"));
    await expect(openai.getByRole("status")).toHaveText(
      "API key: Not configured",
    );
    const theme = page.getByRole("region", {
      name: "Terminal theme",
      exact: true,
    });
    await readSetting(theme.getByRole("heading", { level: 2 }));
    await readSetting(theme.locator(".settings-note:not([role='status'])"));
    await readSetting(theme.getByRole("figure").locator("pre"));
    await expect(theme.getByRole("figure")).toContainText("All checks passed.");
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
    for (const view of [landscape, portrait]) {
      await page.setViewportSize(view);
      await readSetting(theme.getByRole("heading", { level: 2 }));
      await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
    }
    // Back is the settings view's Close. Its current target stays reachable
    // while reading the final group; tapping it must not scroll the page first.
    await tapWhereShown(back(page));
    await expect(
      page.getByRole("heading", { name: "Agent roster", exact: true }),
    ).toBeVisible();
    await expectProjectChoice(page, "Doughnut");
    await expect(settings(page)).toBeFocused();
    expect(changes).toEqual([]);
  });
});
