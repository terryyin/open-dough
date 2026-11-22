// Which token line each review-diff line reads, from each side's whole text
// tokenized once: a removed line reads the old side and every other line the
// new side, so a comment opened above the hunk styles its lines, a removed
// line inside a removed template string reads as that string, and a line its
// side does not spell stays plain.

import { expect, test } from "vitest";
import {
  diffLineTokenLine,
  type DiffSideTokens,
} from "../../src/diffLineTokens.ts";
import {
  highlightSourceLines,
  type SourceTokenLine,
} from "../../src/sourceHighlight.ts";
import { parsedUnifiedDiff, type DiffLine } from "../../src/unifiedDiff.ts";
import {
  greetDiff,
  greetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";

const sides: DiffSideTokens = {
  oldSide: await highlightSourceLines(greetText.baseline, "typescript"),
  newSide: await highlightSourceLines(greetText.tree, "typescript"),
};
const markers = { added: "+", removed: "-", unchanged: " " } as const;
const hunkLines = parsedUnifiedDiff(
  greetDiff("greet.ts").printed,
).hunks.flatMap(({ lines }) => lines);

function hunkLine(printed: string): DiffLine {
  const line = hunkLines.find(
    ({ kind, text }) => `${markers[kind]}${text}` === printed,
  );
  if (line === undefined) throw new Error(`no hunk line ${printed}`);
  return line;
}

// The token line the hunk line printed as `printed` reads from both sides.
function tokensOf(printed: string) {
  return diffLineTokenLine(hunkLine(printed), sides);
}

// The light colour of the token holding `word` in a token line.
function colourOf(tokens: SourceTokenLine | undefined, word: RegExp) {
  return tokens?.find(({ content }) => word.test(content))?.light;
}

const newLine = (number: number, text: string): DiffLine => ({
  kind: "unchanged",
  text,
  oldNumber: number,
  newNumber: number,
});

test.each([
  { printed: "    and close here */", side: "newSide", number: 27 },
  { printed: ' const greeting = "hello";', side: "newSide", number: 28 },
  { printed: '-const farewell = "bye"; // old', side: "oldSide", number: 29 },
  { printed: "-const banner = `", side: "oldSide", number: 30 },
  { printed: "-const status = old;", side: "oldSide", number: 31 },
  { printed: "-`;", side: "oldSide", number: 32 },
  { printed: '+const farewell = "later"; // new', side: "newSide", number: 29 },
  { printed: "+const status = now;", side: "newSide", number: 30 },
  { printed: " export default greeting;", side: "newSide", number: 31 },
] as const)(
  "$printed reads line $number of the $side",
  ({ printed, side, number }) => {
    const tokens = tokensOf(printed);
    expect(tokens).toBeDefined();
    expect(tokens).toBe(sides[side]?.[number - 1]);
  },
);

test("a comment opened above the hunk styles its lines as comment", () => {
  const commentColour = colourOf(
    tokensOf('+const farewell = "later"; // new'),
    /new/,
  );
  expect(commentColour).toBeDefined();
  for (const [line, word] of [
    [hunkLine("    and close here */"), /and close here/],
    [newLine(25, "/* the greeting's notes"), /greeting's notes/],
  ] as const) {
    expect(colourOf(diffLineTokenLine(line, sides), word)).toBe(commentColour);
  }
  expect(colourOf(tokensOf(' const greeting = "hello";'), /greeting/)).not.toBe(
    commentColour,
  );
});

test("a removed line inside a removed template string reads as that string", () => {
  const stringColour = colourOf(
    tokensOf('-const farewell = "bye"; // old'),
    /bye/,
  );
  const unchangedKeyword = colourOf(
    tokensOf(' const greeting = "hello";'),
    /^const$/,
  );
  expect(stringColour).toBeDefined();
  expect(colourOf(tokensOf("-const status = old;"), /status/)).toBe(
    stringColour,
  );
  expect(colourOf(tokensOf("+const status = now;"), /^const$/)).toBe(
    unchangedKeyword,
  );
  expect(unchangedKeyword).not.toBe(stringColour);
});

test.each([
  {
    name: "a line its side does not spell",
    line: {
      ...hunkLine("+const status = now;"),
      text: "const status = later;",
    },
    tokens: sides,
  },
  {
    name: "a line past its side's end",
    line: newLine(99, "export default greeting;"),
    tokens: sides,
  },
  {
    name: "a line before its side's tokens arrive",
    line: hunkLine("-const status = old;"),
    tokens: { oldSide: undefined, newSide: sides.newSide },
  },
])("$name reads plain", ({ line, tokens }) => {
  expect(diffLineTokenLine(line, tokens)).toBeUndefined();
});
