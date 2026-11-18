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
  storyReviewDiff,
  type StoryReviewDiff,
} from "../../tests/support/reviewDiffSyntax.ts";
import { failGrammar, holdGrammar } from "../../tests/support/syntaxGrammar.ts";
import type { HeldAnswer } from "../../tests/support/frontendSubstituteAnswers.ts";

const styledPath = "greet.ts";
const plainPath = "base.txt";
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

async function expectPlainAndComplete(diff: StoryReviewDiff) {
  await expect(diff.newLine(31).line).toHaveText(" export default greeting;");
  expect((await diff.lineFacts()).map(({ text }) => text)).toEqual(
    printedLines,
  );
  await expect(diff.codeTokens()).toHaveCount(0);
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
  const diff = storyReviewDiff(fileDiff(review, `Modified ${styledPath}`));
  await grammar.requested;
  await expectPlainAndComplete(diff);

  await diff.showPrecedingLines().click();
  await expect(diff.revealedBefore()).toHaveCount(20);
  const reading = diff.newLine(20);
  await reading.scrollIntoView();
  const place = await reading.place();
  const menuLabel = "New line 20";
  await openLineMenu(lineNumberControl(diff.locator, "new", 20), "pointer");
  await expectLineMenuOpen(page, menuLabel);
  await expect(diff.codeTokens()).toHaveCount(0);

  grammar.release();
  await expect(diff.newLine(28).token(/^const$/)).toBeVisible();
  await test.step("revealed lines arrive styled where they were, under the open menu", async () => {
    await expect(diff.revealedBefore()).toHaveCount(20);
    for (const line of await diff.revealedLines())
      await expect(line.token(/./)).toBeVisible();
    await expectLineMenuOpen(page, menuLabel);
    expect(await reading.place()).toBe(place);
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
  const diff = storyReviewDiff(fileDiff(review, `Modified ${styledPath}`));
  await text.received;
  await expectPlainAndComplete(diff);

  text.release();
  await expect(diff.newLine(28).token(/^const$/)).toBeVisible();
  expect((await diff.lineFacts()).map(({ text: line }) => line)).toEqual(
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
  const plain = storyReviewDiff(fileDiff(review, `Modified ${plainPath}`));
  await expect(plain.locator.getByRole("alert")).toHaveText(problem);
  const plainWords = await plain.words(plainPath);

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = storyReviewDiff(fileDiff(review, `Modified ${styledPath}`));
  await expect(diff.locator.getByRole("alert")).toHaveText(problem);
  await expectPlainAndComplete(diff);
  expect(await diff.words(styledPath)).toBe(plainWords);

  await diff.locator.getByRole("button", { name: "Retry" }).click();
  await expect(diff.newLine(28).token(/^const$/)).toBeVisible();
  await expect(diff.locator.getByRole("alert")).toHaveCount(0);
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
  const plain = storyReviewDiff(fileDiff(review, `Modified ${plainPath}`));
  await plain.showPrecedingLines().click();
  await expect(plain.revealedBefore()).toHaveCount(20);
  const plainWords = await plain.words(plainPath);

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = storyReviewDiff(fileDiff(review, `Modified ${styledPath}`));
  await grammar.failed;
  await expectPlainAndComplete(diff);
  await diff.showPrecedingLines().click();
  await expect(diff.revealedBefore()).toHaveCount(20);
  await expect(diff.codeTokens()).toHaveCount(0);
  expect(await diff.words(styledPath)).toBe(plainWords);
});
