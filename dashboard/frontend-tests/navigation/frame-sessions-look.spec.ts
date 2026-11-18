// The Sessions sidebar and the terminal's header in the frame's look: the
// open sidebar's Sessions button, its entries' words, and the header's title,
// session row, and icon controls read clearly and keep their names, and both
// fit a narrow and a zoomed window without sideways scrolling. An entry's
// title is cut by design (../sessions/sessions-sidebar-row.spec.ts), the panel
// header title truncates by design with disclosure (../../src/SidePanelTitle.tsx),
// and the terminal's own screen is its contents, not this look's. The
// attached-terminal substitute answers the long-titled session's terminal.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { cardSession } from "../../test-support/support/frontendCardSessions.ts";
import { putFrontendStories } from "../../test-support/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendTerminalSubstitute.ts";
import { takenStory } from "../../test-support/launchJourney.ts";
import { control as frameControl } from "../../test-support/sidePanelFrame.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../test-support/terminalScreenPage.ts";
import {
  expectReadableContrast,
  narrowWindow,
  zoomedWindow,
} from "../../test-support/accessibleReading.ts";
import { expectSettledPage } from "../../test-support/dashboardPage.ts";
import { expectFrameIconControl } from "../../test-support/frameIconControl.ts";
import {
  box,
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "../../test-support/pageLayout.ts";
import {
  sessionsSidebarParts,
  sessionsSidebarTitleCut,
} from "../../test-support/sessionsSidebarPage.ts";
import {
  expectClosedToggleCounts,
  expectClosedToggleCountsFit,
} from "../../test-support/sessionsTogglePage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const title = `A long story title that the narrow sidebar cuts ${"and goes on ".repeat(4)}to its end`;
const panelTitle = ".side-panel-title-toggle";
const terminalScreen = ".terminal-screen";

test("the Sessions sidebar and terminal read clearly, keep their names, and fit a narrow and a zoomed window", async ({
  page,
  frontendServices,
}) => {
  // A working long-titled session, and one that needs input for the badge.
  putFrontendStories(frontendServices, { notRefinedTitle: title });
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        cardSession(
          "Execution",
          title,
          makeMe.aSessionState.loaded("working").please(),
        ),
        cardSession(
          "Execution",
          takenStory,
          makeMe.aSessionState
            .loaded("waiting")
            .waitingFor("input needed")
            .please(),
        ),
      )
      .please(),
  );
  await installAttachedTerminalSubstitute(page);
  await page.setViewportSize(narrowWindow);
  await page.goto("/");
  await expectSettledPage(page);
  const { sidebar, button, entries, entry, heading } =
    sessionsSidebarParts(page);
  const panel = terminalPanel(page);
  const control = (name: string) => frameControl(panel, name);
  await expectClosedToggleCounts(page, 1, 1);
  await expectClosedToggleCountsFit(page);
  await button.click();
  await expect(entries).toHaveCount(2);

  await test.step("the open sidebar's button, heading, and entry read clearly", async () => {
    await expectFrameIconControl(button, "Sessions", "Sessions (⌘B)");
    await expectReadableContrast(heading);
    await expectReadableContrast(entries.first().getByRole("heading"));
    await expectReadableContrast(entries.first().locator("time"));
    for (const size of [narrowWindow, zoomedWindow]) {
      await page.setViewportSize(size);
      await expect(sidebar).toBeVisible();
      await expectNoSidewaysScrollAndWholeText(page, [
        sessionsSidebarTitleCut,
        ...compactProjectSelectCut,
      ]);
    }
    await page.setViewportSize(narrowWindow);
  });

  await test.step("the terminal header's words and icon controls read clearly and keep their names", async () => {
    await entry(title).click();
    await expect(terminalScreenParts(panel).rows).toContainText("attached");
    await expectReadableContrast(
      panel.getByRole("heading", { level: 2, name: title }),
    );
    await expectReadableContrast(panel.getByText(/^Execution session$/));
    await expectFrameIconControl(control("Mark as done"), "Mark as done");
    await expectFrameIconControl(control("Close"), "Close", "Close (⌘⇧Esc)");
    // Narrow covering offers no Maximize; Close remains the route back.
    await expect(control("Maximize")).toHaveCount(0);
    await expect(control("Restore")).toHaveCount(0);
    for (const size of [narrowWindow, zoomedWindow]) {
      await page.setViewportSize(size);
      await expect(control("Close")).toBeVisible();
      await expect(control("Maximize")).toHaveCount(0);
      // The terminal refits its own screen to the narrower window shortly
      // after the window narrows; the frame is checked once it has.
      await expect
        .poll(async () => {
          const [screen, rows] = await Promise.all([
            box(panel.locator(terminalScreen)),
            box(terminalScreenParts(panel).screen),
          ]);
          return rows.x + rows.width <= screen.x + screen.width + 0.5;
        })
        .toBe(true);
      await expectNoSidewaysScrollAndWholeText(page, [
        sessionsSidebarTitleCut,
        panelTitle,
        terminalScreen,
        ...compactProjectSelectCut,
      ]);
    }
  });
});
