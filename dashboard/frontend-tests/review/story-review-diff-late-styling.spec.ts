import { expect, test } from "vitest";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  greetDiff,
  greetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";
import { greetingDiffHunkLines } from "./greetingDiffExpectations.ts";
import { styledDiffReading } from "./styledDiffReading.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";
import { printedDiff } from "./styledDiffCases.ts";
import { limit } from "./wordEmphasisCases.ts";

const readingViewport = {
  viewport: { width: 1280, height: 320 },
  fillsViewport: true,
};

async function expectPlainAndComplete(diff: ReturnType<typeof reviewDiffPage>) {
  await expect
    .element(diff.newLine(31).line)
    .toHaveTextContent(" export default greeting;", {
      normalizeWhitespace: false,
    });
  expect(diff.lineFacts().map(({ text }) => text)).toEqual(
    greetingDiffHunkLines,
  );
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
}

test("a diff shown before its text is read stays plain and complete until the text arrives", async () => {
  const path = "greet.ts";
  const input = { path, printed: greetDiff(path).printed };
  const { rerender } = await mountComponent(styledDiffReading(input));
  const diff = reviewDiffPage();
  await expectPlainAndComplete(diff);

  rerender(styledDiffReading({ ...input, text: greetText }));
  await expect.element(diff.newLine(28).token(/^const$/)).toBeVisible();
  expect(diff.lineFacts().map(({ text }) => text)).toEqual(
    greetingDiffHunkLines,
  );
});

test("styling that arrives after the diff keeps the reading position, revealed context and an open line menu", async () => {
  const path = "greet.txt";
  const input = {
    path,
    printed: greetDiff(path).printed,
    text: greetText,
    onLineFollowUp: () => {},
    onLineAddNote: () => {},
  };
  const { rerender } = await mountComponent(
    styledDiffReading(input),
    readingViewport,
  );
  const diff = reviewDiffPage();
  await expectPlainAndComplete(diff);

  await diff.showPrecedingLines();
  await expect.poll(() => diff.revealedLines().length).toBe(20);
  const lineNumbers = () =>
    diff.lineFacts().map(({ old, new: next }) => ({ old, next }));
  const revealedReading = lineNumbers();
  const reading = diff.newLine(20);
  reading.scrollIntoView();
  await expect.poll(diff.scrollTop).toBeGreaterThan(0);
  const place = reading.place();
  const label = "New line 20";
  const { menu, itemLabels } = diff.lineMenu(label);
  await diff.openLineMenu(label);
  await expect.element(menu).toBeVisible();
  expect(itemLabels()).toEqual(["Follow up", "Add note"]);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();

  rerender(styledDiffReading({ ...input, syntaxHint: "typescript" }));
  await expect.element(diff.newLine(28).token(/^const$/)).toBeVisible();
  await expect.poll(() => diff.revealedLines().length).toBe(20);
  for (const line of diff.revealedLines()) {
    await expect.element(line.firstToken()).toBeVisible();
  }
  expect(lineNumbers()).toEqual(revealedReading);
  await expect.element(menu).toBeVisible();
  expect(itemLabels()).toEqual(["Follow up", "Add note"]);
  expect(reading.place()).toBe(place);
});

test("emphasis is present before tokens arrive and stays on the same words after", async () => {
  const path = "limit.ts";
  const unchangedBefore = limit.text.baseline.split("\n").slice(0, 24);
  const input = {
    path,
    printed: printedDiff(path, [
      "@@ -1,26 +1,26 @@",
      ...unchangedBefore.map((line) => ` ${line}`),
      "-const limit = 20;",
      "+const limit = 25;",
      " keep this line;",
    ]),
  };
  const { rerender } = await mountComponent(
    styledDiffReading(input),
    readingViewport,
  );
  const diff = reviewDiffPage();
  const added = diff.newLine(25);
  const removed = diff.removedLine(25);
  await expect.poll(added.insertedWords).toEqual(["25"]);
  expect(removed.deletedWords()).toEqual(["20"]);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();

  added.scrollIntoView();
  await expect.poll(diff.scrollTop).toBeGreaterThan(0);
  const place = added.place();
  rerender(styledDiffReading({ ...input, text: limit.text }));
  await expect.element(added.token(/^25$/)).toBeVisible();
  expect(added.insertedWords()).toEqual(["25"]);
  expect(removed.deletedWords()).toEqual(["20"]);
  expect(
    added
      .tokensInInsertion()
      .elements()
      .map((token) => token.textContent),
  ).toEqual(["25"]);
  expect(added.place()).toBe(place);
});
