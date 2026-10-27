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
import { dragEdge, expectWidth, keyStep } from "./sidePanelWidthPage.ts";

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
    test("keeps the report edge reachable after touch reading and resizes the same report", async ({
      page,
      dashboard,
      codexProtocol,
    }) => {
      const text = `${Array.from(
        Array(lines).keys(),
        (line) => `Read native report line ${line}.`,
      ).join("\n")}\nReport ending.`;
      const { panel, result, native, since, state } =
        await openUnfinishedReport(
          page,
          dashboard,
          codexProtocol,
          journey,
          text,
        );
      const initial = state();
      const edge = panel.getByRole("separator", { name: "Resize panel" });
      const before = await box(edge);
      const reachesEdge = (fraction: number) =>
        edge.evaluate((element, fraction) => {
          const rect = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(
              rect.x + rect.width * fraction,
              rect.y + rect.height / 2,
            ),
          );
        }, fraction);
      const externalHit = await reachesEdge(0.25);
      expect(await reachesEdge(0.75)).toBe(true);
      await readReportByTouch(panel, result, "Report ending.");
      expect(await box(edge)).toEqual(before);
      expect(
        await panel
          .locator(".session-result-scroll")
          .evaluate((element) => element.scrollTop),
      ).toBeGreaterThan(0);
      // Narrow-page column paging can occupy the exterior half already.
      // Reading preserves that arrangement and the inner half's hit target.
      expect(await reachesEdge(0.25)).toBe(externalHit);
      expect(await reachesEdge(0.75)).toBe(true);
      const width = (await box(panel)).width;
      await dragEdge(page, -20);
      await expectWidth(panel, width + 20);
      await edge.focus();
      await page.keyboard.press("ArrowRight");
      await expectWidth(panel, width + 20 - keyStep);
      await expect(panel.locator(".side-panel-names code")).toHaveText(
        sessionId,
      );
      await expect(result).toHaveText(text);
      expect(state()).toEqual(initial);
      passive(native, since);
    });
  });
}
