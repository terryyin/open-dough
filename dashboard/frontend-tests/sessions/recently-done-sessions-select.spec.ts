// Choosing standalone Recently done sessions rows from Intent keeps the
// reading. Linked rows, their ring, heights and Development highlight are
// ./recently-done-sessions-select-intent-mount.spec.ts; real attach is
// ../../../../e2e/sessions/recently-done-sessions-select-open.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { expectProjectChoice } from "../../test-support/projectChoice.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { takenStory } from "../../test-support/launchJourney.ts";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import {
  chooseStoryTab,
  intentFile,
} from "../../test-support/support/intentStoryPage.ts";
import { terminalPanel } from "../../test-support/terminalScreenPage.ts";
import { expandIntentGroup } from "../../test-support/intentPerspectivePage.ts";
import { finalReportParts } from "../../test-support/finalReportPages.ts";
import { pygardonCatalogRead } from "../../test-support/pygardonCatalogReads.ts";
import {
  adHoc,
  openFrontendSelectionPage,
  report,
  takenElsewhere,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";

const readSpec = "dashboard/tests/example.spec.ts";

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
