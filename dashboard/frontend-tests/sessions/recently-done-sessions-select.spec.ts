// Choosing a Recently done sessions row selects without opening; Open uses a
// terminal substitute. Real attach and reopen leave Recently done in
// ../../../../e2e/sessions/recently-done-sessions-select-open.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { expectProjectChoice } from "../../test-support/projectChoice.ts";
import { box } from "../../test-support/pageLayout.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import {
  closeTerminal,
  terminalPanel,
} from "../../test-support/terminalScreenPage.ts";
import { takenStory } from "../../test-support/launchJourney.ts";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import {
  chooseStoryTab,
  intentFile,
  storyTitle,
} from "../../test-support/support/intentStoryPage.ts";
import { expandIntentGroup } from "../../test-support/intentPerspectivePage.ts";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendServiceSubstitutes.ts";
import { finalReportParts } from "../../test-support/finalReportPages.ts";
import { pygardonCatalogRead } from "../../test-support/pygardonCatalogReads.ts";
import {
  adHoc,
  linked,
  openFrontendSelectionPage,
  report,
  takenElsewhere,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";

const readSpec = "dashboard/tests/example.spec.ts";

test("selecting a linked done story from Intent shows that project's story in Intent, keeps the report in the Side panel and attaches nothing; Open still opens its terminal", async ({
  page,
  frontendServices,
}) => {
  await installAttachedTerminalSubstitute(page);
  const { shown, row } = await openFrontendSelectionPage(
    page,
    frontendServices,
  );
  const { development, intentChoice, intent } = parts(page);
  await shown.open(report.title).click();
  const opened = finalReportParts(page);
  await expect(opened.reportText).toHaveText(report.message);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  const select = shown.select(linked.title);

  await test.step("Tab reaches the row's Select, then its separate Open", async () => {
    await shown.header.focus();
    await page.keyboard.press("Tab");
    await expect(select).toBeFocused();
    await expect(select).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Tab");
    await expect(shown.open(linked.title)).toBeFocused();
    await expect(shown.open(linked.title)).toHaveAccessibleName(
      "Open terminal",
    );
    await expect(shown.open(linked.title)).toHaveAccessibleDescription(
      linked.title,
    );
    await page.keyboard.press("Shift+Tab");
    await expect(select).toBeFocused();
    await expect(shown.open(adHoc.title)).toHaveCount(0);
    expect((await box(row(linked.title))).height).toBe(
      (await box(row(adHoc.title))).height,
    );
  });

  await test.step("Enter on Select shows Pygardon's done story in Intent and leaves the report in the Side panel", async () => {
    const read = pygardonCatalogRead(page);
    await page.keyboard.press("Enter");
    await read;
    await expectProjectChoice(page, "Pygardon");
    await expect(intentChoice).toBeChecked();
    expect(new URL(page.url()).searchParams.get("perspective")).toBe("intent");
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      linked.identity,
    );
    await expect(storyTitle(intent)).toHaveText(linked.title);
    await expect(select).toHaveAttribute("aria-pressed", "true");
    await expect(row(linked.title)).toHaveClass(/\bchosen\b/);
    await expect(shown.choiceStatus(linked.title)).toHaveCount(0);
    await expect(opened.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
    await expect(select).not.toHaveAttribute("aria-current");
    await expect(row(linked.title)).not.toHaveClass(/in-side-panel/);
    await expect(shown.select(report.title)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(shown.select(report.title)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    const ring = await row(linked.title).evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    expect(ring).toMatch(/inset/);
  });

  await test.step("selecting the row again keeps the same story selected", async () => {
    await page.keyboard.press("Enter");
    await expect(select).toHaveAttribute("aria-pressed", "true");
    await expectProjectChoice(page, "Pygardon");
    await expect(intentChoice).toBeChecked();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      linked.identity,
    );
    await expect(opened.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
  });

  await test.step("Development highlights the selected story's done card", async () => {
    await development.click();
    const card = parts(page).recentlyDone.getByRole("article", {
      name: linked.title,
      exact: true,
    });
    await expectSelected(card, true);
    await intentChoice.click();
  });

  await test.step("the row's Open goes to Development and reopens its terminal", async () => {
    await shown.open(linked.title).click();
    const terminal = terminalPanel(page);
    await expect(terminal.getByRole("heading")).toHaveText(linked.title);
    await expect(development).toBeChecked();
    await expect(intent).toHaveCount(0);
    await closeTerminal(terminal);
  });
});

test("selecting standalone rows from Intent keeps the project, file, Selected story and Side panel, including a Taken story's session with no done record", async ({
  page,
  frontendServices,
}) => {
  const { shown } = await openFrontendSelectionPage(page, frontendServices);
  const { taken, intentChoice, intent } = parts(page);
  await shown.open(report.title).click();
  const opened = finalReportParts(page);
  await expect(opened.reportText).toHaveText(report.message);
  const card = taken.getByRole("article", { name: takenStory });
  await showColumn(page, "Taken");
  await emptyArea(card).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await chooseStoryTab(intent, "Changes");
  await expandIntentGroup(intent, "dashboard/tests");
  const file = intentFile(intent, readSpec);
  await file.click();
  await expect(file).toHaveAttribute("aria-pressed", "true");

  const expectReadingKept = async () => {
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(file).toHaveAttribute("aria-pressed", "true");
    await expect(opened.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
  };

  await test.step("Pygardon's Taken story session, with no done record, is selected as a session", async () => {
    const read = pygardonCatalogRead(page);
    await shown.select(takenElsewhere.title).click();
    await read;
    await expect(shown.select(takenElsewhere.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.choiceStatus(takenElsewhere.title)).toHaveCount(0);
    await expectReadingKept();
  });

  await test.step("a Doughnut ad hoc session, which offers no Open, is selected as a session", async () => {
    await expect(shown.open(adHoc.title)).toHaveCount(0);
    await shown.select(adHoc.title).click();
    await expect(shown.select(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.select(takenElsewhere.title)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expectReadingKept();
  });
});
