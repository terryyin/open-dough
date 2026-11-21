// How a review diff draws emphasized words: underlined rather than struck
// through, copied as plain diff text, and absent from revealed context.
import { createElement } from "react";
import { expect, test } from "vitest";
import { textLines } from "../../src/diffContextExpansion.ts";
import { DiffLines } from "../../src/StoryReviewDiffLines.tsx";
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";
import { limit } from "./wordEmphasisCases.ts";

function plainDiff({
  printed,
  text,
}: {
  printed: string;
  text: Extract<ReviewedFileText, { kind: "text" }>;
}) {
  return createElement(DiffLines, {
    printed,
    sides: { baseline: textLines(text.baseline), tree: textLines(text.tree) },
    lineTokens: () => undefined,
    contextReading: false,
    onRetryText: () => {},
  });
}

async function mountPlainDiff(input: Parameters<typeof plainDiff>[0]) {
  await mountComponent(plainDiff(input));
  return reviewDiffPage();
}

test("emphasized words are underlined, copy plain, and revealed context stays unemphasized", async () => {
  const diff = await mountPlainDiff(limit);
  const removed = diff.removedLine(25);
  const added = diff.newLine(25);

  await expect.poll(removed.deletedWords).toEqual(["20"]);
  await expect.poll(added.insertedWords).toEqual(["25"]);
  expect(removed.deletionDecoration()).toBe("underline");
  expect(added.insertionDecoration()).toBe("underline");
  expect(diff.selectedText(removed.line, added.line)).toBe(
    "-const limit = 20;\n+const limit = 25;\n",
  );

  await diff.showPrecedingLines();
  const revealed = diff.firstRevealedLine();
  await expect.element(revealed.line).toBeVisible();
  expect(revealed.insertedWords()).toEqual([]);
  expect(revealed.deletedWords()).toEqual([]);
  expect(diff.insertedWords()).toEqual(["25"]);
});
