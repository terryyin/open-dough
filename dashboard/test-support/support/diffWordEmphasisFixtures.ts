// One case per story-review word-emphasis journey, pairing the file text with
// the printed diff: a one-word edit, a Markdown-style rewrap, a call split
// across lines, re-indent, a pure addition, a low-similarity rewrite, and a
// several-hundred-line block beside a small emphasized one. The limit case
// also carries omitted context above its hunk. Plain `.txt` and styled `.ts`
// paths reuse that case; `limitDiff` and `limitText` stay for the styled opener.

import {
  reviewedFileDiffSchema,
  type ReviewedFileText,
} from "../../src/storyReviewContract.ts";

const fillers = [...Array(24).keys()].map(
  (at) => `filler line ${String(at + 1)}`,
);

const wordEmphasisCase = <Text extends ReviewedFileText>(
  text: Text,
  lines: readonly string[],
) => ({
  text,
  diff: (path: string) =>
    reviewedFileDiffSchema.parse({
      kind: "diff",
      printed: [
        `diff --git a/${path} b/${path}`,
        `--- a/${path}`,
        `+++ b/${path}`,
        ...lines,
        "",
      ].join("\n"),
    }),
});

export const limitText = {
  kind: "text",
  baseline: [...fillers, "const limit = 20;", "keep this line;", ""].join("\n"),
  tree: [...fillers, "const limit = 25;", "keep this line;", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const limit = wordEmphasisCase(limitText, [
  "@@ -24,3 +24,3 @@",
  " filler line 24",
  "-const limit = 20;",
  "+const limit = 25;",
  " keep this line;",
]);

export const limitDiff = limit.diff;

const rewrapText = {
  kind: "text",
  baseline: [
    "alpha bravo charlie delta echo",
    "foxtrot golf hotel india juliet",
    "kilo lima mike",
    "",
  ].join("\n"),
  tree: [
    "alpha bravo WORD charlie delta",
    "echo foxtrot golf hotel india",
    "juliet kilo lima",
    "mike",
    "",
  ].join("\n"),
} as const satisfies ReviewedFileText;

export const rewrap = wordEmphasisCase(rewrapText, [
  "@@ -1,3 +1,4 @@",
  "-alpha bravo charlie delta echo",
  "-foxtrot golf hotel india juliet",
  "-kilo lima mike",
  "+alpha bravo WORD charlie delta",
  "+echo foxtrot golf hotel india",
  "+juliet kilo lima",
  "+mike",
]);

const splitCallText = {
  kind: "text",
  baseline: ["run(a, b);", ""].join("\n"),
  tree: ["run(a, b,", "  c);", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const splitCall = wordEmphasisCase(splitCallText, [
  "@@ -1,1 +1,2 @@",
  "-run(a, b);",
  "+run(a, b,",
  "+  c);",
]);

const reindentText = {
  kind: "text",
  baseline: ["  run();", ""].join("\n"),
  tree: ["    run();", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const reindent = wordEmphasisCase(reindentText, [
  "@@ -1,1 +1,1 @@",
  "-  run();",
  "+    run();",
]);

const pureAdditionText = {
  kind: "text",
  baseline: ["keep;", ""].join("\n"),
  tree: ["keep;", "only new;", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const pureAddition = wordEmphasisCase(pureAdditionText, [
  "@@ -1,1 +1,2 @@",
  " keep;",
  "+only new;",
]);

const rewriteText = {
  kind: "text",
  baseline: ["return cached;", ""].join("\n"),
  tree: ['throw new Error("stale");', ""].join("\n"),
} as const satisfies ReviewedFileText;

export const rewrite = wordEmphasisCase(rewriteText, [
  "@@ -1,1 +1,1 @@",
  "-return cached;",
  '+throw new Error("stale");',
]);

// Several hundred changed lines (150 removed + 150 added) plus a small
// one-word edit later in the same file.
const largeBlockLineCount = 150;

const largeRemoved = [...Array(largeBlockLineCount).keys()].map(
  (at) => `old generated line ${String(at + 1)}`,
);
const largeAdded = [...Array(largeBlockLineCount).keys()].map(
  (at) => `new generated line ${String(at + 1)}`,
);

const largeWithSmallText = {
  kind: "text",
  baseline: [...largeRemoved, "bridge;", "const limit = 20;", ""].join("\n"),
  tree: [...largeAdded, "bridge;", "const limit = 25;", ""].join("\n"),
} as const satisfies ReviewedFileText;

const largeBlock = wordEmphasisCase(largeWithSmallText, [
  `@@ -1,${String(largeBlockLineCount)} +1,${String(largeBlockLineCount)} @@`,
  ...largeRemoved.map((line) => `-${line}`),
  ...largeAdded.map((line) => `+${line}`),
  `@@ -${String(largeBlockLineCount + 1)},2 +${String(largeBlockLineCount + 1)},2 @@`,
  " bridge;",
  "-const limit = 20;",
  "+const limit = 25;",
]);

export const largeWithSmall = {
  text: largeBlock.text,
  diff: largeBlock.diff,
  lineCount: largeBlockLineCount,
};
