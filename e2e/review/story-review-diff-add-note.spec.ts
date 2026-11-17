// Real Published completion: file, both line sides and revealed context retain
// the displayed facts through the shared machine-local notes boundary. What
// Review changes keeps around Story notes is
// ../../dashboard/frontend-tests/review/story-review-notes.spec.ts.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import type { StartOrigin } from "../../dashboard/tests/support/startOrigin.ts";
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
