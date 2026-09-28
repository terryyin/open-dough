// Protected keyboard contexts keep their own arrow behavior and leave the
// selected project unchanged until an eligible page-wide shortcut resumes.

import { expect, test } from "./dashboardTest.ts";
import { expectRoute, openDough } from "./agentRosterRecords.ts";
import { parts } from "./dashboardPage.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  buildOpenDoughReadinessRepo,
  plannedReady,
} from "./storyReadinessFixture.ts";
import {
  doughnutProject,
  publishCatalogProjects,
  pygardonProject,
} from "./projectKeyboardNavigationJourney.ts";

test("help modal, editing, other arrow controls, and prevented keys leave the project unchanged", async ({
  page,
  afterGitHubStops,
}) => {
  const repo = buildOpenDoughReadinessRepo(afterGitHubStops);
  await publishCommittedOrigin(page, {
    repoDir: repo.directory,
    revision: repo.revision,
    repository: openDough.repository,
  });
  for (const published of [doughnutProject, pygardonProject]) {
    await publishFiles(page, {
      repository: published.repository,
      revision: published.revision,
      files: filesOf(published),
    });
  }

  await page.goto("/");
  await expect(
    page.getByRole("article", { name: plannedReady.title }),
  ).toBeVisible();
  const { project, preparationHelp, refresh } = parts(page);
  await expect(
    project.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();

  await test.step("open help modal absorbs arrows; closing restores the shortcut", async () => {
    await preparationHelp.click();
    const dialog = page.getByRole("dialog", { name: "Preparation badges" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await expect(
      project.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
    expect(new URL(page.url()).searchParams.get("project")).toBeNull();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await refresh.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      project.getByRole("radio", { name: "Doughnut", exact: true }),
    ).toBeChecked();
    expectRoute(page, { project: "doughnut", view: null });
  });

  await project.getByRole("radio", { name: "Open Dough", exact: true }).check();

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
      await expect(
        project.getByRole("radio", { name: "Open Dough", exact: true }),
      ).toBeChecked();
    }

    await page.evaluate(() => {
      document.getElementById("project-arrow-eligibility-fixtures")?.remove();
    });
  });

  await test.step("already-prevented arrow events keep the selection", async () => {
    await refresh.focus();
    await page.evaluate(() => {
      const prevent = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
        }
      };
      window.addEventListener("keydown", prevent, true);
      (
        window as Window & {
          __projectArrowPrevent?: (event: KeyboardEvent) => void;
        }
      ).__projectArrowPrevent = prevent;
    });
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await expect(
      project.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
    await page.evaluate(() => {
      const prevent = (
        window as Window & {
          __projectArrowPrevent?: (event: KeyboardEvent) => void;
        }
      ).__projectArrowPrevent;
      if (prevent) {
        window.removeEventListener("keydown", prevent, true);
      }
    });
  });
});

test("modified arrow keys do not cycle projects", async ({ page }) => {
  await publishCatalogProjects(page);
  await page.goto("/");
  const { project, refresh } = parts(page);
  await refresh.focus();

  for (const key of [
    "Shift+ArrowRight",
    "Control+ArrowRight",
    "Alt+ArrowRight",
    "Meta+ArrowRight",
    "Shift+ArrowLeft",
  ]) {
    await page.keyboard.press(key);
    await expect(
      project.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
  }

  await page.keyboard.press("ArrowRight");
  await expect(
    project.getByRole("radio", { name: "Doughnut", exact: true }),
  ).toBeChecked();
});
