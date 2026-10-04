// The page's one side panel switches between a story's review and a
// session's terminal, of Story A's and Story B's real worktrees
// (./support/storyPanels.ts) and kept launch records: Story A's session is
// listed by the synthetic `claude` (./fixtures/fake-claude). Whatever opens,
// by a card's or the Sessions sidebar's own controls, the panel shows exactly
// one named item beside a dashboard that stays usable. A review replaces the
// terminal, which detaches without ending the session or marking it done, and
// opening that session again attaches to the same session. Review and
// terminal share the panel's frame icon controls, maximize into the same
// room, and any change of content returns the normal split. The real
// `claude` is never reached.

import type { Locator } from "@playwright/test";
import { storyReviewEndpoint } from "../src/storyReview.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import { box, pressWhereShown } from "./pageLayout.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { otherQueuedIdentity } from "./support/startOrigin.ts";
import {
  keptSession,
  listed,
  panelItems,
  storyBLaunchRecord,
  storyBWorktree,
} from "./support/storyPanels.ts";
import {
  keepLaunchRecords,
  storyALaunchRecord,
  storyWorktree,
} from "./support/storyReviewWorktree.ts";

function expectCovers(
  found: { x: number; y: number; width: number; height: number },
  room: { x: number; y: number; width: number; height: number },
) {
  expect(found.x).toBeCloseTo(room.x, 0);
  expect(found.y).toBeCloseTo(room.y, 0);
  expect(found.width).toBeCloseTo(room.width, 0);
  expect(found.height).toBeCloseTo(room.height, 0);
}

test("review and terminal take turns in the one side panel beside a usable dashboard", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace: workspaceA } = storyWorktree(origin);
  const workspaceB = storyBWorktree(origin.project);
  const sessionA = dashboard.claudeListsSession({
    name: "Story A",
    cwd: workspaceA,
    startedAt: Date.now(),
  });
  await keepLaunchRecords(dashboard, [
    storyALaunchRecord(workspaceA, listed(sessionA)),
    storyBLaunchRecord(workspaceB),
  ]);
  // Every review read the page asks, by the story it names.
  const reviewReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === storyReviewEndpoint)
      reviewReads.push(url.searchParams.get("identity") ?? "");
  });
  const cardA = await openBacklog(page, origin);
  const cardB = parts(page).backlog.getByRole("article", { name: "Story B" });
  const { banner } = parts(page);
  const sidebar = sidebarParts(page);
  const items = panelItems(page);
  const terminal = page.getByRole("region", { name: "Terminal" });
  const review = page.getByRole("region", { name: "Review changes" });
  const rows = terminal.locator(".xterm-rows");
  const reviewOf = (card: Locator) =>
    card.getByRole("button", { name: "Review changes" });
  const openTerminal = cardSessions(cardA).getByRole("button", {
    name: "Open terminal",
  });
  const control = (panel: Locator, name: string) =>
    panel.getByRole("button", { name, exact: true });
  const attachesOfA = () =>
    dashboard
      .claudeAttaches()
      .filter((attached) => attached.id === sessionA.slice(0, 8));
  const keptA = await keptSession(dashboard, sessionA);
  expect(keptA.doneAt).toBeUndefined();

  await openTerminal.click();
  await expect(rows).toContainText(`attached ${sessionA.slice(0, 8)}`);
  await expect(items).toHaveCount(1);
  await page.keyboard.type("keep this line");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo keep this line");
  const shownMark = cardSessions(cardA).getByText("Shown in terminal");
  await expect(shownMark).toBeVisible();
  const splitPanel = await box(terminal);
  await pressWhereShown(control(terminal, "Maximize"));
  const maximizedRoom = await box(terminal);
  await pressWhereShown(control(terminal, "Restore"));
  await expect(banner).toBeVisible();

  await test.step("a story's review replaces the terminal, which detaches without ending or marking the session done", async () => {
    await reviewOf(cardB).click();
    await expect(review.getByRole("heading", { level: 2 })).toHaveText(
      "Story B",
    );
    await expect(review).toContainText(`Review changes ${otherQueuedIdentity}`);
    await expect(
      review
        .getByRole("list", { name: "1 changed file" })
        .getByRole("button", { name: "Added story-b.txt" }),
    ).toBeVisible();
    await expect(review.locator(".story-review-body")).toBeFocused();
    await expect(items).toHaveCount(1);
    await expect(terminal).toHaveCount(0);
    expectCovers(await box(review), splitPanel);
    expect(attachesOfA()).toHaveLength(1);
    await expect
      .poll(() =>
        attachesOfA().every((attached) => attached.endedBy !== undefined),
      )
      .toBe(true);
    // A review is no session: no session entry is marked as shown.
    await expect(shownMark).toHaveCount(0);
    await expect(cardA).not.toHaveClass(/in-terminal/);
    expect(await keptSession(dashboard, sessionA)).toEqual(keptA);
  });

  await test.step("the dashboard stays usable beside the review", async () => {
    // Not a modal: the keyboard leaves the review for the page's controls.
    await sidebar.button.click();
    await expect(sidebar.button).toBeFocused();
    await expect(sidebar.sidebar).toBeVisible();
    await expect(sidebar.entry("Story A")).toBeVisible();
    await expect(review.getByRole("heading", { level: 2 })).toHaveText(
      "Story B",
    );
    await expect(items).toHaveCount(1);
  });

  await test.step("the review's header shares the terminal's frame icon controls, maximizes into the terminal's room, and restores its content", async () => {
    await expectFrameIconControl(control(review, "Refresh"), "Refresh");
    await expectFrameIconControl(control(review, "Maximize"), "Maximize");
    await expectFrameIconControl(
      control(review, "Close"),
      "Close",
      "Close (⌘⇧Esc)",
    );
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await review
      .getByRole("button", { name: "Added story-b.txt" })
      .press("Enter");
    await expect(
      review.getByRole("region", { name: "Added story-b.txt" }),
    ).toContainText("+story b");
    const readsBefore = reviewReads.length;
    await pressWhereShown(control(review, "Maximize"));
    await expect(banner).toBeHidden();
    expectCovers(await box(review), maximizedRoom);
    await pressWhereShown(control(review, "Restore"));
    await expect(banner).toBeVisible();
    expectCovers(await box(review), splitPanel);
    await expect(
      review.getByRole("button", { name: "Added story-b.txt" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(reviewReads.length).toBe(readsBefore);
  });

  await test.step("opening the session from the sidebar beside a maximized review attaches to the same session in the normal split", async () => {
    await sidebar.button.click();
    await pressWhereShown(control(review, "Maximize"));
    await expect(banner).toBeHidden();
    const attachedBefore = attachesOfA().length;
    await sidebar.entry("Story A").click();
    await expect(rows).toContainText(`attached ${sessionA.slice(0, 8)}`);
    await expect(items).toHaveCount(1);
    await expect(review).toHaveCount(0);
    await expect(control(terminal, "Maximize")).toBeVisible();
    await expect(banner).toBeVisible();
    expect(attachesOfA()).toHaveLength(attachedBefore + 1);
    await expect(sidebar.entry("Story A")).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(await keptSession(dashboard, sessionA)).toEqual(keptA);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
  });
});
