// The report scrolls inside its frame; the resize strip and its grab area
// stay on that frame after touch reading, against a controlled report answer.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { openFrontendUnfinishedReport } from "../../tests/support/frontendFinalReportSession.ts";
import { finalReportParts } from "../../tests/finalReportPages.ts";
import { readReportByTouch } from "../../tests/support/reportTouchPage.ts";
import { box } from "../../tests/pageLayout.ts";
import {
  dividerHitTarget,
  dragDivider,
  expectWidth,
  focusDivider,
  keyStep,
  panelDivider,
  pressDividerKey,
} from "../../tests/sidePanelWidthPage.ts";

test.use({ hasTouch: true });

for (const { name, viewport, lines } of [
  { name: "landscape", viewport: { width: 844, height: 390 }, lines: 20 },
  { name: "desktop", viewport: { width: 1440, height: 900 }, lines: 40 },
]) {
  test.describe(name, () => {
    test.use({ viewport });
    test("keeps the report divider reachable after touch reading and resizes the same report", async ({
      page,
      frontendServices,
    }) => {
      const text = `${Array.from(
        Array(lines).keys(),
        (line) => `Read native report line ${line}.`,
      ).join("\n")}\nReport ending.`;
      await openFrontendUnfinishedReport(page, frontendServices, {
        kind: "available",
        turnId: "divider-report-turn",
        text,
      });
      const { panel, reportText, reportScroll, shownSessionId } =
        finalReportParts(page);
      const divider = panelDivider(panel, { exact: false });
      const before = await box(divider);
      const reachesDivider = (fraction: number) =>
        dividerHitTarget(divider, fraction);
      const externalHit = await reachesDivider(0.25);
      expect(await reachesDivider(0.75)).toBe(true);
      await readReportByTouch(panel, reportText, "Report ending.");
      expect(await box(divider)).toEqual(before);
      expect(
        await reportScroll.evaluate((element) => element.scrollTop),
      ).toBeGreaterThan(0);
      expect(await reachesDivider(0.25)).toBe(externalHit);
      expect(await reachesDivider(0.75)).toBe(true);
      const width = (await box(panel)).width;
      await dragDivider(page, -20);
      await expectWidth(panel, width + 20);
      await focusDivider(panel, { exact: false });
      await pressDividerKey(page, "ArrowRight");
      await expectWidth(panel, width + 20 - keyStep);
      await expect(shownSessionId).toHaveCount(0);
      await expect(reportText).toHaveText(text);
    });
  });
}
