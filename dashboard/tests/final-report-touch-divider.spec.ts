// The report scrolls inside its frame; the existing resize strip and its
// available grab area stay on that frame.
import { test, expect } from "./support/codexLaunch.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import {
  openUnfinishedReport,
  sessionId,
} from "./support/reportTouchJourney.ts";
import { readReportByTouch } from "./support/reportTouchPage.ts";
import { passive } from "./support/retainedReport.ts";
import { box } from "./pageLayout.ts";
import { dragDivider, expectWidth, keyStep } from "./sidePanelWidthPage.ts";

test.use({ projectFolders: ["open-dough"], hasTouch: true });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

for (const { name, viewport, lines } of [
  { name: "landscape", viewport: { width: 844, height: 390 }, lines: 20 },
  { name: "desktop", viewport: { width: 1440, height: 900 }, lines: 40 },
]) {
  test.describe(name, () => {
    test.use({ viewport });
    test("keeps the report divider reachable after touch reading and resizes the same report", async ({
      page,
      dashboard,
      codexProtocol,
    }) => {
      const text = `${Array.from(
        Array(lines).keys(),
        (line) => `Read native report line ${line}.`,
      ).join("\n")}\nReport ending.`;
      const { panel, reportText, native, since, state } =
        await openUnfinishedReport(
          page,
          dashboard,
          codexProtocol,
          journey,
          text,
        );
      const initial = state();
      const divider = panel.getByRole("separator", { name: "Panel divider" });
      const before = await box(divider);
      const reachesDivider = (fraction: number) =>
        divider.evaluate((element, fraction) => {
          const rect = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(
              rect.x + rect.width * fraction,
              rect.y + rect.height / 2,
            ),
          );
        }, fraction);
      const externalHit = await reachesDivider(0.25);
      expect(await reachesDivider(0.75)).toBe(true);
      await readReportByTouch(panel, reportText, "Report ending.");
      expect(await box(divider)).toEqual(before);
      expect(
        await panel
          .locator(".final-report-scroll")
          .evaluate((element) => element.scrollTop),
      ).toBeGreaterThan(0);
      // Narrow-page column paging can occupy the exterior half already.
      // Reading preserves that arrangement and the inner half's hit target.
      expect(await reachesDivider(0.25)).toBe(externalHit);
      expect(await reachesDivider(0.75)).toBe(true);
      const width = (await box(panel)).width;
      await dragDivider(page, -20);
      await expectWidth(panel, width + 20);
      await divider.focus();
      await page.keyboard.press("ArrowRight");
      await expectWidth(panel, width + 20 - keyStep);
      await expect(panel.locator(".side-panel-names code")).toHaveText(
        sessionId,
      );
      await expect(reportText).toHaveText(text);
      expect(state()).toEqual(initial);
      passive(native, since);
    });
  });
}
