// The page's own width decides how many dashboard columns show, so the side
// panel opening and closing pages them as a window would: beside it a 54rem
// page shows two columns and an edge control naming the hidden one, a move
// slides the view, the chosen position comes back where the width allows it,
// and a new session counts on the control that names Recent sessions. How a
// narrow window pages the columns is ./dashboard-columns-paging.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
} from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import { box } from "./pageLayout.ts";
import {
  columns,
  edgeControl,
  expectCardsKeepTheirShare,
  expectView,
  recordSlides,
  rem,
  slidesOf,
  type ColumnName,
} from "./dashboardColumnsPage.ts";
import { scrollsOnItsOwn } from "./sidePanelWidthPage.ts";

test.describe("beside the side panel", () => {
  let journey: LaunchJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    journey = await publishLaunchJourney();
  });
  test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

  test.use({ projectFolders: ["open-dough"] });

  // A 108rem window, which the side panel leaves a 54rem page.
  test.use({ viewport: { width: 108 * rem, height: 900 } });

  test("a 54rem page shows two columns and pages between them; a wider page shows all three and gives the view back", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { start, dialog } = await openTakenBacklog(page, journey);
    const terminal = page.getByRole("region", { name: "Terminal" });
    const { recentSessions } = parts(page);
    // The view, beside a terminal whose screen scrolls on its own.
    const expectShown = (
      shown: readonly ColumnName[],
      controls: readonly string[],
    ) => expectView(page, shown, controls, scrollsOnItsOwn);
    await recordSlides(page);

    await test.step("a 108rem page shows all three and no edge control", async () => {
      await expectShown(columns, []);
    });

    await test.step("the side panel opens, leaving 54rem: Backlog and Taken fill the page, and the right control names Recent sessions", async () => {
      const project = startSessionDialog(page, "Open Dough");
      await startSession(page, "Open Dough").click();
      await project.getByRole("button", { name: "Start" }).click();
      await expect(terminal.locator(".xterm-rows")).toContainText("attached");
      expect((await box(page.locator(".page-column"))).width).toBeCloseTo(
        54 * rem,
        0,
      );
      await expectShown(["Backlog", "Taken"], ["Recent sessions 1 entry"]);
      await expectCardsKeepTheirShare(page, 2);
    });

    await test.step("the right control shows Taken and Recent sessions, with a slide, and the left control names Backlog", async () => {
      await edgeControl(page, "Recent sessions").click();
      await expectShown(["Taken", "Recent sessions"], ["Backlog 2 entries"]);
      expect(await slidesOf(page)).toBe(1);
    });

    await test.step("the side panel closes: all three show and both controls go", async () => {
      await terminal.getByRole("button", { name: "Close" }).click();
      await expect(terminal).toHaveCount(0);
      await expectShown(columns, []);
    });

    await test.step("the side panel reopens: Taken and Recent sessions show again", async () => {
      await recentSessions
        .getByRole("button", { name: "Open terminal" })
        .click();
      await expect(terminal.locator(".xterm-rows")).toContainText("attached");
      await expectShown(["Taken", "Recent sessions"], ["Backlog 2 entries"]);
    });

    await test.step("a session started from a Backlog card counts on the right control, and the view stays", async () => {
      await edgeControl(page, "Backlog").click();
      await expectShown(["Backlog", "Taken"], ["Recent sessions 1 entry"]);
      await start(readyStory).click();
      await dialog.getByRole("button", { name: "Start" }).click();
      await expect(edgeControl(page, "Recent sessions")).toHaveText(
        "Recent sessions 2 entries",
      );
      await expectShown(["Backlog", "Taken"], ["Recent sessions 2 entries"]);
    });
  });
});
