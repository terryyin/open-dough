// The one-word edit with omitted context still used by the built-app
// styled diff. Its plain path also supplies the mounted word-emphasis cases.
import type {
  ReviewedFileDiff,
  ReviewedFileText,
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
    ({
      kind: "diff",
      printed: [
        `diff --git a/${path} b/${path}`,
        `--- a/${path}`,
        `+++ b/${path}`,
        ...lines,
        "",
      ].join("\n"),
    }) satisfies ReviewedFileDiff,
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
