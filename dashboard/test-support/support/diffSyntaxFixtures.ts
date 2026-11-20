// A modified TypeScript file for diff syntax-styling journeys: a comment
// opens in the omitted lines above its only hunk, a removed line sits inside
// a template string the change removes, and added, removed and unchanged
// lines each hold `const` and a quoted string.

import type {
  ReviewedFileDiff,
  ReviewedFileText,
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
  ({
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
  }) satisfies ReviewedFileDiff;
