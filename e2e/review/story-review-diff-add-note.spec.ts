// Real Published completion: file, both line sides and revealed context retain
// the displayed facts through the shared machine-local notes boundary.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/tests/support/startOrigin.ts";
import {
  codePane,
  scrollPane,
  scrollTopOf,
} from "../../dashboard/tests/support/reviewPanes.ts";
import { shownComparisonDescription } from "../../dashboard/tests/support/reviewContextLine.ts";
import { lineNumberControl } from "../../dashboard/tests/support/diffLineFollowUpPage.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { completedPublishedStory } from "../../dashboard/tests/support/completedPublishedStory.ts";
import { contextExpansion } from "../../dashboard/tests/support/expandContextDiff.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { readReview } from "../../dashboard/tests/support/launchLandingReview.ts";
import {
  fileDiff,
  listedFile,
} from "../../dashboard/tests/support/reviewTreeRows.ts";
import {
  commitAll,
  expandContextFile,
  expandContextLines,
  git,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { reviewRegion } from "../../dashboard/tests/support/reviewControls.ts";
import { closeSidePanel } from "../../dashboard/tests/sidePanelFrame.ts";
import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";

async function openNotesReview(page: Page, origin: StartOrigin) {
  writeFileSync(
    path.join(origin.project, expandContextFile),
    expandContextLines("line", 160),
  );
  commitAll(origin.project, "context trunk");
  git(origin.project, "push", "--quiet", "origin", "main");
  const { completion } = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    (workspace) => {
      writeFileSync(
        path.join(workspace, expandContextFile),
        expandContextLines("line", 160).replace(
          "line 54\n",
          "changed fifty-four\n",
        ),
      );
    },
  );
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: completion,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  expect((await readReview(page, card)).kind).toBe("published");
  const review = reviewRegion(page);
  const label = `Modified ${expandContextFile}`;
  await listedFile(review, label, { exact: true }).click();
  const diff = fileDiff(review, label, { exact: true });
  return { review, diff, card };
}

test("Published diff file and line notes show and keep their immutable context", async ({
  page,
  origin,
}) => {
  const { review, diff, card } = await openNotesReview(page, origin);
  const notes = storyNotesPage(page);
  await notes.fromFile(diff);
  await notes.expectComposerContext([
    "Story A",
    "Review changes",
    expandContextFile,
    /Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
  ]);
  await notes.expectNoComposerLine();
  await notes.type("File observation");
  await notes.save();
  await notes.expectDiffSaved();
  for (const [side, number, text] of [
    ["new", 54, "changed fifty-four"],
    ["old", 54, "line 54"],
    ["old", 40, "line 40"],
  ] as const) {
    if (number === 40)
      await contextExpansion(
        diff.getByRole("list", {
          name: "Omitted lines before the next change",
        }),
        /Show 20 preceding/,
      ).click();
    await notes.fromLine(diff, side, number);
    await notes.expectComposerContext([
      "Review changes",
      expandContextFile,
      "Published completion",
      `Line ${number} · ${side}`,
      text,
    ]);
    await notes.type(`${side} ${number} observation`);
    await notes.save();
    await notes.expectDiffSaved();
  }
  await closeSidePanel(review);
  await showColumn(page, "Recently done");
  await notes.open(card);
  await notes.expectNotes([
    "old 40 observation",
    "old 54 observation",
    "new 54 observation",
    "File observation",
  ]);
  for (const [index, context] of [
    [0, "Line 40 · old"],
    [1, "line 54"],
    [2, "changed fifty-four"],
    [3, "Published completion"],
  ] as const)
    await notes.expectEntryContext(index, context);
  await notes.expectEntryContext(0, "line 40");
  await notes.expectEntryContext(1, "Line 54 · old");
  await notes.expectEntryContext(2, "Line 54 · new");
  await notes.expectEntryContext(3, expandContextFile);
  await notes.expectEntryContext(
    3,
    /Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
  );
  await notes.expectEntryNoLine(3);
});

test("Notes from Review changes preserves the displayed diff and returns focus", async ({
  page,
  origin,
}) => {
  const { review, diff } = await openNotesReview(page, origin);
  const notes = storyNotesPage(page);
  await notes.fromFile(diff);
  await notes.type("Keep this review observation");
  await notes.save();
  await notes.expectDiffSaved();
  await contextExpansion(
    diff.getByRole("list", { name: "Omitted lines before the next change" }),
    /Show 20 preceding/,
  ).click();
  const revealed = lineNumberControl(diff, "old", 40);
  await expect(revealed).toHaveCount(1);
  const code = codePane(diff);
  const readingAt = await scrollPane(code, 150);
  expect(readingAt).toBeGreaterThan(0);
  const comparison = shownComparisonDescription(review);
  await expect(comparison).toContainText("Published completion");
  const comparisonBefore = await comparison.textContent();
  if (comparisonBefore === null) throw new Error("Comparison was not shown");
  await notes.expectCount(review, 1);
  await notes.open(review, "keyboard");
  await notes.expectContext("Story A", queuedIdentity);
  await notes.expectNotes(["Keep this review observation"]);
  await notes.close();
  await notes.expectOpenerFocused(review);
  await expect(comparison).toHaveText(comparisonBefore);
  await expect(diff).toBeVisible();
  await expect(revealed).toHaveCount(1);
  expect(await scrollTopOf(code)).toBe(readingAt);
});
