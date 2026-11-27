// The greeting diff (../../test-support/support/diffSyntaxFixtures.ts) as a
// reviewer reads it: its hunk's lines, read plain and complete before any
// styling, and the same file opened in a story's Intent changes.
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { greetDiff } from "../../test-support/support/diffSyntaxFixtures.ts";
import type { reviewDiffPage } from "./reviewDiffPage.ts";
import { openStoryChanges } from "../intent/intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "../intent/intent-story-compare-page.ts";

type ReviewDiff = ReturnType<typeof reviewDiffPage>;

export const greetingDiffHunkLines = [
  "    and close here */",
  ' const greeting = "hello";',
  '-const farewell = "bye"; // old',
  "-const banner = `",
  "-const status = old;",
  "-`;",
  '+const farewell = "later"; // new',
  "+const status = now;",
  " export default greeting;",
] as const;

export const greetingPath = "greet.ts";

export function expectGreetingHunk(diff: ReviewDiff) {
  expect(diff.lineFacts().map(({ text }) => text)).toEqual(
    greetingDiffHunkLines,
  );
}

export async function expectPlainAndComplete(diff: ReviewDiff) {
  await expect
    .element(diff.newLine(31).line)
    .toHaveTextContent(" export default greeting;", {
      normalizeWhitespace: false,
    });
  expectGreetingHunk(diff);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
}

// Opens Intent on a story that modifies the greeting file, its text read by
// `fileText`, and chooses that file.
export async function openGreetingReview(fileText: ReviewSource["fileText"]) {
  await openStoryChanges({
    review: () =>
      Promise.resolve(makeMe.aStoryReview.modifying(greetingPath).please()),
    fileDiff: () => Promise.resolve(greetDiff(greetingPath)),
    fileText,
  });
  await intentStoryCompare().file(`Modified ${greetingPath}`).click();
}
