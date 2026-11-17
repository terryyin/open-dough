// Story-review diffs emphasize changed words in removed-then-added blocks as
// deletions/insertions on plain lines; pure adds, unchanged and revealed
// context do not. Styled composition and appearance live in the companion
// composition spec.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { frontendReviewSnapshot } from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
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
} from "../../tests/support/diffWordEmphasisFixtures.ts";
import { openPlainWordEmphasisDiff } from "../../tests/support/diffWordEmphasisOpen.ts";
import {
  deletions,
  insertions,
  newLine,
  removedLine,
  revealedBefore,
  selectedText,
  showPrecedingLines,
} from "../../tests/support/reviewDiffSyntax.ts";
import { diffHunk } from "../../tests/support/reviewPanes.ts";

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

  const removed = removedLine(diff, 25);
  const added = newLine(diff, 25);
  const unchanged = newLine(diff, 26);
  await expect(deletions(removed)).toHaveText(["20"]);
  await expect(insertions(added)).toHaveText(["25"]);
  await expect(deletions(unchanged)).toHaveCount(0);
  await expect(insertions(unchanged)).toHaveCount(0);
  await expect(deletions(removed)).toHaveCSS(
    "text-decoration-line",
    "underline",
  );
  expect(
    await deletions(removed).evaluate(
      (node) => getComputedStyle(node).textDecorationLine,
    ),
  ).not.toContain("line-through");

  const copy = await selectedText(removed, added);
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

  await expect(insertions(diff)).toHaveText(["WORD"]);
  await expect(deletions(diff)).toHaveCount(0);
  await expect(insertions(newLine(diff, 1))).toHaveText(["WORD"]);
  await expect(insertions(newLine(diff, 2))).toHaveCount(0);
  await expect(insertions(newLine(diff, 3))).toHaveCount(0);
  await expect(insertions(newLine(diff, 4))).toHaveCount(0);
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

  await expect(insertions(newLine(diff, 1))).toHaveText([","]);
  await expect(insertions(newLine(diff, 2))).toHaveText(["  c"]);
  await expect(deletions(diff)).toHaveCount(0);
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

  await expect(deletions(removedLine(diff, 1))).toHaveText(["  "]);
  await expect(insertions(newLine(diff, 1))).toHaveText(["    "]);
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
  const addition = fileDiff(review, `Modified ${additionPath}`);
  await expect(newLine(addition, 2)).toHaveText("+only new;");
  await expect(insertions(addition)).toHaveCount(0);
  await expect(deletions(addition)).toHaveCount(0);

  await fileRow(review, `Modified ${contextPath}`).click();
  const context = fileDiff(review, `Modified ${contextPath}`);
  await showPrecedingLines(context).click();
  const revealed = revealedBefore(context).first();
  await expect(revealed).toBeVisible();
  await expect(insertions(revealed)).toHaveCount(0);
  await expect(deletions(revealed)).toHaveCount(0);
  await expect(insertions(context)).toHaveText(["25"]);
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

  await expect(insertions(diff)).toHaveCount(0);
  await expect(deletions(diff)).toHaveCount(0);
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

  const largeHunk = diffHunk(
    diff,
    `@@ -1,${String(largeBlockLineCount)} +1,${String(largeBlockLineCount)} @@`,
  );
  await expect(removedLine(diff, 1)).toBeVisible();
  await expect(insertions(largeHunk)).toHaveCount(0);
  await expect(deletions(largeHunk)).toHaveCount(0);

  const smallRemoved = removedLine(diff, largeBlockLineCount + 2);
  const smallAdded = newLine(diff, largeBlockLineCount + 2);
  await expect(deletions(smallRemoved)).toHaveText(["20"]);
  await expect(insertions(smallAdded)).toHaveText(["25"]);
});
