import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { portrait, useTouchScreen } from "./board-touch-page.ts";
import {
  compactProject,
  expectBannerRow,
  expectFrameTextWhole,
  expectOnlyBannerControls,
  projectChoices,
  sessions,
} from "./dashboard-header-reading.ts";
import {
  doughnut,
  mountProjectCatalog,
  openDough,
  projectRadio,
  readsProjectBoard,
} from "./project-navigation-frame.ts";

test("the phone banner keeps one row as a project is picked and resizing keeps that choice", async () => {
  await useTouchScreen();
  await mountProjectCatalog("stories", portrait);
  await expect.element(compactProject).toHaveValue("open-dough");
  await readsProjectBoard(openDough);
  expectOnlyBannerControls();
  await expect.element(sessions).toHaveAccessibleName("Sessions");
  expect(
    sessions
      .element()
      .querySelector("img.product-mark")
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  await expectBannerRow(compactProject);
  expectFrameTextWhole();

  await compactProject.selectOptions("doughnut");
  await expect.element(compactProject).toHaveValue("doughnut");
  await readsProjectBoard(doughnut);
  expect(projectChoices.query()).toBeNull();
  await expectBannerRow(compactProject);
  expectFrameTextWhole();

  await page.viewport(1280, 800);
  await expect.element(projectRadio("Doughnut")).toBeChecked();
  expect(compactProject.query()).toBeNull();
  expectOnlyBannerControls();
  await page.viewport(portrait.width, portrait.height);
  await expect.element(compactProject).toHaveValue("doughnut");
  await expectBannerRow(compactProject);
});
