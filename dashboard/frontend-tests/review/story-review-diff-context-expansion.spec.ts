// Expanding omitted context in a review diff from the comparison's file text:
// directional steps of up to 20 lines close a gap without duplicates, stop at
// the end of the file, offer no whole-gap shortcut, and number revealed lines
// as unchanged context. Keeping the reading place while expanding upward needs
// real layout and is proved in `e2e/intent/intent-diff-context-expansion.spec.ts`.

import { expect, test } from "vitest";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";
import { styledDiffReading } from "./styledDiffReading.ts";

const path = "expand-context.txt";
const fileLines = (changed: Record<number, string>) =>
  [...Array(160).keys()]
    .map((at) => `${changed[at + 1] ?? `line ${String(at + 1)}`}\n`)
    .join("");

// Lines 54 and 127 of 160 changed: gaps of 50 lines before, 66 between and
// 30 after Git's two printed hunks.
const contextLines = (from: number, to: number) =>
  [...Array(to - from + 1).keys()].map((at) => ` line ${String(from + at)}`);
const hunk = (first: number, changed: string) => [
  `@@ -${String(first)},7 +${String(first)},7 @@ line ${String(first - 1)}`,
  ...contextLines(first, first + 2),
  `-line ${String(first + 3)}`,
  `+${changed}`,
  ...contextLines(first + 4, first + 6),
];
const expandContextReading = () =>
  styledDiffReading({
    path,
    printed: [
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      ...hunk(51, "changed fifty-four"),
      ...hunk(124, "changed one-twenty-seven"),
      "",
    ].join("\n"),
    text: {
      kind: "text",
      baseline: fileLines({}),
      tree: fileLines({
        54: "changed fifty-four",
        127: "changed one-twenty-seven",
      }),
    },
  });

const diff = reviewDiffPage();
const before = () => diff.contextGap("before");
const between = () => diff.contextGap("between");
const after = () => diff.contextGap("after");

test("each gap offers only directional steps of up to 20 lines", async () => {
  await mountComponent(expandContextReading());
  await expect
    .poll(() => before().expansions())
    .toEqual(["Show 20 preceding lines"]);
  expect(between().expansions()).toEqual([
    "Show 20 preceding lines",
    "Show 20 following lines",
  ]);
  expect(after().expansions()).toEqual(["Show 20 following lines"]);
});

test("steps from both ends close the gap between changes without duplicates, ending with the remainder", async () => {
  await mountComponent(expandContextReading());
  const gap = between();
  await gap.show("Show 20 following lines");
  await gap.show("Show 20 preceding lines");
  await expect
    .poll(() => gap.texts())
    .toEqual([...contextLines(58, 77), ...contextLines(104, 123)]);
  await gap.show("Show 20 following lines");
  await gap.show("Show 6 following lines");
  await expect.poll(() => gap.texts()).toEqual(contextLines(58, 123));
  expect(gap.expansions()).toEqual([]);
});

test("steps after the last change stop at the end of the file", async () => {
  await mountComponent(expandContextReading());
  const gap = after();
  await gap.show("Show 20 following lines");
  await gap.show("Show 10 following lines");
  await expect.poll(() => gap.texts()).toEqual(contextLines(131, 160));
  expect(gap.expansions()).toEqual([]);
});

test("revealed lines are numbered unchanged context on both sides", async () => {
  await mountComponent(expandContextReading());
  const gap = before();
  await gap.show("Show 20 preceding lines");
  await expect
    .poll(() => gap.facts())
    .toEqual(
      [...Array(20).keys()].map((at) => ({
        text: ` line ${String(31 + at)}`,
        old: String(31 + at),
        new: String(31 + at),
        kind: "story-review-line story-review-unchanged",
      })),
    );
});
