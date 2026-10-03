// System settings in the frame's look: each setting group is a headed region
// in one shared column, its text readable and its controls recognisable, and
// the page and its project dialogs fit a narrow window without sideways
// scrolling.

import { expect, test, type Locator, type Page } from "@playwright/test";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { back } from "./support/systemSettingsPage.ts";
import {
  expectControlContrast,
  expectReadableContrast,
} from "./accessibleReading.ts";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const settingGroups = ["Projects", "OpenAI"];

// Every piece of text a reader reads, and every control, in one area.
async function expectReadableAndRecognisable(area: Locator) {
  const texts = area.locator("h2, h3, p, dt, dd, label, [role='alert']");
  for (const text of await texts.all()) await expectReadableContrast(text);
  const controls = area.locator("button, input");
  expect(await controls.count()).toBeGreaterThan(0);
  for (const control of await controls.all()) {
    if ((await control.getAttribute("type")) !== "password")
      await expectReadableContrast(control);
    await expectControlContrast(control);
  }
}

async function openSettings(page: Page) {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("API key:", { exact: false })).toBeVisible();
}

test("each setting group is a headed region in one column, with readable text and recognisable controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openSettings(page);
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
    await expectReadableAndRecognisable(region);
  }
  // A further group drops in as one more region in the same column.
  const [projects, openAI] = await Promise.all(regions.map(box));
  expect(openAI?.x).toBeCloseTo(projects?.x ?? Number.NaN, 0);
  expect(openAI?.width).toBeCloseTo(projects?.width ?? Number.NaN, 0);
});

test("settings and its project dialogs fit a 420 pixel window without sideways scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 420, height: 900 });
  await openSettings(page);
  await expectNoSidewaysScrollAndWholeText(page);

  await page.getByRole("button", { name: "Add project", exact: true }).click();
  const add = page.getByRole("dialog", { name: "Add project", exact: true });
  await expect(add.getByRole("textbox", { name: "GitHub URL" })).toBeFocused();
  await expectReadableAndRecognisable(add);
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
  await expectReadableAndRecognisable(remove);
  await expect(remove).toBeInViewport({ ratio: 1 });
  await remove.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(remove).toBeHidden();
  await expectNoSidewaysScrollAndWholeText(page);
});
