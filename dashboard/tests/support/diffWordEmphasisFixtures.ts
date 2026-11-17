// Plain-text (.txt) diffs for story-review word-emphasis journeys: a
// one-word edit, a Markdown-style rewrap, a call split across lines,
// re-indent, a pure addition, and a change with omitted context above.

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
