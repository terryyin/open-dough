// Printed review diffs for the word-emphasis rule. `limit` also carries both
// file texts, so the decoration case can reveal its surrounding context.
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { printedDiff } from "./styledDiffCases.ts";

const fillers = [...Array(24).keys()].map(
  (index) => `filler line ${String(index + 1)}`,
);

const limitText = {
  kind: "text",
  baseline: [...fillers, "const limit = 20;", "keep this line;", ""].join("\n"),
  tree: [...fillers, "const limit = 25;", "keep this line;", ""].join("\n"),
} as const satisfies ReviewedFileText;

export function limitAtPath(path: string) {
  return {
    text: limitText,
    printed: printedDiff(path, [
      "@@ -24,3 +24,3 @@",
      " filler line 24",
      "-const limit = 20;",
      "+const limit = 25;",
      " keep this line;",
    ]),
  };
}

export const limit = limitAtPath("limit.txt");

export const rewrap = printedDiff("wrap.txt", [
  "@@ -1,3 +1,4 @@",
  "-alpha bravo charlie delta echo",
  "-foxtrot golf hotel india juliet",
  "-kilo lima mike",
  "+alpha bravo WORD charlie delta",
  "+echo foxtrot golf hotel india",
  "+juliet kilo lima",
  "+mike",
]);

export const splitCall = printedDiff("call.txt", [
  "@@ -1,1 +1,2 @@",
  "-run(a, b);",
  "+run(a, b,",
  "+  c);",
]);

export const reindent = printedDiff("indent.txt", [
  "@@ -1,1 +1,1 @@",
  "-  run();",
  "+    run();",
]);

export const pureAddition = printedDiff("added.txt", [
  "@@ -1,1 +1,2 @@",
  " keep;",
  "+only new;",
]);

export const rewrite = printedDiff("rewrite.txt", [
  "@@ -1,1 +1,1 @@",
  "-return cached;",
  '+throw new Error("stale");',
]);

// Several hundred changed lines (150 removed + 150 added) plus a small
// one-word edit later in the same file.
const largeBlockLineCount = 150;

const largeRemoved = [...Array(largeBlockLineCount).keys()].map(
  (at) => `-old generated line ${String(at + 1)}`,
);
const largeAdded = [...Array(largeBlockLineCount).keys()].map(
  (at) => `+new generated line ${String(at + 1)}`,
);

export const largeWithSmall = printedDiff("generated.txt", [
  `@@ -1,${String(largeBlockLineCount)} +1,${String(largeBlockLineCount)} @@`,
  ...largeRemoved,
  ...largeAdded,
  `@@ -${String(largeBlockLineCount + 1)},2 +${String(largeBlockLineCount + 1)},2 @@`,
  " bridge;",
  "-const limit = 20;",
  "+const limit = 25;",
]);
