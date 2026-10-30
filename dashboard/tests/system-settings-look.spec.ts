// System settings in the frame's look: each setting group is a headed region
// in one shared column, its text readable and its controls recognisable, and
// the page and its project dialogs fit a narrow window without sideways
// scrolling. Open Dough's mark leads the page's name at each width.

import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expect, test } from "./support/pageTest.ts";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { back, settings } from "./support/systemSettingsPage.ts";
import { themeChoice } from "./support/terminalThemeSettingsPage.ts";
import {
  expectControlContrast,
  expectReadableAndRecognisable,
  expectReadableContrast,
} from "./accessibleReading.ts";
import {
  box,
  expectNoSidewaysScrollAndWholeText,
  tapWhereShown,
} from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { expectProductMark } from "./productMark.ts";
import { readSetting } from "./support/settingsTouchPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const settingGroups = ["Projects", "OpenAI", "Terminal theme"];

// Every piece of text a reader reads, and every control, in one area.
const settingsArea = {
  texts: "h2, h3, p, dt, dd, label, [role='alert']",
  controls: "button, input, select",
  hasControls: true,
};

async function openSettings(page: Page) {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("API key:", { exact: false })).toBeVisible();
  await expect(themeChoice(page)).toBeEnabled();
}

test("each setting group is a headed region in one column, with readable text and recognisable controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openSettings(page);
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
}) => {
  await page.setViewportSize({ width: 420, height: 900 });
  await openSettings(page);
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

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} settings reading`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch reads host-local groups and returns from the last group after rotation", async ({
    page,
  }) => {
    const server = await fixture.start("preview");
    await page.goto(`${server.baseURL}/?project=doughnut&view=roster`);
    await tapWhereShown(settings(page));
    await expect(
      page.getByRole("heading", { name: "System settings", exact: true }),
    ).toBeFocused();
    await expectProductMark(page.getByRole("main"));
    const projects = page.getByRole("region", {
      name: "Projects",
      exact: true,
    });
    const first = projects.getByRole("listitem").first();
    for (const fact of await first.locator("h3, dt, dd").all())
      await readSetting(fact);
    const configured = JSON.parse(
      readFileSync(fixture.configurationFile("preview"), "utf8"),
    ) as { label: string; repository: string; localPath: string }[];
    await expect(first.getByRole("heading", { level: 3 })).toHaveText(
      configured[0]?.label ?? "",
    );
    await expect(first.locator("dd")).toHaveText([
      configured[0]?.repository ?? "",
      configured[0]?.localPath ?? "",
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
    await expectNoSidewaysScrollAndWholeText(page);
    for (const view of [landscape, portrait]) {
      await page.setViewportSize(view);
      await readSetting(theme.getByRole("heading", { level: 2 }));
      await expectNoSidewaysScrollAndWholeText(page);
    }
    // Back is the settings view's Close. Its current target stays reachable
    // while reading the final group; tapping it must not scroll the page first.
    await tapWhereShown(back(page));
    await expect(
      page.getByRole("heading", { name: "Agent roster", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Doughnut", exact: true }),
    ).toBeChecked();
    await expect(settings(page)).toBeFocused();
    expect(server.claudeCalls()).toEqual([]);
  });
});
