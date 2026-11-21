// Rendering a styled review diff: styling keeps the plain diff's line facts
// and copied text, and preceding lines revealed later are styled too. Which
// token line each line reads is checked as logic in
// `story-review-diff-line-sides.spec.ts`.

import { expect, test } from "vitest";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  greetDiff,
  greetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";
import { styledDiffReading } from "./styledDiffReading.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";

function greetingDiff(path: string) {
  return styledDiffReading({
    key: path,
    path,
    printed: greetDiff(path).printed,
    text: greetText,
  });
}

test("a styled TypeScript diff keeps the plain diff's change facts and copy, and styles revealed lines", async () => {
  const { rerender } = await mountComponent(greetingDiff("base.txt"));
  const diff = reviewDiffPage();
  await expect
    .element(diff.newLine(31).line)
    .toHaveTextContent(" export default greeting;", {
      normalizeWhitespace: false,
    });
  const plainFacts = diff.lineFacts();
  const plainCopy = diff.selectedText(
    diff.newLine(28).line,
    diff.removedLine(30).line,
  );
  expect(plainCopy).toBe(
    ' const greeting = "hello";\n-const farewell = "bye"; // old\n-const banner = `\n',
  );
  expect(diff.firstToken().elements()).toHaveLength(0);

  rerender(greetingDiff("greet.ts"));
  await expect.element(diff.removedLine(29).token(/bye/)).toBeVisible();
  expect(diff.lineFacts()).toEqual(plainFacts);
  expect(
    diff.selectedText(diff.newLine(28).line, diff.removedLine(30).line),
  ).toBe(plainCopy);

  await diff.showPrecedingLines();
  await expect
    .poll(() =>
      diff.revealedLines().map((line) => line.firstToken().elements().length),
    )
    .toEqual(Array<number>(20).fill(1));
});
