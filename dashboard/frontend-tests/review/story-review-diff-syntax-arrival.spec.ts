// A review's file diff shows its lines plain and complete until its text and
// grammar are read; styling then arrives in place, keeping the reading
// position, revealed context and an open line menu. Text that cannot be read
// or a grammar that fails to load leaves the code plain, with only the
// existing context problem and Retry; text a Retry reads styles the lines.

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendPublishedReview,
  frontendReviewSnapshot,
} from "../../tests/support/frontendStoryReview.ts";
import {
  openFrontendDoneStoryReview,
  openFrontendStoryReview,
} from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import {
  expectLineMenuOpen,
  lineNumberControl,
  openLineMenu,
} from "../../tests/support/diffLineFollowUpPage.ts";
import {
  greetDiff,
  greetText,
} from "../../tests/support/diffSyntaxFixtures.ts";
import {
  codeToken,
  codeTokens,
  diffWords,
  lineFacts,
  newLine,
  placeOf,
  revealedBefore,
  showPrecedingLines,
} from "../../tests/support/reviewDiffSyntax.ts";
import { failGrammar, holdGrammar } from "../../tests/support/syntaxGrammar.ts";
import type { Locator } from "@playwright/test";
import type { HeldAnswer } from "../../tests/support/frontendSubstituteAnswers.ts";

const styledPath = "greet.ts";
const plainPath = "greet.md";
const files = [styledPath, plainPath].map((path) => ({
  kind: "modified" as const,
  path,
  lines: { added: 2, removed: 4 },
}));

// The printed hunk's lines as the plain diff shows them.
const printedLines = [
  "    and close here */",
  ' const greeting = "hello";',
  '-const farewell = "bye"; // old',
  "-const banner = `",
  "-const status = old;",
  "-`;",
  '+const farewell = "later"; // new',
  "+const status = now;",
  " export default greeting;",
];

async function expectPlainAndComplete(diff: Locator) {
  await expect(newLine(diff, 31)).toHaveText(" export default greeting;");
  expect((await lineFacts(diff)).map(({ text }) => text)).toEqual(printedLines);
  await expect(codeTokens(diff)).toHaveCount(0);
}

test("styling that arrives after the diff keeps the reading position, revealed context and an open line menu", async ({
  page,
  frontendServices,
}) => {
  const grammar = await holdGrammar(page, "typescript");
  const { review } = await openFrontendDoneStoryReview(
    page,
    frontendServices,
    frontendPublishedReview(files),
    (answers) => {
      answers.answerFile(greetDiff(styledPath), styledPath);
      answers.answerFileText(greetText, styledPath);
    },
  );
  await page.setViewportSize({ width: 1280, height: 480 });

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = fileDiff(review, `Modified ${styledPath}`);
  await grammar.requested;
  await expectPlainAndComplete(diff);

  await showPrecedingLines(diff).click();
  await expect(revealedBefore(diff)).toHaveCount(20);
  const reading = newLine(diff, 20);
  await reading.scrollIntoViewIfNeeded();
  const place = await placeOf(reading);
  const menuLabel = "New line 20";
  await openLineMenu(lineNumberControl(diff, "new", 20), "pointer");
  await expectLineMenuOpen(page, menuLabel);
  await expect(codeTokens(diff)).toHaveCount(0);

  grammar.release();
  await expect(codeToken(newLine(diff, 28), /^const$/)).toBeVisible();
  await test.step("revealed lines arrive styled where they were, under the open menu", async () => {
    await expect(revealedBefore(diff)).toHaveCount(20);
    for (const line of await revealedBefore(diff).all())
      await expect(codeToken(line, /./)).toBeVisible();
    await expectLineMenuOpen(page, menuLabel);
    expect(await placeOf(reading)).toBe(place);
  });
});

test("a diff shown before its text is read stays plain and complete until the text arrives", async ({
  page,
  frontendServices,
}) => {
  const holds: HeldAnswer[] = [];
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({ files }),
    (answers) => {
      answers.answerFile(greetDiff(styledPath), styledPath);
      answers.answerFileText(greetText, styledPath);
      holds.push(answers.holdNextFileText(styledPath));
    },
  );
  const [text] = holds;
  if (text === undefined) throw new Error("the first text read is not held");

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = fileDiff(review, `Modified ${styledPath}`);
  await text.received;
  await expectPlainAndComplete(diff);

  text.release();
  await expect(codeToken(newLine(diff, 28), /^const$/)).toBeVisible();
  expect((await lineFacts(diff)).map(({ text: line }) => line)).toEqual(
    printedLines,
  );
});

test("text that cannot be read leaves plain lines with only the context problem and Retry, and a Retry that reads it styles them", async ({
  page,
  frontendServices,
}) => {
  const unavailable = {
    kind: "unavailable",
    explanation: "The story's tree is not on this machine.",
  } as const;
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({ files }),
    (answers) => {
      for (const path of files.map((file) => file.path)) {
        answers.answerFile(greetDiff(path), path);
        answers.answerNextFileText(unavailable, path);
        answers.answerFileText(greetText, path);
      }
    },
  );
  const problem = `Additional context could not be read: ${unavailable.explanation} Retry`;

  await fileRow(review, `Modified ${plainPath}`).click();
  const plain = fileDiff(review, `Modified ${plainPath}`);
  await expect(plain.getByRole("alert")).toHaveText(problem);
  const plainWords = await diffWords(plain, plainPath);

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = fileDiff(review, `Modified ${styledPath}`);
  await expect(diff.getByRole("alert")).toHaveText(problem);
  await expectPlainAndComplete(diff);
  expect(await diffWords(diff, styledPath)).toBe(plainWords);

  await diff.getByRole("button", { name: "Retry" }).click();
  await expect(codeToken(newLine(diff, 28), /^const$/)).toBeVisible();
  await expect(diff.getByRole("alert")).toHaveCount(0);
});

test("a grammar that fails to load leaves the code plain with nothing added", async ({
  page,
  frontendServices,
}) => {
  const grammar = await failGrammar(page, "typescript");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({ files }),
    (answers) => {
      for (const path of files.map((file) => file.path)) {
        answers.answerFile(greetDiff(path), path);
        answers.answerFileText(greetText, path);
      }
    },
  );

  await fileRow(review, `Modified ${plainPath}`).click();
  const plain = fileDiff(review, `Modified ${plainPath}`);
  await showPrecedingLines(plain).click();
  await expect(revealedBefore(plain)).toHaveCount(20);
  const plainWords = await diffWords(plain, plainPath);

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = fileDiff(review, `Modified ${styledPath}`);
  await grammar.failed;
  await expectPlainAndComplete(diff);
  await showPrecedingLines(diff).click();
  await expect(revealedBefore(diff)).toHaveCount(20);
  await expect(codeTokens(diff)).toHaveCount(0);
  expect(await diffWords(diff, styledPath)).toBe(plainWords);
});
