// A Recently done sessions row's done-story check in the configured
// dashboard frame: checking, unreadable, refused and failed answers are said
// apart from a miss, and a later choice, project or Open outlasts an
// unanswered check.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  adHocTitle,
  checkAgain,
  development,
  intent,
  linked,
  openSelection,
  projectShown,
  pygardonCatalog,
  readInIntent,
  takenTitle,
} from "./recently-done-selection-mount-page.ts";

test("an unanswered catalog check says checking until a later choice supersedes it, and a failed one is said apart from a miss, leaving project and Open usable", async () => {
  const catalog = pygardonCatalog();
  const shown = await openSelection({ doneCatalog: catalog.read });

  catalog.hold();
  await shown.select(linked.title).click();
  await expect
    .poll(() => shown.choiceStatus(linked.title))
    .toBe("Checking for its published done story…");
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "true");
  await shown.select(adHocTitle).click();
  await expect
    .element(shown.select(adHocTitle))
    .toHaveAttribute("aria-pressed", "true");
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "false");
  expect(shown.choiceStatus(linked.title)).toBeUndefined();

  catalog.fail("GitHub could not be reached.");
  await shown.select(linked.title).click();
  await expect
    .poll(() => shown.choiceStatus(linked.title))
    .toMatch(
      /^Its published done story could not be checked\..*Select again to check again\.$/,
    );
  await expect
    .element(shown.select(linked.title))
    .toHaveAccessibleDescription(/could not be checked/);
  await expect.element(projectShown()).toHaveAccessibleName("Doughnut");
  await expect.element(shown.open(linked.title)).toBeVisible();
});

test("a catalog naming the story's done record unreadable, or not describing the done records, is said apart from a miss and leaves the project", async () => {
  const catalog = pygardonCatalog();
  const shown = await openSelection({ doneCatalog: catalog.read });
  const fileName = doneRecordFileName(linked.identity);

  catalog.answer({
    status: "catalogued",
    records: [],
    unreadable: [{ fileName, blob: "b".repeat(40) }],
  });
  await shown.select(linked.title).click();
  await expect
    .poll(() => shown.choiceStatus(linked.title))
    .toBe(
      `Its published done story could not be checked. Its done record ${fileName} could not be read. ${checkAgain}`,
    );
  await expect.element(projectShown()).toHaveAccessibleName("Open Dough");

  const gap = "done catalog is not published beside the 1 done records";
  catalog.answer({ status: "gap", problem: gap });
  await shown.select(linked.title).click();
  await expect
    .poll(() => shown.choiceStatus(linked.title))
    .toBe(
      `Its published done story could not be checked. Done stories could not be read. The done catalog does not describe the published done records: ${gap}. Run the product backlog's \`catalog-done\` to rebuild it from the done records, then publish the rebuilt catalog. ${checkAgain}`,
    );
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "true");
  await expect.element(projectShown()).toHaveAccessibleName("Open Dough");
});

test("choosing another project while a linked row is still checked abandons the check, keeping the reader in the project they chose", async () => {
  const catalog = pygardonCatalog();
  const shown = await openSelection({ doneCatalog: catalog.read });
  await readInIntent();

  catalog.hold();
  await shown.select(linked.title).click();
  await expect.poll(() => shown.choiceStatus(linked.title)).toBeTruthy();
  await page
    .getByRole("radiogroup", { name: "Project" })
    .getByRole("radio", { name: "Doughnut" })
    .click();

  await expect.element(projectShown()).toHaveAccessibleName("Doughnut");
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "false");
  expect(shown.choiceStatus(linked.title)).toBeUndefined();
  await expect.element(intent()).not.toHaveAttribute("data-selected-story");
});

test("another row's Open while a linked row is still checked abandons the check and shows Development", async () => {
  const catalog = pygardonCatalog();
  const shown = await openSelection({ doneCatalog: catalog.read });
  await readInIntent();

  catalog.hold();
  await shown.select(linked.title).click();
  await expect.poll(() => shown.choiceStatus(linked.title)).toBeTruthy();
  await shown.open(takenTitle).click();

  await expect.element(development()).toBeChecked();
  await expect
    .element(shown.select(linked.title))
    .toHaveAttribute("aria-pressed", "false");
  expect(shown.choiceStatus(linked.title)).toBeUndefined();
});
