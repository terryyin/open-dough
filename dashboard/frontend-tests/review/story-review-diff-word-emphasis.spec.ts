// Which words a changed review-diff block emphasizes, read as ranges from the
// emphasis rule over each parsed hunk: one word stream per removed-then-added
// block, nothing for pure additions, low-similarity rewrites or large blocks.

import { expect, test } from "vitest";
import { emphasizedRangesByLine } from "../../src/diffWordEmphasis.ts";
import { parsedUnifiedDiff } from "../../src/unifiedDiff.ts";
import {
  largeWithSmall,
  limit,
  pureAddition,
  reindent,
  rewrap,
  rewrite,
  splitCall,
} from "./wordEmphasisCases.ts";

const markers = { added: "+", removed: "-", unchanged: " " } as const;

// Each hunk's emphasized text, keyed by the line as Git printed it.
function emphasizedWordsByHunk(printed: string) {
  return parsedUnifiedDiff(printed).hunks.map(({ lines }) => {
    const ranges = emphasizedRangesByLine(lines);
    return Object.fromEntries(
      lines.flatMap((line, at) => {
        const lineRanges = ranges.get(at);
        return lineRanges === undefined
          ? []
          : [
              [
                `${markers[line.kind]}${line.text}`,
                lineRanges.map(({ start, end }) => line.text.slice(start, end)),
              ],
            ];
      }),
    );
  });
}

test.each([
  {
    name: "a one-word change emphasizes the deleted and inserted word",
    printed: limit.printed,
    hunks: [{ "-const limit = 20;": ["20"], "+const limit = 25;": ["25"] }],
  },
  {
    name: "a three-line rewrap gaining a word emphasizes only that word",
    printed: rewrap,
    hunks: [{ "+alpha bravo WORD charlie delta": ["WORD"] }],
  },
  {
    name: "splitting a call emphasizes the added comma, indent and argument",
    printed: splitCall,
    hunks: [{ "+run(a, b,": [","], "+  c);": ["  c"] }],
  },
  {
    name: "a re-indent emphasizes the changed whitespace on both lines",
    printed: reindent,
    hunks: [{ "-  run();": ["  "], "+    run();": ["    "] }],
  },
  {
    name: "a pure addition emphasizes nothing",
    printed: pureAddition,
    hunks: [{}],
  },
  {
    name: "a low-similarity rewrite emphasizes nothing",
    printed: rewrite,
    hunks: [{}],
  },
  {
    name: "a several-hundred-line block emphasizes nothing while a small block is emphasized",
    printed: largeWithSmall,
    hunks: [{}, { "-const limit = 20;": ["20"], "+const limit = 25;": ["25"] }],
  },
])("$name", ({ printed, hunks }) => {
  expect(emphasizedWordsByHunk(printed)).toEqual(hunks);
});
