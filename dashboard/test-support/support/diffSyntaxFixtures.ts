// A modified TypeScript file for diff syntax-styling journeys: a comment
// opens in the omitted lines above its only hunk, a removed line sits inside
// a template string the change removes, and added, removed and unchanged
// lines each hold `const` and a quoted string.

import {
  reviewedFileDiffSchema,
  type ReviewedFileText,
} from "../../src/storyReviewContract.ts";

const fillers = [...Array(24).keys()].map(
  (at) => `const filler${String(at + 1)} = "value ${String(at + 1)}";`,
);
const commentAbove = [
  "/* the greeting's notes",
  "   start above the change",
  "   and close here */",
  'const greeting = "hello";',
];

export const greetText = {
  kind: "text",
  baseline: [
    ...fillers,
    ...commentAbove,
    'const farewell = "bye"; // old',
    "const banner = `",
    "const status = old;",
    "`;",
    "export default greeting;",
    "",
  ].join("\n"),
  tree: [
    ...fillers,
    ...commentAbove,
    'const farewell = "later"; // new',
    "const status = now;",
    "export default greeting;",
    "",
  ].join("\n"),
} as const satisfies ReviewedFileText;

// Old line 27 (new 27) opens the hunk inside the comment; old lines 29–32 are
// removed and new lines 29–30 added.
export const greetDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -27,7 +27,5 @@",
      "    and close here */",
      ' const greeting = "hello";',
      '-const farewell = "bye"; // old',
      "-const banner = `",
      "-const status = old;",
      "-`;",
      '+const farewell = "later"; // new',
      "+const status = now;",
      " export default greeting;",
      "",
    ].join("\n"),
  });

// A modified README: the removed fence marker and the added heading sit on
// consecutive change lines under the same plain paragraph.
export const readmeText = {
  kind: "text",
  baseline: ["plain paragraph", "```", ""].join("\n"),
  tree: ["plain paragraph", "# Shown", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const readmeDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -1,2 +1,2 @@",
      " plain paragraph",
      "-```",
      "+# Shown",
      "",
    ].join("\n"),
  });

// A modified stylesheet whose removed rule line holds a custom property and a
// hex colour value inside the old file's property list.
export const stylesheetText = {
  kind: "text",
  baseline: ["body {", "  --accent: #ff0000;", "}", ""].join("\n"),
  tree: ["body {", "}", ""].join("\n"),
} as const satisfies ReviewedFileText;

export const stylesheetDiff = (path: string) =>
  reviewedFileDiffSchema.parse({
    kind: "diff",
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      "@@ -1,3 +1,2 @@",
      " body {",
      "-  --accent: #ff0000;",
      " }",
      "",
    ].join("\n"),
  });
