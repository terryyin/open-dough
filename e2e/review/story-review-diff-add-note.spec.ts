// Real Published completion: file, both line sides and revealed context retain
// the displayed facts through the shared machine-local notes boundary. What
// Review changes keeps around Story notes is
// ../../dashboard/frontend-tests/review/story-review-notes.spec.ts.
import type { Page } from "@playwright/test";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { expandContextAddNoteHistory } from "../../dashboard/test-support/support/completedFollowUpHistory.ts";
import { contextExpansion } from "../../dashboard/test-support/support/expandContextDiff.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { readReview } from "../../dashboard/test-support/support/launchLandingReview.ts";
import {
  fileDiff,
  listedFile,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { expandContextFile } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { reviewRegion } from "../../dashboard/test-support/support/reviewControls.ts";
import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
import { storyNotesPage } from "../../dashboard/test-support/support/storyNotesPage.ts";

test.use({ originRepository: expandContextAddNoteHistory() });

async function openNotesReview(page: Page, origin: StartOrigin) {
  const completion = origin.revision("completion");
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
  const comparison = /Published completion [a-f0-9]{40} → [a-f0-9]{40}/;
  await notes.fromFile(diff);
  await notes.expectComposerContext([
    "Story A",
    "Review changes",
    expandContextFile,
    comparison,
  ]);
  await notes.expectNoComposerLine();
  await notes.saveDiffNote("File observation");
  await contextExpansion(
    diff.getByRole("list", { name: "Omitted lines before the next change" }),
    /Show 20 preceding/,
  ).click();
  const lineNotes = [
    { side: "new", number: 54, text: "changed fifty-four" },
    { side: "old", number: 40, text: "line 40" },
  ] as const;
  for (const { side, number, text } of lineNotes) {
    await notes.fromLine(diff, side, number);
    await notes.expectComposerContext([
      "Review changes",
      expandContextFile,
      "Published completion",
      `Line ${number} · ${side}`,
      text,
    ]);
    await notes.saveDiffNote(`${side} ${number} observation`);
  }
  await closeSidePanel(review);
  await showColumn(page, "Recently done");
  await notes.open(card);
  for (const { side, number, text } of lineNotes) {
    await notes.expectNoteContext(
      `${side} ${number} observation`,
      `Line ${number} · ${side}`,
    );
    await notes.expectNoteContext(`${side} ${number} observation`, text);
  }
  await notes.expectNoteContext("File observation", expandContextFile);
  await notes.expectNoteContext("File observation", comparison);
  await notes.expectNoteWithoutLine("File observation");
});
