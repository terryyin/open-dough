// After worktree/branch retirement and trunk advance, selecting the retained
// ad hoc row reaches the story's historical Review and Intent coverage
// (../../src/recentlyDoneSelection.ts) without rewriting Ad hoc. Reuses the
// real completion publish path (../support/adHocCompletedAssociation.ts) and
// Intent review helpers (../support/intentStoryPage.ts).
import {
  expect,
  queuedCodexPreviewTest as test,
} from "../support/preparationPage.ts";
import { parts } from "../dashboardPage.ts";
import { shortRevision } from "../dashboardParts.ts";
import { recentlyDoneParts } from "../recentlyDoneSessionsSidebarPage.ts";
import { openSessionsSidebar } from "../sessionsSidebarPage.ts";
import { retainAdHocCompletedStory } from "../support/adHocCompletedAssociation.ts";
import {
  chooseStoryTab,
  openReviewFromIntent,
  storyHeaderReading,
  storyTitle,
} from "../support/intentStoryPage.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { git, writeAt } from "../support/storyReviewWorktree.ts";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const sessionTitle = "Ad hoc historical review session";
const vendorPath = "tests/fixtures/sharadar_vendor.py";

test("selecting a completed ad hoc session shows historical Review and Intent coverage after cleanup", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  publishIntentTrunk(origin.project);
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title: sessionTitle,
    intentCoverage: {
      report:
        "Outcome: Caught\nPromise: Range-resume assessment survives cleanup.\nFault: Drop saved coverage after retirement.\nEvidence: The Range-resume baseline matched after restoration.\n",
    },
    implementation: (workspace) => {
      writeAt(
        workspace,
        vendorPath,
        '"""Sharadar vendor fixture edited by the ad hoc completion."""\nVALUE = 13\n',
      );
    },
  });
  const published = git(origin.origin, "rev-parse", "main");
  expect(published).not.toBe(linked.completion);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });

  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?perspective=intent");
  await openSessionsSidebar(page);
  const shown = recentlyDoneParts(page);
  await shown.header.click();
  await shown.select(sessionTitle).click();
  const { intent } = parts(page);
  await expect(intent).toHaveAttribute("data-selected-story", linked.identity);
  await expect(storyTitle(intent)).toHaveText(linked.title, {
    timeout: 30_000,
  });
  await expect(shown.select(sessionTitle)).toHaveAttribute(
    "title",
    /(^|\n)Open Dough · Ad hoc(\n|$)/,
  );

  await test.step("Intent coverage keeps the saved Range-resume assessment", async () => {
    await chooseStoryTab(intent, "Intent coverage");
    await expect(
      intent
        .getByRole("region", { name: "Intent coverage" })
        .locator(".intent-story-coverage-text"),
    ).toContainText("Range-resume assessment survives cleanup.");
  });

  await test.step("historical revisions differ from current trunk and Review lists the vendor fixture edit", async () => {
    await chooseStoryTab(intent, "Changed tests");
    const revisions = storyHeaderReading(intent).revisions;
    await expect(revisions).toContainText(
      `with completion ${shortRevision(linked.completion)}.`,
    );
    const shownRevisions = revisions.locator("code");
    await expect(shownRevisions).toHaveCount(2);
    await expect(shownRevisions.nth(1)).toHaveAttribute(
      "title",
      linked.completion,
    );
    const baseline = (await shownRevisions.first().getAttribute("title")) ?? "";
    expect(baseline).not.toBe(published);
    expect(baseline).not.toBe(linked.completion);
    expect(published).not.toBe(linked.completion);

    await openReviewFromIntent(page, intent);
    const review = page.getByRole("region", { name: "Story review" });
    await expect(
      review.getByRole("button", {
        name: `Added ${vendorPath}`,
        exact: true,
      }),
    ).toBeVisible();
  });
});
