// Retained unfinished reports use the real page/store/native boundary. The
// vendor fixture supplies history only; coordinates and finger strokes prove access.
import { existsSync } from "node:fs";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { parts } from "./dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { report, passive } from "./support/retainedReport.ts";
import {
  openUnfinishedReport,
  title,
  sessionId,
} from "./support/reportTouchJourney.ts";
import {
  readReportByTouch,
  reportGeometry,
} from "./support/reportTouchPage.ts";
import { tapWhereShown, pressWhereShown } from "./pageLayout.ts";
import { resizeUntilArranged } from "./sidePanelWidthPage.ts";

test.use({ projectFolders: ["open-dough"] });
// Short-phone journeys resize, rotate, and re-read choices before Done; keep
// that body separate from beforeAll's publish budget (default 30s is too tight).
test.setTimeout(60_000);
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

// One short-phone height: wrap and ≤480 survival; resize loop still visits 240.
{
  const height = 320;
  test.describe(`short phone ${height}`, () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
    test("reads the question and touches each full choice, retaining identity through resize and rotation", async ({
      page,
      dashboard,
      codexProtocol,
    }) => {
      const {
        record,
        workspace,
        native,
        since,
        open,
        panel,
        reportText,
        mark,
        question,
        choice,
        state,
        underlying,
        reading,
      } = await openUnfinishedReport(page, dashboard, codexProtocol, journey);
      await expect(
        panel.getByRole("heading", { name: title }),
      ).toHaveAccessibleName(title);
      await expect(panel.locator(".side-panel-names p")).toHaveText(
        / session$/,
      );
      await expect(panel.locator(".side-panel-names code")).toHaveCount(0);
      await resizeUntilArranged(panel, { width: 390, height });
      const names = panel.locator(".side-panel-names");
      const titleToggle = names.getByRole("button", {
        name: title,
        exact: true,
      });
      expect(
        await titleToggle.evaluate(
          (element) =>
            getComputedStyle(element).whiteSpace === "nowrap" &&
            element.scrollWidth > element.clientWidth,
        ),
      ).toBe(true);
      const initial = state();
      await expect(reading).toHaveText("Ready for review");
      const beforePage = await underlying();
      await readReportByTouch(panel, mark);
      await tapWhereShown(mark);
      await expect(question).toBeVisible();
      await expect(choice("Keep open")).toBeFocused();
      await readReportByTouch(panel, choice("Mark as done"));
      await readReportByTouch(panel, choice("Keep open"));
      await readReportByTouch(panel, question.getByRole("paragraph").first());
      expect(state()).toEqual(initial);
      passive(native, since);

      // An unanswered question survives reduced height, enlargement and rotation.
      for (const view of [
        { width: 390, height: 240 },
        { width: 390, height: 844 },
        { width: 844, height: 390 },
        { width: 390, height },
      ]) {
        await resizeUntilArranged(panel, view);
        await expect(question).toHaveCount(1);
        await expect(
          panel.getByRole("heading", { name: title }),
        ).toHaveAccessibleName(title);
        await expect(panel.locator(".side-panel-names code")).toHaveCount(0);
        await readReportByTouch(panel, question.getByRole("paragraph").first());
        for (const name of ["Mark as done", "Keep open"]) {
          await readReportByTouch(panel, choice(name));
          expect(await reportGeometry(choice(name))).toMatchObject({
            visible: true,
            hit: true,
          });
        }
        expect(state()).toEqual(initial);
        await expect(reading).toHaveText("Ready for review");
        passive(native, since);
      }
      await readReportByTouch(panel, choice("Keep open"));
      await tapWhereShown(choice("Keep open"));
      await expect(question).toHaveCount(0);
      await expect(mark).toBeFocused();
      expect(state()).toEqual(initial);
      await expect(reading).toHaveText("Ready for review");
      passive(native, since);
      expect(await underlying()).toEqual(beforePage);
      expect(existsSync(workspace)).toBe(false);
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
      const close = panel.getByRole("button", { name: "Close", exact: true });
      await readReportByTouch(panel, close);
      await tapWhereShown(close);
      await expect(panel).toHaveCount(0);
      await expect(open).toBeFocused();
      expect(state()).toEqual(initial);

      // Reopening still needs the same explicit answer; only the coordinate tap
      // below records Done and performs its native operation.
      await page.keyboard.press("Enter");
      await expect(reportText).toHaveText(report);
      await readReportByTouch(panel, mark);
      await tapWhereShown(mark);
      await expect(question).toHaveCount(1);
      await readReportByTouch(panel, question.getByRole("paragraph").first());
      await readReportByTouch(panel, choice("Mark as done"));
      expect(state()).toEqual(initial);
      passive(native, since);
      await tapWhereShown(choice("Mark as done"));
      await expect(panel).toHaveCount(0);
      await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeDefined();
      expect(stored(dashboard.home)[0]?.reportRead).toBe(initial.reportRead);
      expect(
        native.calls
          .slice(since)
          .filter((call) => call.method === "thread/name/set"),
      ).toEqual([
        {
          method: "thread/name/set",
          params: { threadId: sessionId, name: `done-${record.session.name}` },
        },
      ]);
      // This saved history has no working turn: Done must invent no interrupt.
      expect(
        native.calls
          .slice(since)
          .filter((call) => call.method === "turn/interrupt"),
      ).toEqual([]);
      expect(native.names.get(sessionId)).toBe(`done-${record.session.name}`);
      expect(await underlying()).toEqual(beforePage);
      expect(existsSync(workspace)).toBe(false);
      await expect(
        parts(page)
          .recentlyDone.getByRole("article")
          .filter({ hasText: sessionId }),
      ).toContainText("Done");
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
      dashboard,
      codexProtocol,
    }) => {
      const {
        workspace,
        native,
        since,
        open,
        panel,
        reportText,
        mark,
        question,
      } = await openUnfinishedReport(page, dashboard, codexProtocol, journey);
      const initial = stored(dashboard.home)[0];
      await expect(reportText).toHaveText(report);
      expect(await reportGeometry(reportText)).toMatchObject({
        visible: true,
        hit: true,
      });
      const press = hasTouch ? tapWhereShown : pressWhereShown;
      await press(mark);
      for (const target of [
        question.getByRole("paragraph").first(),
        question.getByRole("button", { name: "Mark as done" }),
        question.getByRole("button", { name: "Keep open" }),
      ]) {
        expect(await reportGeometry(target)).toMatchObject({
          visible: true,
          hit: true,
        });
      }
      await press(question.getByRole("button", { name: "Keep open" }));
      await expect(question).toHaveCount(0);
      await expect(mark).toBeFocused();
      await press(mark);
      await expect(
        question.getByRole("button", { name: "Keep open" }),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(question).toHaveCount(0);
      await expect(mark).toBeFocused();
      await page.keyboard.press("Meta+Shift+Escape");
      await expect(panel).toHaveCount(0);
      await expect(open).toBeFocused();
      expect(stored(dashboard.home)[0]).toEqual(initial);
      expect(existsSync(workspace)).toBe(false);
      passive(native, since);
    });
  });
}
