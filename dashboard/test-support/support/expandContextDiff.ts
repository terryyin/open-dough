// The expand-context story-review file in Intent after opening Review changes
// on a card prepared from expandContextRepository, and the context-expansion
// controls revealed context journeys use.

import { diffHunk, diffLines } from "./reviewPanes.ts";
import type { Locator, Page } from "@playwright/test";
import { openIntentReviewChanges } from "../reviewChangesPage.ts";
import { expandContextFile } from "./storyReviewWorktree.ts";

const firstHunk = "@@ -51,7 +51,7 @@ line 50";

// Context expansion keeps its direction/count and activation modality at
// the call site, while the gap owns where that control is found.
export const contextExpansion = (gap: Locator, name: RegExp) =>
  gap.getByRole("button", { name });

// The omitted context above a diff's first hunk.
export const gapBeforeNextChange = (diff: Locator) =>
  diff.getByRole("list", { name: "Omitted lines before the next change" });

export async function openExpandDiff(page: Page, card: Locator) {
  const review = await openIntentReviewChanges(page, card);
  const fileName = `Modified ${expandContextFile}`;
  await review.files.choose(fileName);
  const diff = review.diffs.toRead(fileName);
  const hunk = diffHunk(diff, firstHunk);
  const changedLine = diffLines(hunk, { hasText: "+changed fifty-four" });
  const beforeGap = gapBeforeNextChange(diff);
  const showPreceding = contextExpansion(beforeGap, /Show 20 preceding/);
  return {
    review,
    // Scrolls the first hunk to the middle of the reading, reveals the 20
    // lines above it, and answers how far its changed line moved on screen.
    async showPrecedingAboveMidViewHunk() {
      await review.readingToMeasure().evaluate(
        (scroller, el) => {
          const top =
            el.getBoundingClientRect().top -
            scroller.getBoundingClientRect().top +
            scroller.scrollTop;
          scroller.scrollTo(0, Math.max(0, top - scroller.clientHeight / 2));
        },
        await hunk.elementHandle(),
      );
      // Control already in view: a normal click would scrollIntoView (about
      // a button's height) first and move the place for the wrong reason.
      await showPreceding.waitFor({ state: "visible" });
      const top = () =>
        changedLine.evaluate((el) => el.getBoundingClientRect().top);
      const before = await top();
      await showPreceding.click({ force: true });
      await diffLines(beforeGap, { hasText: " line 31" }).waitFor();
      return Math.abs((await top()) - before);
    },
  };
}
