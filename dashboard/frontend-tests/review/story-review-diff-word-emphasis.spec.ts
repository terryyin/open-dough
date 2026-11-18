// Story-review diffs emphasize changed words in removed-then-added blocks as
// deletions/insertions on plain lines; pure adds, unchanged and revealed
// context do not. Styled composition and appearance live in the companion
// composition spec.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { frontendReviewSnapshot } from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../test-support/support/frontendStoryReviewOpen.ts";
import {
  fileDiff,
  fileRow,
} from "../../test-support/support/reviewTreeRows.ts";
import {
  largeBlockLineCount,
  largeWithSmallDiff,
  largeWithSmallText,
  limitDiff,
  limitText,
  pureAdditionDiff,
  pureAdditionText,
  reindentDiff,
  reindentText,
  rewriteDiff,
  rewriteText,
  rewrapDiff,
  rewrapText,
  splitCallDiff,
  splitCallText,
} from "../../test-support/support/diffWordEmphasisFixtures.ts";
import { openPlainWordEmphasisDiff } from "../../test-support/support/diffWordEmphasisOpen.ts";
import { storyReviewDiff } from "../../test-support/support/reviewDiffSyntax.ts";
import { diffHunk } from "../../test-support/support/reviewPanes.ts";

test("changed words in a block are deletions and insertions; copy stays plain", async ({
  page,
  frontendServices,
}) => {
  const path = "limit.txt";
  const diff = await openPlainWordEmphasisDiff(
    page,
    frontendServices,
    path,
    limitDiff(path),
    limitText,
    { added: 1, removed: 1 },
  );

  const removed = diff.removedLine(25);
  const added = diff.newLine(25);
  const unchanged = diff.newLine(26);
  await expect(removed.deletions()).toHaveText(["20"]);
  await expect(added.insertions()).toHaveText(["25"]);
  await expect(unchanged.deletions()).toHaveCount(0);
  await expect(unchanged.insertions()).toHaveCount(0);
  await expect(removed.deletions()).toHaveCSS(
    "text-decoration-line",
    "underline",
  );
  expect(
    await removed
      .deletions()
      .evaluate((node) => getComputedStyle(node).textDecorationLine),
  ).not.toContain("line-through");

  const copy = await diff.selectedText(removed, added);
  expect(copy).toBe("-const limit = 20;\n+const limit = 25;\n");
});

test("a three-line rewrap gaining a word emphasizes only that word", async ({
  page,
  frontendServices,
}) => {
  const path = "wrap.txt";
  const diff = await openPlainWordEmphasisDiff(
    page,
    frontendServices,
    path,
    rewrapDiff(path),
    rewrapText,
    { added: 4, removed: 3 },
  );

  await expect(diff.insertions()).toHaveText(["WORD"]);
  await expect(diff.deletions()).toHaveCount(0);
  await expect(diff.newLine(1).insertions()).toHaveText(["WORD"]);
  await expect(diff.newLine(2).insertions()).toHaveCount(0);
  await expect(diff.newLine(3).insertions()).toHaveCount(0);
  await expect(diff.newLine(4).insertions()).toHaveCount(0);
});

test("splitting a call across lines emphasizes the added comma, indent and argument", async ({
  page,
  frontendServices,
}) => {
  const path = "call.txt";
  const diff = await openPlainWordEmphasisDiff(
    page,
    frontendServices,
    path,
    splitCallDiff(path),
    splitCallText,
    { added: 2, removed: 1 },
  );

  await expect(diff.newLine(1).insertions()).toHaveText([","]);
  await expect(diff.newLine(2).insertions()).toHaveText(["  c"]);
  await expect(diff.deletions()).toHaveCount(0);
});

test("re-indent emphasizes the changed whitespace on both lines", async ({
  page,
  frontendServices,
}) => {
  const path = "indent.txt";
  const diff = await openPlainWordEmphasisDiff(
    page,
    frontendServices,
    path,
    reindentDiff(path),
    reindentText,
    { added: 1, removed: 1 },
  );

  await expect(diff.removedLine(1).deletions()).toHaveText(["  "]);
  await expect(diff.newLine(1).insertions()).toHaveText(["    "]);
});

test("a pure addition and revealed context have no word emphasis", async ({
  page,
  frontendServices,
}) => {
  const additionPath = "added.txt";
  const contextPath = "limit.txt";
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [
        {
          kind: "modified" as const,
          path: additionPath,
          lines: { added: 1, removed: 0 },
        },
        {
          kind: "modified" as const,
          path: contextPath,
          lines: { added: 1, removed: 1 },
        },
      ],
    }),
    (answers) => {
      answers.answerFile(pureAdditionDiff(additionPath), additionPath);
      answers.answerFileText(pureAdditionText, additionPath);
      answers.answerFile(limitDiff(contextPath), contextPath);
      answers.answerFileText(limitText, contextPath);
    },
  );

  await fileRow(review, `Modified ${additionPath}`).click();
  const addition = storyReviewDiff(
    fileDiff(review, `Modified ${additionPath}`),
  );
  await expect(addition.newLine(2).line).toHaveText("+only new;");
  await expect(addition.insertions()).toHaveCount(0);
  await expect(addition.deletions()).toHaveCount(0);

  await fileRow(review, `Modified ${contextPath}`).click();
  const context = storyReviewDiff(fileDiff(review, `Modified ${contextPath}`));
  await context.showPrecedingLines().click();
  const revealed = context.firstRevealedLine();
  await expect(revealed.line).toBeVisible();
  await expect(revealed.insertions()).toHaveCount(0);
  await expect(revealed.deletions()).toHaveCount(0);
  await expect(context.insertions()).toHaveText(["25"]);
});

test("a low-similarity rewrite stays line-level with no word emphasis", async ({
  page,
  frontendServices,
}) => {
  const path = "rewrite.txt";
  const diff = await openPlainWordEmphasisDiff(
    page,
    frontendServices,
    path,
    rewriteDiff(path),
    rewriteText,
    { added: 1, removed: 1 },
  );

  await expect(diff.insertions()).toHaveCount(0);
  await expect(diff.deletions()).toHaveCount(0);
});

test("a several-hundred-line block stays line-level while a small block is emphasized", async ({
  page,
  frontendServices,
}) => {
  const path = "generated.txt";
  const diff = await openPlainWordEmphasisDiff(
    page,
    frontendServices,
    path,
    largeWithSmallDiff(path),
    largeWithSmallText,
    {
      added: largeBlockLineCount + 1,
      removed: largeBlockLineCount + 1,
    },
  );

  const largeHunk = storyReviewDiff(
    diffHunk(
      diff.locator,
      `@@ -1,${String(largeBlockLineCount)} +1,${String(largeBlockLineCount)} @@`,
    ),
  );
  await expect(diff.removedLine(1).line).toBeVisible();
  await expect(largeHunk.insertions()).toHaveCount(0);
  await expect(largeHunk.deletions()).toHaveCount(0);

  const smallRemoved = diff.removedLine(largeBlockLineCount + 2);
  const smallAdded = diff.newLine(largeBlockLineCount + 2);
  await expect(smallRemoved.deletions()).toHaveText(["20"]);
  await expect(smallAdded.insertions()).toHaveText(["25"]);
});
