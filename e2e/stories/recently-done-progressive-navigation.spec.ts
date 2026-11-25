import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
// Native Done returns to a published Taken story. A held reveal of a
// published Done story yields to a later story or project choice.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { pathsRead } from "../../dashboard/test-support/publishedOrigin.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  shownProjectControl,
  chooseProject,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { rem, showColumn } from "../../dashboard/test-support/boardPage.ts";
import { expectEntries } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import {
  openTerminalControl,
  expectTerminalText,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  recordsAsked,
  terminalOf,
  untilPageRests,
} from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import {
  destination,
  openedWithHeldPublishedStory,
  openedWithTakenNativeSession,
  publishedNames,
  publishedPaths,
} from "../../dashboard/test-support/recentlyDoneProgressiveJourney.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import { queuedTitle } from "../../dashboard/test-support/recentlyDoneRecords.ts";
import {
  publishOnePygardonStory,
  pygardonRepository,
} from "../../dashboard/test-support/pygardonProject.ts";

test.use({ projectFolders: ["open-dough"] });

test("a Taken session can open from the sidebar and mark Done on its own card without reading older stories", async ({
  afterGitHubStops,
  page,
  dashboard,
}) => {
  const view =
    await test.step("Given a published Taken story with an active session", async () => {
      await page.setViewportSize({ width: 80 * rem, height: 900 });
      return openedWithTakenNativeSession(page, dashboard, afterGitHubStops);
    });
  await test.step("And the first ten published Done stories are shown", () =>
    expectEntries(view.recent, publishedNames(10)));

  await test.step("When I open the Taken session from the sidebar", async () => {
    const { button, entry } = sessionsSidebarParts(page);
    await button.click();
    await entry(queuedTitle).click();
  });
  const terminal =
    await test.step("Then its terminal is attached", async () => {
      const terminal = terminalOf(page);
      await expectTerminalText(terminal, "attached");
      return terminal;
    });
  await test.step("And the Taken card is in view", () =>
    expect(view.card).toBeInViewport());
  await test.step("When I close the terminal and sidebar", async () => {
    await closeSidePanel(terminal, { using: "mouse" });
    await expect(terminal).toHaveCount(0);
    await sessionsSidebarParts(page).button.click();
  });
  await test.step("And mark the session Done with its history open", async () => {
    await view.showDoneHistory();
    await view.markDone();
  });
  await test.step("Then the Taken card holds the focused Done session", async () => {
    await view.showsFocusedDoneSession();
    await expect(view.card).toBeVisible();
  });
  await test.step("And Recently done reads only the first ten stories", async () => {
    await expectEntries(view.recent, publishedNames(10));
    await untilPageRests(page);
    expect(recordsAsked(view.github).toSorted()).toEqual(
      publishedPaths(10).toSorted(),
    );
  });
});

const terminalLayouts = [
  { name: "beside the Board", width: 80 * rem },
  {
    name: "covering the Taken column",
    width: 40 * rem,
    observe: (view: Awaited<ReturnType<typeof openedWithTakenNativeSession>>) =>
      expect(view.recent).not.toBeInViewport(),
  },
];

for (const { name, width, observe } of terminalLayouts) {
  test(`Mark as done in a terminal ${name} returns to the Taken story`, async ({
    afterGitHubStops,
    page,
    dashboard,
  }) => {
    const view =
      await test.step("Given a published Taken story with an active session", async () => {
        await page.setViewportSize({ width, height: 800 });
        return openedWithTakenNativeSession(page, dashboard, afterGitHubStops);
      });
    await test.step("And the first ten published Done stories are shown", () =>
      expectEntries(view.recent, publishedNames(10)));
    await test.step("When I open the Taken story's history", async () => {
      await showColumn(page, "Taken");
      await view.showDoneHistory();
    });
    const terminal =
      await test.step("And open the session terminal", async () => {
        await openTerminalControl(view.activeSession).click();
        return terminalOf(page);
      });
    await test.step("Then the terminal attaches in the selected layout", async () => {
      await expectTerminalText(terminal, "attached");
      await observe?.(view);
    });
    await test.step("When I mark the session Done in the terminal", () =>
      view.markDone(terminal));
    await test.step("Then the terminal closes and focus returns to Done history", async () => {
      await expect(terminal).toHaveCount(0);
      await view.showsFocusedDoneSession();
      await expect(view.card).toBeInViewport();
    });
    await test.step("And Recently done reads only the first ten stories", async () => {
      await untilPageRests(page);
      expect(recordsAsked(view.github).toSorted()).toEqual(
        publishedPaths(10).toSorted(),
      );
    });
  });
}

test("selecting another story during a held session reveal preserves the new selection and keyboard", async ({
  afterGitHubStops,
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const view = await openedWithHeldPublishedStory(
    page,
    dashboard,
    afterGitHubStops,
    "Done story session",
  );
  const selectedSession = await view.chooseSession();
  await view.showsPendingDestination();
  await expect(selectedSession).toHaveAttribute("aria-pressed", "true");
  const card = parts(page).backlog.getByRole("article").first();
  await card.click();
  await expect(card).toBeFocused();
  view.release();
  await expectEntries(view.recent, publishedNames(destination));
  await untilPageRests(page);
  await expect(selectedSession).toHaveAttribute("aria-pressed", "false");
  await expect(card).toBeFocused();
});

test("choosing another project before the entries before it are read shows that project, which nothing pulls back, and Open Dough starts again at ten", async ({
  afterGitHubStops,
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const pygardon = await publishOnePygardonStory(page, afterGitHubStops);
  const view = await openedWithHeldPublishedStory(
    page,
    dashboard,
    afterGitHubStops,
    "Done story session",
  );
  const { backlog } = parts(page);
  await view.chooseSession();
  await view.showsPendingDestination();
  // The demand's records have all been asked for, the held one still
  // unanswered; leaving Open Dough abandons the read, which would otherwise
  // stop asking part way through.
  await expect
    .poll(() => recordsAsked(view.github).toSorted())
    .toEqual(publishedPaths(destination).toSorted());
  await chooseProject(page, "Pygardon");
  await expect(backlog).toContainText("A Pygardon story");
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl(pygardonRepository),
      "refs/heads/main",
      {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      },
    ),
  ).toBe(pygardon.revisions.published);
  expect(pathsRead(pygardon)).toContain(
    `PRODUCT-BACKLOG.md?ref=${pygardon.revisions.published}`,
  );
  view.release();
  await untilPageRests(page);
  await expect(shownProjectControl(page)).toBeFocused();
  await chooseProject(page, "Open Dough");
  await expectEntries(view.recent, publishedNames(10));
  expect(recordsAsked(view.github).toSorted()).toEqual(
    publishedPaths(destination).toSorted(),
  );
});
