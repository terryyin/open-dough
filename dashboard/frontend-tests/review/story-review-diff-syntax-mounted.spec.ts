import { expect, test } from "vitest";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  greetDiff,
  greetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";
import { styledDiffReading } from "./mountedFileDiff.ts";
import { mountedReviewDiff, tokenAppearance } from "./mountedReviewDiffPage.ts";

function greetingDiff(path: string) {
  return styledDiffReading({
    key: path,
    path,
    printed: greetDiff(path).printed,
    text: greetText,
  });
}

test("a TypeScript diff styles each line by its side's whole text and keeps the plain diff's change facts", async () => {
  const { rerender } = await mountComponent(greetingDiff("base.txt"));
  const diff = mountedReviewDiff();
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
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
  await diff.showPrecedingLines();
  await expect.poll(() => diff.revealedLines().length).toBe(20);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();

  rerender(greetingDiff("greet.ts"));
  const unchanged = diff.newLine(28);
  const added = diff.newLine(29);
  const removed = diff.removedLine(29);
  for (const [line, quotedText] of [
    [unchanged, /hello/],
    [added, /later/],
    [removed, /bye/],
  ] as const) {
    const keyword = line.token(/^const$/);
    const quoted = line.token(quotedText);
    await expect.element(keyword).toBeVisible();
    await expect.element(quoted).toBeVisible();
    expect(tokenAppearance(keyword).color).not.toBe(
      tokenAppearance(quoted).color,
    );
  }

  const commentEnd = tokenAppearance(diff.newLine(27).token(/and close here/));
  expect(commentEnd).toEqual(tokenAppearance(added.token(/new/)));
  expect(commentEnd.color).not.toBe(
    tokenAppearance(unchanged.token(/greeting/)).color,
  );

  const oldString = tokenAppearance(diff.removedLine(31).token(/status/));
  const newCode = tokenAppearance(diff.newLine(30).token(/^const$/));
  expect(oldString.color).toBe(tokenAppearance(removed.token(/bye/)).color);
  expect(newCode.color).not.toBe(oldString.color);
  expect(newCode).toEqual(tokenAppearance(unchanged.token(/^const$/)));

  expect(diff.lineFacts()).toEqual(plainFacts);
  expect(diff.selectedText(unchanged.line, diff.removedLine(30).line)).toBe(
    plainCopy,
  );

  await diff.showPrecedingLines();
  await expect.poll(() => diff.revealedLines().length).toBe(20);
  for (const line of diff.revealedLines()) {
    await expect.element(line.firstToken()).toBeVisible();
  }
  expect(tokenAppearance(diff.newLine(25).token(/greeting's notes/))).toEqual(
    commentEnd,
  );
});
