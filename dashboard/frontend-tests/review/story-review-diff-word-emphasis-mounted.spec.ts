import { createElement } from "react";
import { expect, test } from "vitest";
import { textLines } from "../../src/diffContextExpansion.ts";
import { DiffLines } from "../../src/StoryReviewDiffLines.tsx";
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { mountedReviewDiff } from "./mountedReviewDiffPage.ts";
import {
  largeWithSmall,
  limit,
  pureAddition,
  reindent,
  rewrite,
  rewrap,
  splitCall,
} from "./wordEmphasisCases.ts";

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
  return mountedReviewDiff();
}

test("changed words in a block are deletions and insertions; copy stays plain", async () => {
  const diff = await mountPlainDiff(limit);
  const removed = diff.removedLine(25);
  const added = diff.newLine(25);
  const unchanged = diff.newLine(26);

  await expect.poll(removed.deletedWords).toEqual(["20"]);
  await expect.poll(added.insertedWords).toEqual(["25"]);
  await expect.element(unchanged.line).toBeVisible();
  expect(unchanged.deletedWords()).toEqual([]);
  expect(unchanged.insertedWords()).toEqual([]);
  expect(removed.deletionDecoration()).toBe("underline");
  expect(added.insertionDecoration()).toBe("underline");
  expect(removed.deletionDecoration()).not.toContain("line-through");
  expect(added.insertionDecoration()).not.toContain("line-through");
  await expect.element(diff.firstToken()).not.toBeInTheDocument();

  expect(diff.selectedText(removed.line, added.line)).toBe(
    "-const limit = 20;\n+const limit = 25;\n",
  );
});

test("a three-line rewrap gaining a word emphasizes only that word", async () => {
  const diff = await mountPlainDiff(rewrap);

  await expect.poll(diff.insertedWords).toEqual(["WORD"]);
  expect(diff.deletedWords()).toEqual([]);
  expect(diff.newLine(1).insertedWords()).toEqual(["WORD"]);
  expect(diff.newLine(2).insertedWords()).toEqual([]);
  expect(diff.newLine(3).insertedWords()).toEqual([]);
  expect(diff.newLine(4).insertedWords()).toEqual([]);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
});

test("splitting a call across lines emphasizes the added comma, indent and argument", async () => {
  const diff = await mountPlainDiff(splitCall);

  await expect.poll(diff.newLine(1).insertedWords).toEqual([","]);
  expect(diff.newLine(2).insertedWords()).toEqual(["  c"]);
  expect(diff.deletedWords()).toEqual([]);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
});

test("re-indent emphasizes the changed whitespace on both lines", async () => {
  const diff = await mountPlainDiff(reindent);

  await expect.poll(diff.removedLine(1).deletedWords).toEqual(["  "]);
  expect(diff.newLine(1).insertedWords()).toEqual(["    "]);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
});

test("a pure addition and revealed context have no word emphasis", async () => {
  const { rerender } = await mountComponent(plainDiff(pureAddition));
  const diff = mountedReviewDiff();

  await expect.element(diff.newLine(2).line).toHaveTextContent("+only new;");
  expect(diff.insertedWords()).toEqual([]);
  expect(diff.deletedWords()).toEqual([]);

  rerender(plainDiff(limit));
  await diff.showPrecedingLines();
  const revealed = diff.firstRevealedLine();
  await expect.element(revealed.line).toBeVisible();
  expect(revealed.insertedWords()).toEqual([]);
  expect(revealed.deletedWords()).toEqual([]);
  expect(diff.insertedWords()).toEqual(["25"]);
});

test("a low-similarity rewrite stays line-level with no word emphasis", async () => {
  const diff = await mountPlainDiff(rewrite);

  await expect.element(diff.removedLine(1).line).toBeVisible();
  await expect.element(diff.newLine(1).line).toBeVisible();
  expect(diff.insertedWords()).toEqual([]);
  expect(diff.deletedWords()).toEqual([]);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
});

test("a several-hundred-line block stays line-level while a small block is emphasized", async () => {
  const diff = await mountPlainDiff(largeWithSmall);
  const lineCount = String(largeWithSmall.lineCount);
  const largeHunk = diff.hunkMarks(`@@ -1,${lineCount} +1,${lineCount} @@`);

  await expect.element(diff.removedLine(1).line).toBeVisible();
  expect(largeHunk.insertedWords()).toEqual([]);
  expect(largeHunk.deletedWords()).toEqual([]);

  const smallRemoved = diff.removedLine(largeWithSmall.lineCount + 2);
  const smallAdded = diff.newLine(largeWithSmall.lineCount + 2);
  expect(smallRemoved.deletedWords()).toEqual(["20"]);
  expect(smallAdded.insertedWords()).toEqual(["25"]);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
});
