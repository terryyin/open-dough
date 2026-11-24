// A TypeScript grammar that fails to load leaves a review's code plain and
// complete, its context revealable, with nothing added in place of styling.
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { greetText } from "../../test-support/support/diffSyntaxFixtures.ts";
import {
  expectPlainAndComplete,
  greetingDiffHunkLines,
  openGreetingReview,
} from "./greetingDiff.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";

// The page asked for the grammar, and its load failed.
const grammar = vi.hoisted(() => ({ failed: false }));
vi.mock("@shikijs/langs/typescript", () => {
  grammar.failed = true;
  throw new Error("The TypeScript grammar could not be loaded.");
});

test("a grammar that fails to load leaves the code plain with nothing added", async () => {
  await openGreetingReview(() => Promise.resolve(greetText));
  const diff = reviewDiffPage();
  await expect.poll(() => grammar.failed).toBe(true);

  await expectPlainAndComplete(diff);
  await diff.showPrecedingLines();
  await expect.poll(() => diff.revealedLines().length).toBe(20);
  expect(diff.lineFacts().map(({ text }) => text)).toEqual(
    expect.arrayContaining([...greetingDiffHunkLines]),
  );
  expect(diff.firstToken().query()).toBeNull();
  expect(page.getByRole("alert").query()).toBeNull();
});
