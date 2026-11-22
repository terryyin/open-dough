import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { expectEveryControlReachable } from "../../dashboard/test-support/pageLayout.ts";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import {
  expectStillHolds,
  sidePanelWidthPage,
  usableMinimum,
  wideWindow,
} from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keptSession } from "../../dashboard/test-support/support/sidePanelContents.ts";
import { terminalScreen } from "../../dashboard/test-support/terminalScreen.ts";
import { terminalScreenParts } from "../../dashboard/test-support/terminalScreenPage.ts";
import { expect, test } from "./side-panel-width-fixture.ts";

test("terminal fits the chosen width and keeps its attachment through both covering layouts", async ({
  dashboard,
  page,
  storyA: { title, sessionId },
  origin,
}) => {
  const view =
    await test.step("Given a published Board with Story A's session", async () => {
      await openBacklog(page, origin);
      return sidePanelPages(page);
    });
  const { screen, width, open, attachments, kept } =
    await test.step("And I can attach to Story A's terminal", async () => {
      const shortId = sessionId.slice(0, 8);
      return {
        screen: terminalScreen(page),
        width: sidePanelWidthPage(page),
        open: () =>
          view.phase("Attach to Story A's terminal", ({ board }) =>
            board
              .storyCard(title)
              .openTerminal()
              .expectText(`attached ${shortId}`),
          ),
        attachments: () =>
          dashboard.claudeAttaches().filter(({ id }) => id === shortId),
        kept: await keptSession(dashboard, sessionId),
      };
    });
  await test.step("When I attach the terminal and type a line", async () => {
    await open();
    await screen.typeLine("keep this line");
  });
  const initial =
    await test.step("Then the attached terminal echoes the line at its starting width", async () => {
      await screen.expectText("echo keep this line");
      expect(attachments()).toHaveLength(1);
      return {
        width: await view.shownWidth(),
        columns: await startingColumns(screen.panel, sessionId),
      };
    });
  const chosen =
    await test.step("When I drag the divider 200 pixels wider", async () => {
      const chosen = initial.width + 200;
      await view.phase("Drag the Panel divider", ({ panelDivider }) =>
        panelDivider.drag(-200),
      );
      return chosen;
    });
  await test.step("Then the wider terminal fits more columns and still holds the line", async () => {
    await view.phase("The wider split fits", ({ panelDivider }) =>
      panelDivider.expectSidePanelWidth(chosen),
    );
    await expect
      .poll(() => widestResize(screen.panel))
      .toBeGreaterThan(initial.columns);
    await expectStillHolds(screen.panel, "echo keep this line");
  });

  await test.step("When I press Left twice with the terminal focused", async () => {
    await screen.clickScreen();
    await screen.pressKey("ArrowLeft");
    await screen.pressKey("ArrowLeft");
  });
  await test.step("Then the panel retains its chosen width", () =>
    width.expectWidth(screen.panel, chosen));
  await test.step("When I clear the terminal input", () =>
    screen.pressKey("Control+u"));
  await test.step("And I maximize and restore the terminal", () =>
    view.phase("Maximize and Restore", ({ sidePanel }) =>
      sidePanel.maximize().expectMaximized().restore(),
    ));
  await test.step("Then Restore resumes the preferred split", () =>
    view.phase("The preferred split returns", ({ panelDivider }) =>
      panelDivider.expectSidePanelWidth(chosen),
    ));

  await test.step("When I narrow the window to 420 pixels", () =>
    page.setViewportSize({ width: 420, height: 900 }));
  await test.step("Then the terminal covers the window and its controls stay reachable", async () => {
    await width.expectCoveringFillsWindow(screen.panel, parts(page));
    await expectEveryControlReachable(screen.panel);
    await expect(terminalScreenParts(screen.panel).heading).toBeInViewport();
  });
  await test.step("And its first attachment still holds the earlier line", async () => {
    await expectStillHolds(screen.panel, "echo keep this line");
    expect(attachments()).toHaveLength(1);
  });
  await test.step("When I widen the window", () =>
    page.setViewportSize(wideWindow));
  await test.step("Then the preferred terminal width returns", () =>
    width.expectWidth(screen.panel, chosen));
  await test.step("When I open the Sessions sidebar", () =>
    view.phase("Story A is current in Sessions", ({ sessionsSidebar }) =>
      sessionsSidebar.toggle().expectShown().expectEntryCurrent(title),
    ));
  await test.step("And I narrow the window to 900 pixels", () =>
    page.setViewportSize({ width: 900, height: 900 }));
  await test.step("Then the terminal covers the page column beside Sessions", async () => {
    await width.expectCovering(screen.panel);
    expect((await view.shownRoom()).x).toBeCloseTo(288, 0);
  });
  await test.step("When I refocus the terminal and type a second line", async () => {
    await screen.focusInput();
    await screen.typeLine("same attachment");
  });
  await test.step("Then the first attachment receives and echoes the second line", async () => {
    await expect
      .poll(() => attachments()[0]?.lines)
      .toEqual(["keep this line", "same attachment"]);
    await screen.expectText("echo same attachment");
  });
  await test.step("When I widen the window with Sessions still open", () =>
    width.resizeUntilArranged(screen.panel, wideWindow));
  await test.step("Then the terminal fits the room left by Sessions", () =>
    width.expectWidth(
      screen.panel,
      Math.min(chosen, wideWindow.width - 288 - usableMinimum),
    ));
  await test.step("When I close the Sessions sidebar", () =>
    view.phase("Close Sessions", ({ sessionsSidebar }) =>
      sessionsSidebar.toggle().expectHidden(),
    ));
  await test.step("Then the terminal recovers the chosen width and retains its earlier output", async () => {
    await view.phase("The chosen split returns", ({ panelDivider }) =>
      panelDivider.expectSidePanelWidth(chosen),
    );
    await expectStillHolds(screen.panel, "echo keep this line");
  });
  await test.step("And the original attachment and kept session are intact", async () => {
    expect(attachments()).toHaveLength(1);
    expect(attachments()[0]?.endedBy).toBeUndefined();
    expect(await keptSession(dashboard, sessionId)).toEqual(kept);
  });

  await test.step("When I close and reopen the terminal", async () => {
    await screen.close();
    await screen.expectClosed();
    await open();
  });
  await test.step("Then the new attachment uses the chosen split", async () => {
    await width.expectWidth(screen.panel, chosen);
    await width.expectDividerSays(chosen);
    expect(attachments()).toHaveLength(2);
  });
});

async function startingColumns(
  panel: ReturnType<typeof terminalScreen>["panel"],
  sessionId: string,
) {
  const output = await terminalScreenParts(panel).rows.textContent();
  const attached = new RegExp(`attached ${sessionId.slice(0, 8)} (\\d+)x\\d+`);
  const columns = Number(output?.match(attached)?.[1] ?? 0);
  expect(columns).toBeGreaterThan(0);
  return columns;
}

async function widestResize(panel: ReturnType<typeof terminalScreen>["panel"]) {
  const output = await terminalScreenParts(panel).rows.textContent();
  const sizes = (output ?? "").matchAll(/resized (\d+)x\d+/g);
  return Math.max(0, ...Array.from(sizes, (match) => Number(match[1])));
}
