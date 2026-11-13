// A Recently done sessions row's unanswered done-story check
// (../../src/recentlyDoneSelection.ts) is abandoned when the developer goes
// elsewhere meanwhile: another project chosen, or another row's Open
// (../../src/PageFrame.tsx). Its late answer then moves nothing, so the page
// stays where the developer went. Supersession by choosing another row lives
// in ./recently-done-sessions-select-check.spec.ts.

import type { Page } from "@playwright/test";
import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { chooseProject, expectProjectChoice } from "../projectChoice.ts";
import {
  choiceStatus,
  linked,
  openSelectionPage,
  report,
} from "../recentlyDoneSelectionJourney.ts";
import { showReport } from "../recentlyDoneSelectionReport.ts";
import {
  holdPygardonCatalog,
  pygardonCatalogAbandoned,
} from "../pygardonCatalogReads.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

// Holds Pygardon's catalog, chooses the linked row so its check stays
// unanswered, lets `goElsewhere` act, and releases the hold once the page has
// abandoned that check's read; answers what `goElsewhere` answered.
async function goElsewhereWhileChecking<T>(
  page: Page,
  shown: Awaited<ReturnType<typeof openSelectionPage>>["shown"],
  goElsewhere: () => Promise<T>,
) {
  const held = await holdPygardonCatalog(page);
  const abandoned = pygardonCatalogAbandoned(page);
  try {
    await shown.select(linked.title).click();
    await held.asked;
    const went = await goElsewhere();
    await abandoned;
    return went;
  } finally {
    held.release();
  }
}

test("choosing another project while a linked row is still checked abandons the check, keeping the Intent reader in the project they chose", async ({
  page,
  dashboard,
}) => {
  // The shown rows' recurring catalog read waits for page time.
  await pausePageClockAt(page, new Date());
  const { shown, row } = await openSelectionPage(page, dashboard);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expect(intent).toBeVisible();

  await goElsewhereWhileChecking(page, shown, () =>
    chooseProject(page, "Doughnut"),
  );

  await expectProjectChoice(page, "Doughnut");
  await expect(intentChoice).toBeChecked();
  await expect(intent).not.toHaveAttribute("data-selected-story");
  await expect(shown.select(linked.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(choiceStatus(row(linked.title))).toHaveCount(0);
});

test("another row's Open while a linked row is still checked abandons the check, keeping the opened session's project, story and report", async ({
  page,
  dashboard,
}) => {
  // The shown rows' recurring catalog read waits for page time.
  await pausePageClockAt(page, new Date());
  const { shown, row } = await openSelectionPage(page, dashboard);
  const { development, intentChoice, intent } = parts(page);
  await expect(development).toBeChecked();

  const opened = await goElsewhereWhileChecking(page, shown, () =>
    showReport(page, shown),
  );

  await expectProjectChoice(page, "Open Dough");
  await expect(development).toBeChecked();
  await expect(opened.reportText).toHaveText(report.message);
  await expect(shown.select(linked.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(choiceStatus(row(linked.title))).toHaveCount(0);
  // The Selected story is the opened session's, which Intent reads.
  await intentChoice.click();
  await expectProjectChoice(page, "Open Dough");
  await expect(intent).toHaveAttribute("data-selected-story", report.identity);
});
