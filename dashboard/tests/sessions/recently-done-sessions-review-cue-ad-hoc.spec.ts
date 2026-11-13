// Real published completion, confirmed association and local review saves.
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  expect,
  queuedCodexPreviewTest as test,
} from "../support/preparationPage.ts";
import { retainAdHocCompletedStory } from "../support/adHocCompletedAssociation.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { git } from "../support/storyReviewWorktree.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import {
  doneCard,
  expectReviewed,
  markAsReviewed,
  openRecentlyDone,
  reviewSaveFailure,
  unreview,
} from "../recentlyDoneReviewState.ts";
import {
  recentlyDoneParts,
  expectSessionReviewCue,
} from "../recentlyDoneSessionsSidebarPage.ts";
import {
  openSessionsSidebar,
  sessionsSidebarParts,
  unreadSessionReport,
} from "../sessionsSidebarPage.ts";
import { storyReviewStateEndpoint } from "../../src/storyReviewState.ts";
import {
  setColorScheme,
  expectFocusReadable,
} from "../systemAppearanceReading.ts";
import { parts } from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import { expectReadableContrast } from "../accessibleReading.ts";
import { finalReportText } from "../finalReportPages.ts";

test.use({ preparationHost: "codex" });

test("confirmed Ad hoc and repeated story sessions share review changes while unread, selection, report and failed saves keep their meanings", async ({
  page,
  dashboard,
  origin,
}) => {
  // The real claim, completion, publication and retirement are this case's
  // independent association proof, rather than a supplied linked answer.
  test.setTimeout(90_000);
  const title =
    "Ad hoc completed session with a long title that remains readable in session details";
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title,
    landing: { repository: path.join(origin.project, ".git") },
  });
  const secondTitle = "Another session of the same completed story";
  const message = "Completed the shared story.";
  const second = makeMe.aLaunchRecord
    .executing({ identity: linked.identity, title: secondTitle })
    .inClaudeSession({
      sessionId: "shared-review-report",
      shortId: "review-report",
    })
    .onStoryBranch({
      workspace: path.join(origin.machine, "retired-report"),
      branch: "claude/shared-review",
    })
    .completedWith({ message })
    .launchedAt(new Date(Date.now() - 120_000).toISOString())
    .markedDoneAt(new Date(Date.now() - 90_000).toISOString())
    .please();
  const unreadTitle = "Unread open session of the completed story";
  const unread = makeMe.aLaunchRecord
    .executing({ identity: linked.identity, title: unreadTitle })
    .inClaudeSession({
      sessionId: "unread-open-review-report",
      shortId: "unread-review",
    })
    .onStoryBranch({
      workspace: path.join(origin.machine, "retired-unread-report"),
      branch: "claude/unread-review",
    })
    .completedWith({ message: "A report that has not been acknowledged." })
    .launchedAt(new Date(Date.now() - 120_000).toISOString())
    .please();
  keepLaunchRecords(dashboard, [linked.record, second, unread]);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.setViewportSize({ width: 1600, height: 900 });
  await openRecentlyDone(page);
  await openSessionsSidebar(page);
  const shown = recentlyDoneParts(page);
  await shown.header.click();
  const a = doneCard(page, linked.title);
  await expectReviewed(a, false);
  for (const name of [title, secondTitle]) {
    await expectSessionReviewCue(shown.row(name), true);
    await expect(shown.entry(name)).toHaveAttribute("aria-pressed", "false");
  }
  await expect(shown.entry(title)).toHaveAttribute(
    "title",
    /Open Dough · Ad hoc/,
  );
  await expect(parts(page).recentlyDone).not.toHaveAttribute(
    "data-selected-story",
  );
  expect(dashboard.claudeAttaches()).toEqual([]);

  await shown.entry(secondTitle).click();
  await expect(shown.row(secondTitle)).toHaveClass(/\bchosen\b/);
  await expectSessionReviewCue(shown.row(secondTitle), true);
  // Mark as done acknowledges a session's report (COMPLETION.md). Actual
  // unread reports therefore belong to the open list; reading one remains
  // independent of the completed story's review and its selected Done row.
  const open = sessionsSidebarParts(page);
  const unreadMark = unreadSessionReport(open.row(unreadTitle));
  await expect(unreadMark).toBeVisible();
  await open.entry(unreadTitle).click();
  await expect(finalReportText(page)).toHaveText(
    "A report that has not been acknowledged.",
  );
  await expect(unreadMark).toBeVisible();
  await expectSessionReviewCue(shown.row(secondTitle), true);

  await showColumn(page, "Recently done");
  const endpoint = `**${storyReviewStateEndpoint}?*`;
  await page.route(endpoint, (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 502,
          json: { error: "Cannot save the local review." },
        })
      : route.fallback(),
  );
  await markAsReviewed(a).click();
  await expect(
    reviewSaveFailure(a, "The review state could not be saved."),
  ).toBeVisible();
  for (const name of [title, secondTitle])
    await expectSessionReviewCue(shown.row(name), true);
  await page.unroute(endpoint);
  await markAsReviewed(a).click();
  await expectReviewed(a, true);
  for (const name of [title, secondTitle])
    await expectSessionReviewCue(shown.row(name), false);
  await unreview(a).click();
  for (const name of [title, secondTitle])
    await expectSessionReviewCue(shown.row(name), true);
  await expect(finalReportText(page)).toHaveText(
    "A report that has not been acknowledged.",
  );
  await expect(shown.row(secondTitle)).toHaveClass(/\bchosen\b/);

  for (const scheme of ["light", "dark"] as const) {
    await setColorScheme(page, scheme);
    await expectSessionReviewCue(shown.row(title), true);
    await expect(shown.reviewCue(title)).toHaveCSS(
      "color",
      scheme === "light" ? "rgb(155, 28, 28)" : "rgb(240, 168, 168)",
    );
    await expectReadableContrast(shown.reviewCue(title));
    await shown.header.focus();
    await page.keyboard.press("Tab");
    await expect(shown.entry(title)).toBeFocused();
    await expectFocusReadable(page, shown.entry(title));
    await page.keyboard.press("Tab");
    await expect(shown.open(title)).toBeFocused();
    await expectFocusReadable(page, shown.open(title));
  }
});
