// Choosing a Recently done sessions row selects it without opening it
// (../../src/recentlyDoneSelection.ts); its separate Open control opens the
// session's terminal or final report as rows did before. A row whose
// session's project publishes a matching done story selects that story in
// its project, keeping Intent and the Side panel; a standalone row, including
// one whose story is still Taken, selects only the session. Unanswered and
// failed checks live in ./recently-done-sessions-select-check.spec.ts, an
// unanswered check abandoned by navigation in
// ./recently-done-sessions-select-supersede.spec.ts, touch
// in ./recently-done-sessions-select-touch.spec.ts, Board reveal of a
// selection from Development in
// ./recently-done-sessions-select-development.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import { expandIntentGroup } from "../intentPerspectivePage.ts";
import { box } from "../pageLayout.ts";
import { showColumn } from "../boardPage.ts";
import { closeTerminal, terminalPanel } from "../terminalScreenPage.ts";
import {
  adHoc,
  choiceStatus,
  linked,
  openDoughTaken,
  openSelectionPage,
  readSpec,
  report,
  takenElsewhere,
} from "../recentlyDoneSelectionJourney.ts";
import { showReport } from "../recentlyDoneSelectionReport.ts";
import { pygardonCatalogRead } from "../pygardonCatalogReads.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { emptyArea, expectSelected } from "../storyCardSelection.ts";
import {
  chooseStoryTab,
  intentFile,
  storyTitle,
} from "../support/intentStoryPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test("selecting a linked done story from Intent shows that project's story in Intent, keeps the report in the Side panel and attaches nothing; Open still opens its terminal", async ({
  page,
  dashboard,
}) => {
  const { shown, row } = await openSelectionPage(page, dashboard);
  const { development, intentChoice, intent } = parts(page);
  const opened = await showReport(page, shown);
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
    // Open keeps the row one line, as tall as a row without it.
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
    await expect(choiceStatus(row(linked.title))).toHaveCount(0);
    await expect(opened.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
    expect(dashboard.claudeAttaches()).toEqual([]);
    // Selection and the Side panel's session keep separate marks.
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
    expect(dashboard.claudeAttaches()).toEqual([]);
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

  await test.step("the row's Open goes to Development and reopens its terminal; Close returns the keyboard to its session's Board entry", async () => {
    await shown.open(linked.title).click();
    const terminal = terminalPanel(page);
    await expect(terminal.getByRole("heading")).toHaveText(linked.title);
    await expect(development).toBeChecked();
    await expect(intent).toHaveCount(0);
    await expect.poll(() => dashboard.claudeAttaches()).toHaveLength(1);
    // Reopened, the session leaves Recently done for the open list.
    const reopened = sessionsSidebarParts(page).entry(linked.title);
    await expect(reopened).toHaveAttribute("aria-current", "true");
    await expect(select).toHaveCount(0);
    await closeTerminal(terminal);
    await expect(page.locator(":focus")).toHaveAccessibleName(
      `Execution session for ${linked.title}`,
    );
  });
});

test("selecting standalone rows from Intent keeps the project, file, Selected story and Side panel, including a Taken story's session with no done record", async ({
  page,
  dashboard,
}) => {
  const { shown, row } = await openSelectionPage(page, dashboard);
  const { taken, intentChoice, intent } = parts(page);
  const opened = await showReport(page, shown);
  const card = taken.getByRole("article", { name: openDoughTaken.title });
  await showColumn(page, "Taken");
  await emptyArea(card).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  const file = intentFile(intent, readSpec);
  await file.click();
  await expect(file).toHaveAttribute("aria-pressed", "true");

  const expectReadingKept = async () => {
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      openDoughTaken.identity,
    );
    await expect(file).toHaveAttribute("aria-pressed", "true");
    await expect(opened.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
    expect(dashboard.claudeAttaches()).toEqual([]);
  };

  await test.step("Pygardon's Taken story session, with no done record, is selected as a session", async () => {
    const read = pygardonCatalogRead(page);
    await shown.select(takenElsewhere.title).click();
    await read;
    await expect(shown.select(takenElsewhere.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // A confirmed miss says nothing of a done story.
    await expect(choiceStatus(row(takenElsewhere.title))).toHaveCount(0);
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
