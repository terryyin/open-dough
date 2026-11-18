// Protected keyboard contexts keep their own arrow behavior and leave the
// selected project unchanged until an eligible page-wide shortcut resumes.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import {
  answerCatalogProjects,
  answerOwnPublications,
} from "../../test-support/support/frontendCatalogProjects.ts";
import { catalogPublications } from "../../test-support/catalogProjectRecords.ts";
import { expectRoute } from "../../test-support/agentRosterRecords.ts";
import { parts, projectTab } from "../../test-support/dashboardPage.ts";
import { settings } from "../../test-support/support/systemSettingsPage.ts";

type PreventingWindow = Window & {
  __projectArrowPrevent?: (event: KeyboardEvent) => void;
};

test("help modal, editing, other arrow controls, and prevented keys leave the project unchanged", async ({
  page,
  frontendServices,
}) => {
  await answerOwnPublications(page, frontendServices, [
    catalogPublications.doughnut,
    catalogPublications.pygardon,
  ]);
  await openFrontendTakenBacklog(page);
  const { preparationHelp } = parts(page);
  await expect(projectTab(page, "Open Dough")).toBeChecked();

  await test.step("open help modal absorbs arrows; closing restores the shortcut", async () => {
    await preparationHelp.click();
    const dialog = page.getByRole("dialog", { name: "Preparation badges" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    expectRoute(page, { project: null });
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await settings(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(projectTab(page, "Doughnut")).toBeChecked();
    expectRoute(page, { project: "doughnut", view: null });
  });

  await projectTab(page, "Open Dough").check();

  await test.step("editable targets and non-project arrow controls keep the selection", async () => {
    await page.evaluate(() => {
      const host = document.createElement("div");
      host.id = "project-arrow-eligibility-fixtures";
      host.innerHTML = `
        <input id="fixture-text" type="text" />
        <textarea id="fixture-area"></textarea>
        <select id="fixture-select"><option>a</option><option>b</option></select>
        <input id="fixture-range" type="range" min="0" max="10" value="3" />
      `;
      document.body.append(host);
    });

    for (const selector of [
      "#fixture-text",
      "#fixture-area",
      "#fixture-select",
      "#fixture-range",
    ]) {
      await page.locator(selector).focus();
      await page.keyboard.press("ArrowRight");
      await expect(projectTab(page, "Open Dough")).toBeChecked();
    }

    await page.evaluate(() => {
      document.getElementById("project-arrow-eligibility-fixtures")?.remove();
    });
  });

  await test.step("already-prevented arrow events keep the selection", async () => {
    await settings(page).focus();
    await page.evaluate(() => {
      const prevent = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
        }
      };
      window.addEventListener("keydown", prevent, true);
      Object.assign(window, { __projectArrowPrevent: prevent });
    });
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    await page.evaluate(() => {
      const prevent = (window as PreventingWindow).__projectArrowPrevent;
      if (prevent) window.removeEventListener("keydown", prevent, true);
    });
  });
});

test("modified arrow keys do not cycle projects", async ({
  page,
  frontendServices,
}) => {
  await answerCatalogProjects(page, frontendServices);
  await page.goto("/");
  await settings(page).focus();

  for (const key of [
    "Shift+ArrowRight",
    "Control+ArrowRight",
    "Alt+ArrowRight",
    "Meta+ArrowRight",
    "Shift+ArrowLeft",
  ]) {
    await page.keyboard.press(key);
    await expect(projectTab(page, "Open Dough")).toBeChecked();
  }

  await page.keyboard.press("ArrowRight");
  await expect(projectTab(page, "Doughnut")).toBeChecked();
});
