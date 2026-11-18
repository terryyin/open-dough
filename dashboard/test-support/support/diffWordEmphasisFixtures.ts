// Diffs for story-review word-emphasis journeys (plain `.txt` and styled
// `.ts` paths reuse the same limit texts): a one-word edit, a Markdown-style
// rewrap, a call split across lines, re-indent, a pure addition, a
// low-similarity rewrite, a several-hundred-line block beside a small
// emphasized one, and a change with omitted context above.

import {
  reviewedFileDiffSchema,
  type ReviewedFileText,
} from "../../src/storyReviewContract.ts";

const fillers = [...Array(24).keys()].map(
  (at) => `filler line ${String(at + 1)}`,
);

export const limitText = {
  kind: "text",
  baseline: [...fillers, "const limit = 20;", "keep this line;", ""].join("\n"),
  tree: [...fillers, "const limit = 25;", "keep this line;", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const limitDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -24,3 +24,3 @@",
      " filler line 24",
      "-const limit = 20;",
      "+const limit = 25;",
      " keep this line;",
      "",
    ].join("\n"),
  });

export const rewrapText = {
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

export const rewrapDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -1,3 +1,4 @@",
      "-alpha bravo charlie delta echo",
      "-foxtrot golf hotel india juliet",
      "-kilo lima mike",
      "+alpha bravo WORD charlie delta",
      "+echo foxtrot golf hotel india",
      "+juliet kilo lima",
      "+mike",
      "",
    ].join("\n"),
  });

export const splitCallText = {
  kind: "text",
  baseline: ["run(a, b);", ""].join("\n"),
  tree: ["run(a, b,", "  c);", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const splitCallDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -1,1 +1,2 @@",
      "-run(a, b);",
      "+run(a, b,",
      "+  c);",
      "",
    ].join("\n"),
  });

export const reindentText = {
  kind: "text",
  baseline: ["  run();", ""].join("\n"),
  tree: ["    run();", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const reindentDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -1,1 +1,1 @@",
      "-  run();",
      "+    run();",
      "",
    ].join("\n"),
  });

export const pureAdditionText = {
  kind: "text",
  baseline: ["keep;", ""].join("\n"),
  tree: ["keep;", "only new;", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const pureAdditionDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -1,1 +1,2 @@",
      " keep;",
      "+only new;",
      "",
    ].join("\n"),
  });

export const rewriteText = {
  kind: "text",
  baseline: ["return cached;", ""].join("\n"),
  tree: ['throw new Error("stale");', ""].join("\n"),
} as const satisfies ReviewedFileText;

export const rewriteDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -1,1 +1,1 @@",
      "-return cached;",
      '+throw new Error("stale");',
      "",
    ].join("\n"),
  });

// Several hundred changed lines (150 removed + 150 added) plus a small
// one-word edit later in the same file.
export const largeBlockLineCount = 150;

const largeRemoved = [...Array(largeBlockLineCount).keys()].map(
  (at) => `old generated line ${String(at + 1)}`,
);
const largeAdded = [...Array(largeBlockLineCount).keys()].map(
  (at) => `new generated line ${String(at + 1)}`,
);

export const largeWithSmallText = {
  kind: "text",
  baseline: [...largeRemoved, "bridge;", "const limit = 20;", ""].join("\n"),
  tree: [...largeAdded, "bridge;", "const limit = 25;", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const largeWithSmallDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      `@@ -1,${String(largeBlockLineCount)} +1,${String(largeBlockLineCount)} @@`,
      ...largeRemoved.map((line) => `-${line}`),
      ...largeAdded.map((line) => `+${line}`),
      `@@ -${String(largeBlockLineCount + 1)},2 +${String(largeBlockLineCount + 1)},2 @@`,
      " bridge;",
      "-const limit = 20;",
      "+const limit = 25;",
      "",
    ].join("\n"),
  });
