// An unanswered done-story check is abandoned when the developer goes
// elsewhere: another project, or another row's Open.
import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  chooseProject,
  expectProjectChoice,
} from "../../test-support/projectChoice.ts";
import { finalReportParts } from "../../test-support/finalReportPages.ts";
import {
  holdPygardonCatalog,
  pygardonCatalogAbandoned,
} from "../../test-support/pygardonCatalogReads.ts";
import {
  linked,
  openFrontendSelectionPage,
  report,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";

async function goElsewhereWhileChecking<T>(
  page: Page,
  shown: Awaited<ReturnType<typeof openFrontendSelectionPage>>["shown"],
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
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  const { shown } = await openFrontendSelectionPage(page, frontendServices);
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
  await expect(shown.choiceStatus(linked.title)).toHaveCount(0);
});

test("another row's Open while a linked row is still checked abandons the check, keeping the opened session's project, story and report", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  const { shown } = await openFrontendSelectionPage(page, frontendServices);
  const { development, intentChoice, intent } = parts(page);
  await expect(development).toBeChecked();

  await goElsewhereWhileChecking(page, shown, async () => {
    await shown.open(report.title).click();
    return finalReportParts(page);
  });

  await expectProjectChoice(page, "Open Dough");
  await expect(development).toBeChecked();
  await expect(finalReportParts(page).reportText).toHaveText(report.message);
  await expect(shown.select(linked.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(shown.choiceStatus(linked.title)).toHaveCount(0);
  await intentChoice.click();
  await expectProjectChoice(page, "Open Dough");
  await expect(intent).toHaveAttribute("data-selected-story", report.identity);
});
