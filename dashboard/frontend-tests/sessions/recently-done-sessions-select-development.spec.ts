// Choosing a Recently done sessions row in Development shows its project's
// Board and brings the linked done card or standalone entry into view.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  parts,
  rosterParts,
  sessionEntriesIn,
  standaloneSessionName,
} from "../../test-support/dashboardPage.ts";
import { expectProjectChoice } from "../../test-support/projectChoice.ts";
import { finalReportParts } from "../../test-support/finalReportPages.ts";
import { pygardonCatalogRead } from "../../test-support/pygardonCatalogReads.ts";
import { expectSelected } from "../../test-support/storyCardSelection.ts";
import { terminalPanel } from "../../test-support/terminalScreenPage.ts";
import {
  adHoc,
  linked,
  openFrontendSelectionPage,
  report,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";

async function expectDevelopmentKept(
  page: Parameters<typeof openFrontendSelectionPage>[0],
  opened?: ReturnType<typeof finalReportParts>,
) {
  const { development, intent } = parts(page);
  await expect(development).toBeChecked();
  await expect(intent).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("perspective")).toBeNull();
  if (opened === undefined) {
    await expect(
      page.getByRole("region", { name: /^(Terminal|Final report)$/ }),
    ).toHaveCount(0);
  } else {
    await expect(opened.reportText).toHaveText(report.message);
    await expect(terminalPanel(page)).toHaveCount(0);
  }
}

test("selecting a linked done story in Development shows its project's Board with its done card, beyond Pygardon's first ten, selected in view, keeping the report in the Side panel", async ({
  page,
  frontendServices,
}) => {
  const { shown } = await openFrontendSelectionPage(page, frontendServices, {
    newer: { pygardon: 10 },
  });
  await shown.open(report.title).click();
  const opened = finalReportParts(page);
  await expect(opened.reportText).toHaveText(report.message);
  const card = parts(page).recentlyDone.getByRole("article", {
    name: linked.title,
    exact: true,
  });

  await test.step("Select shows Pygardon's Board and brings the selected done card into view", async () => {
    const read = pygardonCatalogRead(page);
    await shown.select(linked.title).click();
    await read;
    await expectProjectChoice(page, "Pygardon");
    await expect(shown.select(linked.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectSelected(card, true);
    await expect(card).toBeInViewport();
    await expect(shown.select(linked.title)).toBeFocused();
    await expectDevelopmentKept(page, opened);
  });

  await test.step("selecting the row again keeps the story selected and in view", async () => {
    await shown.select(linked.title).click();
    await expect(shown.select(linked.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectProjectChoice(page, "Pygardon");
    await expectSelected(card, true);
    await expect(card).toBeInViewport();
    await expectDevelopmentKept(page, opened);
  });
});

test("selecting an older standalone session in Development reveals and marks its entry beyond Doughnut's first ten", async ({
  page,
  frontendServices,
}) => {
  const { shown } = await openFrontendSelectionPage(page, frontendServices, {
    newer: { doughnut: 10 },
  });
  await shown.open(report.title).click();
  const opened = finalReportParts(page);
  const { recentlyDone } = parts(page);
  const entry = recentlyDone.getByRole("article", {
    name: standaloneSessionName("Ad hoc", adHoc.title),
  });

  await test.step("Select shows Doughnut's Board", async () => {
    await shown.select(adHoc.title).click();
    await expectProjectChoice(page, "Doughnut");
    await expect(shown.select(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  await test.step("its entry, the eleventh of Doughnut's Recently done, is shown selected and in view", async () => {
    await expect(entry).toBeInViewport();
    await expect(sessionEntriesIn(recentlyDone).nth(10)).toHaveAccessibleName(
      standaloneSessionName("Ad hoc", adHoc.title),
    );
    await expect(entry).toHaveClass(/\bselected-session\b/);
    await expect(entry).toContainText("Selected session");
    const ring = await entry.evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    expect(ring).toMatch(/inset/);
    await expectDevelopmentKept(page, opened);
  });
});

test("selecting a standalone session from Development's agent roster shows its project's Board with the entry selected in view", async ({
  page,
  frontendServices,
}) => {
  const { shown } = await openFrontendSelectionPage(page, frontendServices, {
    newer: { doughnut: 10 },
    address: "/?project=open-dough&view=roster",
  });
  const { roster } = rosterParts(page);
  const { recentlyDone } = parts(page);
  await expect(roster).toBeVisible();
  await shown.select(adHoc.title).click();
  await expectProjectChoice(page, "Doughnut");
  await expect(roster).toHaveCount(0);
  const entry = recentlyDone.getByRole("article", {
    name: standaloneSessionName("Ad hoc", adHoc.title),
  });
  await expect(entry).toBeInViewport();
  await expect(entry).toHaveClass(/\bselected-session\b/);
  await expectDevelopmentKept(page);
});
