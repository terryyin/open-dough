// An unreadable text or a failed grammar leaves a review's code plain.
// A Retry that reads the text styles the lines and clears the context problem.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { frontendReviewSnapshot } from "../../test-support/support/frontendStoryReview.ts";
import {
  openFrontendStoryReview,
  selectedFrontendStoryDiff,
} from "../../test-support/support/frontendStoryReviewOpen.ts";
import {
  greetDiff,
  greetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";
import {
  storyReviewDiff,
  type StoryReviewDiff,
} from "../../test-support/support/reviewDiffSyntax.ts";
import { intentFile } from "../../test-support/support/intentStoryPage.ts";
import { failGrammar } from "../../test-support/support/syntaxGrammar.ts";
import { greetingDiffHunkLines } from "./greetingDiffExpectations.ts";

const styledPath = "greet.ts";
const plainPath = "base.txt";
const files = [styledPath, plainPath].map((path) => ({
  kind: "modified" as const,
  path,
  lines: { added: 2, removed: 4 },
}));

async function expectPlainAndComplete(diff: StoryReviewDiff) {
  await expect(diff.newLine(31).line).toHaveText(" export default greeting;");
  expect(await diff.lineTexts()).toEqual(greetingDiffHunkLines);
  await expect(diff.codeTokens()).toHaveCount(0);
}

test("text that cannot be read leaves plain lines with only the context problem and Retry, and a Retry that reads it styles them", async ({
  page,
  frontendServices,
}) => {
  const unavailable = {
    kind: "unavailable",
    explanation: "The story's tree is not on this machine.",
  } as const;
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({ files }),
    (answers) => {
      for (const path of files.map((file) => file.path)) {
        answers.answerFile(greetDiff(path), path);
        answers.answerNextFileText(unavailable, path);
        answers.answerFileText(greetText, path);
      }
    },
  );
  const problem = `Additional context could not be read: ${unavailable.explanation} Retry`;

  await intentFile(review, `Modified ${plainPath}`).click();
  const plain = storyReviewDiff(
    await selectedFrontendStoryDiff(review, `Modified ${plainPath}`),
  );
  await expect(plain.locator.getByRole("alert")).toHaveText(problem);
  const plainWords = await plain.words(plainPath);

  await intentFile(review, `Modified ${styledPath}`).click();
  const diff = storyReviewDiff(
    await selectedFrontendStoryDiff(review, `Modified ${styledPath}`),
  );
  await expect(diff.locator.getByRole("alert")).toHaveText(problem);
  await expectPlainAndComplete(diff);
  expect(await diff.words(styledPath)).toBe(plainWords);

  await diff.locator.getByRole("button", { name: "Retry" }).click();
  await expect(diff.newLine(28).token(/^const$/)).toBeVisible();
  await expect(diff.locator.getByRole("alert")).toHaveCount(0);
});

test("a grammar that fails to load leaves the code plain with nothing added", async ({
  page,
  frontendServices,
}) => {
  const grammar = await failGrammar(page, "typescript");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({ files }),
    (answers) => {
      for (const path of files.map((file) => file.path)) {
        answers.answerFile(greetDiff(path), path);
        answers.answerFileText(greetText, path);
      }
    },
  );

  await intentFile(review, `Modified ${plainPath}`).click();
  const plain = storyReviewDiff(
    await selectedFrontendStoryDiff(review, `Modified ${plainPath}`),
  );
  await plain.showPrecedingLines().click();
  await expect(plain.revealedBefore()).toHaveCount(20);
  const plainWords = await plain.words(plainPath);

  await intentFile(review, `Modified ${styledPath}`).click();
  const diff = storyReviewDiff(
    await selectedFrontendStoryDiff(review, `Modified ${styledPath}`),
  );
  await grammar.failed;
  await expectPlainAndComplete(diff);
  await diff.showPrecedingLines().click();
  await expect(diff.revealedBefore()).toHaveCount(20);
  await expect(diff.codeTokens()).toHaveCount(0);
  expect(await diff.words(styledPath)).toBe(plainWords);
});
