// An attached terminal stays one session while the developer reshapes the
// page around it: a chosen Side panel width, a perspective change, a window
// narrow enough for the terminal to cover the page, browser history beneath
// it, and a reload. Story A's session is listed by the synthetic `claude`,
// which records every attachment and the lines it receives. Width limits,
// Maximize, the Sessions sidebar's room and refused storage belong to the
// mounted Side panel width specs in Dashboard Frontend Test.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import {
  expectStillHolds,
  sidePanelWidthPage,
  wideWindow,
} from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { listed } from "../../dashboard/test-support/support/sidePanelContents.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import {
  branch,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { terminalScreen } from "../../dashboard/test-support/terminalScreen.ts";

const title = "Story A";

test.use({ viewport: wideWindow });

test("the terminal keeps its session and my chosen width through Intent, a covering window, history and reload", async ({
  dashboard,
  page,
  origin,
}) => {
  const view = sidePanelPages(page);
  const screen = terminalScreen(page);
  const width = sidePanelWidthPage(page);
  const { attachments, open } =
    await test.step("Given Story A's working session", () => {
      const { workspace } = storyWorktree(origin);
      const sessionId = dashboard.claudeListsSession({
        name: title,
        cwd: workspace,
        startedAt: Date.now(),
      });
      keepLaunchRecords(dashboard, [
        makeMe.aLaunchRecord
          .executing({ identity: queuedIdentity, title })
          .onStoryBranch({ workspace, branch })
          .inClaudeSession(listed(sessionId))
          .please(),
      ]);
      const shortId = sessionId.slice(0, 8);
      return {
        attachments: () =>
          dashboard.claudeAttaches().filter(({ id }) => id === shortId),
        open: () =>
          view.phase("Attach to Story A's terminal", ({ board }) =>
            board
              .storyCard(title)
              .openTerminal()
              .expectText(`attached ${shortId}`),
          ),
      };
    });

  await test.step("When I attach the terminal from the Board and type a line", async () => {
    await openBacklog(page, origin);
    await open();
    await screen.typeLine("keep this line");
  });
  await test.step("Then the session echoes the line", () =>
    screen.expectText("echo keep this line"));
  const chosen =
    await test.step("When I drag the divider 200 pixels wider", async () => {
      const chosen = (await view.shownWidth()) + 200;
      await view.phase("The wider split holds", ({ panelDivider }) =>
        panelDivider.drag(-200).expectSidePanelWidth(chosen),
      );
      return chosen;
    });

  await test.step("When I read Intent beside the terminal", () =>
    view.phase(
      "Intent reads Story A beside its terminal",
      ({ perspective, intent, terminal }) => {
        perspective.choose("Intent").expectChosen("Intent");
        intent.expectSelectedStory(queuedIdentity);
        terminal.expectText("echo keep this line");
      },
    ));
  await test.step("And I narrow the window until the terminal covers the page", async () => {
    await page.setViewportSize({ width: 420, height: wideWindow.height });
    await width.expectCovering(screen.panel);
  });
  await test.step("And I go Back to Development under the terminal", async () => {
    await page.goBack();
    await expect(page.locator(".page-column .intent-perspective")).toHaveCount(
      0,
    );
  });
  await test.step("Then the covering terminal still holds the line", async () => {
    await width.expectCovering(screen.panel);
    await expectStillHolds(screen.panel, "echo keep this line");
  });
  await test.step("When I widen the window again", () =>
    page.setViewportSize(wideWindow));
  await test.step("Then my chosen width returns", () =>
    width.expectWidth(screen.panel, chosen));
  await test.step("When I type a second line", async () => {
    await screen.focusInput();
    await screen.typeLine("same attachment");
  });
  await test.step("Then the one attachment received both lines", async () => {
    await screen.expectText("echo same attachment");
    await expect
      .poll(() => attachments().map(({ lines }) => lines))
      .toEqual([["keep this line", "same attachment"]]);
  });

  await test.step("When I reload and attach the terminal again", async () => {
    await page.reload();
    await open();
  });
  await test.step("Then the new attachment opens at my chosen width", async () => {
    await width.expectWidth(screen.panel, chosen);
    await width.expectDividerSays(chosen);
    expect(attachments()).toHaveLength(2);
  });
});
