// Printed diffs and both file texts for the mounted word-emphasis cases.
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { printedDiff } from "./styledDiffCases.ts";

type FileText = Extract<ReviewedFileText, { kind: "text" }>;

function wordEmphasisCase<Text extends FileText>(
  path: string,
  text: Text,
  lines: readonly string[],
) {
  return {
    text,
    printed: printedDiff(path, lines),
  };
}

const fillers = [...Array(24).keys()].map(
  (index) => `filler line ${String(index + 1)}`,
);

const limitText = {
  kind: "text",
  baseline: [...fillers, "const limit = 20;", "keep this line;", ""].join("\n"),
  tree: [...fillers, "const limit = 25;", "keep this line;", ""].join("\n"),
} as const satisfies FileText;

export function limitAtPath(path: string) {
  return wordEmphasisCase(path, limitText, [
    "@@ -24,3 +24,3 @@",
    " filler line 24",
    "-const limit = 20;",
    "+const limit = 25;",
    " keep this line;",
  ]);
}

export const limit = limitAtPath("limit.txt");

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

export const rewrap = wordEmphasisCase("wrap.txt", rewrapText, [
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

export const splitCall = wordEmphasisCase("call.txt", splitCallText, [
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

export const reindent = wordEmphasisCase("indent.txt", reindentText, [
  "@@ -1,1 +1,1 @@",
  "-  run();",
  "+    run();",
]);

const pureAdditionText = {
  kind: "text",
  baseline: ["keep;", ""].join("\n"),
  tree: ["keep;", "only new;", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const pureAddition = wordEmphasisCase("added.txt", pureAdditionText, [
  "@@ -1,1 +1,2 @@",
  " keep;",
  "+only new;",
]);

const rewriteText = {
  kind: "text",
  baseline: ["return cached;", ""].join("\n"),
  tree: ['throw new Error("stale");', ""].join("\n"),
} as const satisfies ReviewedFileText;

export const rewrite = wordEmphasisCase("rewrite.txt", rewriteText, [
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

const largeBlock = wordEmphasisCase("generated.txt", largeWithSmallText, [
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
  printed: largeBlock.printed,
  lineCount: largeBlockLineCount,
};
