// Unfinished retained report UI against controlled result and done answers:
// touch reading, choice focus, Escape restoration and the panel shortcut.
// Persistence, native passivity and Done rename stay in
// ../../../e2e/sessions/final-report-done-native.spec.ts.

import {
  closeSidePanel,
  control,
  expectTitleOnOneCutLine,
} from "../../tests/sidePanelFrame.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  defaultReportText,
  openFrontendUnfinishedReport,
  unfinishedReportTitle,
} from "../../tests/support/frontendFinalReportSession.ts";
import { keepOpen, markAsDone } from "../../tests/support/markDone.ts";
import { finalReportParts } from "../../tests/finalReportPages.ts";
import {
  expectTopBarsShareHeight,
  tapWhereShown,
  pressWhereShown,
} from "../../tests/pageLayout.ts";
import {
  readReportByTouch,
  reportGeometry,
} from "../../tests/support/reportTouchPage.ts";
import { resizeUntilArranged } from "../../tests/sidePanelWidthPage.ts";
import { sessionStateOf } from "../../tests/dashboardPage.ts";

const questionWords =
  "This session reported unfinished work. Mark it done anyway?";

{
  const height = 320;
  test.describe(`short phone ${height}`, () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
    test("reads the question and touches each full choice through resize and rotation", async ({
      page,
      frontendServices,
    }) => {
      const { open } = await openFrontendUnfinishedReport(
        page,
        frontendServices,
      );
      const { panel, reportText, names, sessionName, shownSessionId } =
        finalReportParts(page);
      await expect(
        panel.getByRole("heading", { name: unfinishedReportTitle }),
      ).toHaveAccessibleName(unfinishedReportTitle);
      await expect(sessionName).toHaveText(/ session$/);
      await expect(shownSessionId).toHaveCount(0);
      await resizeUntilArranged(panel, { width: 390, height });
      const titleToggle = names.getByRole("button", {
        name: unfinishedReportTitle,
        exact: true,
      });
      await expectTitleOnOneCutLine(titleToggle);
      const reading = sessionStateOf(page.locator(".page-column"));
      await expect(reading).toHaveText("Ready for review");
      await expectTopBarsShareHeight(page, 2);
      const mark = markAsDone(panel.locator(".side-panel-header"));
      const question = panel.getByRole("group", {
        name: questionWords,
        exact: true,
      });
      const markAnyway = markAsDone(question);
      const keep = keepOpen(question);
      await readReportByTouch(panel, mark);
      await tapWhereShown(mark);
      await expect(question).toBeVisible();
      await expect(keep).toBeFocused();
      await readReportByTouch(panel, markAnyway);
      await readReportByTouch(panel, keep);
      await readReportByTouch(panel, question.getByRole("paragraph").first());
      for (const view of [
        { width: 390, height: 240 },
        { width: 390, height: 844 },
        { width: 844, height: 390 },
        { width: 390, height },
      ]) {
        await resizeUntilArranged(panel, view);
        await expect(question).toHaveCount(1);
        await expect(
          panel.getByRole("heading", { name: unfinishedReportTitle }),
        ).toHaveAccessibleName(unfinishedReportTitle);
        await expect(shownSessionId).toHaveCount(0);
        await readReportByTouch(panel, question.getByRole("paragraph").first());
        for (const answer of [markAnyway, keep]) {
          await readReportByTouch(panel, answer);
          expect(await reportGeometry(answer)).toMatchObject({
            visible: true,
            hit: true,
          });
        }
        await expect(reading).toHaveText("Ready for review");
      }
      await readReportByTouch(panel, keep);
      await tapWhereShown(keep);
      await expect(question).toHaveCount(0);
      await expect(mark).toBeFocused();
      await expect(reading).toHaveText("Ready for review");
      await readReportByTouch(
        panel,
        reportText,
        "Landed on main at `a5df85d90a`.",
      );
      await readReportByTouch(
        panel,
        reportText,
        "<script>window.reportExecuted=true</script>",
      );
      expect(await page.evaluate(() => "reportExecuted" in window)).toBe(false);
      const close = control(panel, "Close");
      await readReportByTouch(panel, close);
      await closeSidePanel(panel, { using: "touch" });
      await expect(panel).toHaveCount(0);
      await expect(open).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(reportText).toHaveText(defaultReportText);
      await readReportByTouch(panel, mark);
      await tapWhereShown(mark);
      await expect(question).toHaveCount(1);
      await readReportByTouch(panel, question.getByRole("paragraph").first());
      await readReportByTouch(panel, markAnyway);
      await tapWhereShown(markAnyway);
      await expect(panel).toHaveCount(0);
    });
  });
}

for (const { name, viewport, hasTouch } of [
  { name: "tablet", viewport: { width: 768, height: 1024 }, hasTouch: true },
  { name: "desktop", viewport: { width: 1440, height: 900 }, hasTouch: false },
]) {
  test.describe(name, () => {
    test.use({ viewport, hasTouch });
    test("keeps report reading, choices, Escape restoration and the panel shortcut", async ({
      page,
      frontendServices,
    }) => {
      const { open } = await openFrontendUnfinishedReport(
        page,
        frontendServices,
      );
      const { panel, reportText } = finalReportParts(page);
      const mark = markAsDone(panel.locator(".side-panel-header"));
      const question = panel.getByRole("group", {
        name: questionWords,
        exact: true,
      });
      const markAnyway = markAsDone(question);
      const keep = keepOpen(question);
      await expect(reportText).toHaveText(defaultReportText);
      expect(await reportGeometry(reportText)).toMatchObject({
        visible: true,
        hit: true,
      });
      const press = hasTouch ? tapWhereShown : pressWhereShown;
      await press(mark);
      for (const target of [
        question.getByRole("paragraph").first(),
        markAnyway,
        keep,
      ]) {
        expect(await reportGeometry(target)).toMatchObject({
          visible: true,
          hit: true,
        });
      }
      await press(keep);
      await expect(question).toHaveCount(0);
      await expect(mark).toBeFocused();
      await press(mark);
      await expect(keep).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(question).toHaveCount(0);
      await expect(mark).toBeFocused();
      await page.keyboard.press("Meta+Shift+Escape");
      await expect(panel).toHaveCount(0);
      await expect(open).toBeFocused();
    });
  });
}
