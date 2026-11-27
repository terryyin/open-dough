import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { storyCard } from "./board-reading-page.ts";
import { portrait, tapWhereShown, useTouchScreen } from "./board-touch-page.ts";
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
  focus,
  mountProjectCatalog,
  openDough,
  projectRadio,
  pygardon,
  readsProjectBoard,
} from "./project-navigation-frame.ts";

const list = page.getByRole("listbox", { name: "Project", exact: true });
const openDoughCard = storyCard("Open Dough's own queued story");

test("the phone banner keeps one row as touch picks a project and resizing keeps that choice", async () => {
  await useTouchScreen();
  await mountProjectCatalog("stories", portrait);
  await expect.element(compactProject).toHaveTextContent("Open Dough");
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

  await tapWhereShown(compactProject.element());
  const option = list.getByRole("option", { name: "Doughnut", exact: true });
  await expect.element(option).toBeInViewport({ ratio: 1 });
  await tapWhereShown(option.element());
  await expect.element(compactProject).toHaveTextContent("Doughnut");
  await readsProjectBoard(doughnut);
  expect(projectChoices.query()).toBeNull();
  await expectBannerRow(compactProject);
  expectFrameTextWhole();

  await page.viewport(1280, 800);
  await expect.element(projectRadio("Doughnut")).toBeChecked();
  expect(compactProject.query()).toBeNull();
  expectOnlyBannerControls();
  await page.viewport(portrait.width, portrait.height);
  await expect.element(compactProject).toHaveTextContent("Doughnut");
  await expectBannerRow(compactProject);
});

test("compact project keyboard Escape keeps the announced choice and Enter accepts the active option", async () => {
  await mountProjectCatalog("stories", portrait);
  await expect.element(compactProject).toHaveTextContent("Open Dough");
  focus(compactProject);
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{Escape}");
  await expect.element(compactProject).toHaveFocus();
  await expect.element(compactProject).toMatchAriaInlineSnapshot(`
    - combobox "Project": Open Dough
  `);
  expect(list.query()).toBeNull();
  await readsProjectBoard(openDough);

  await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");
  await expect.element(compactProject).toMatchAriaInlineSnapshot(`
    - combobox "Project": Pygardon
  `);
  await expect.element(compactProject).toHaveFocus();
  await readsProjectBoard(pygardon);
});

test("page-wide Right Arrow moves Board focus to the compact title of the next project", async () => {
  await mountProjectCatalog("stories", portrait);
  await expect.element(compactProject).toHaveTextContent("Open Dough");
  await openDoughCard
    .getByRole("button", { name: "Inspect story", exact: true })
    .click();
  const record = openDoughCard.getByRole("link", { name: /^Canonical record/ });
  await expect.element(record).toBeVisible();
  focus(record);
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(compactProject).toHaveFocus();
  await expect.element(compactProject).toHaveTextContent("Doughnut");
  await readsProjectBoard(doughnut);
});
