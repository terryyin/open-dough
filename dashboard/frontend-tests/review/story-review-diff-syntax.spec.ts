// A review's file diff styles its code by the file's language: removed lines
// as they read in the old file's whole text, every other line (revealed
// context included) as in the new file's, while markers, numbers,
// backgrounds and copied text stay those of the plain diff that a file of
// another language shows.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { frontendReviewSnapshot } from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import {
  greetDiff,
  greetText,
} from "../../tests/support/diffSyntaxFixtures.ts";
import {
  storyReviewDiff,
  tokenAppearance,
} from "../../tests/support/reviewDiffSyntax.ts";

const styledPath = "greet.ts";
const plainPath = "base.txt";

test("a TypeScript diff styles each line by its side's whole text and keeps the plain diff's change facts", async ({
  page,
  frontendServices,
}) => {
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [styledPath, plainPath].map((path) => ({
        kind: "modified" as const,
        path,
        lines: { added: 2, removed: 4 },
      })),
    }),
    (answers) => {
      for (const path of [styledPath, plainPath]) {
        answers.answerFile(greetDiff(path), path);
        answers.answerFileText(greetText, path);
      }
    },
  );

  await fileRow(review, `Modified ${plainPath}`).click();
  const plain = storyReviewDiff(fileDiff(review, `Modified ${plainPath}`));
  await expect(plain.newLine(31).line).toHaveText(" export default greeting;");
  await expect(plain.showPrecedingLines()).toBeVisible();
  const plainFacts = await plain.lineFacts();
  const plainCopy = await plain.selectedText(
    plain.newLine(28),
    plain.removedLine(30),
  );
  await expect(plain.codeTokens()).toHaveCount(0);

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = storyReviewDiff(fileDiff(review, `Modified ${styledPath}`));
  const unchanged = diff.newLine(28);
  const added = diff.newLine(29);
  const removed = diff.removedLine(29);
  await expect(unchanged.token(/^const$/)).toBeVisible();

  await test.step("keywords and strings differ on unchanged, added and removed lines", async () => {
    for (const [line, string] of [
      [unchanged, /hello/],
      [added, /later/],
      [removed, /bye/],
    ] as const) {
      const keyword = await tokenAppearance(line.token(/^const$/));
      const quoted = await tokenAppearance(line.token(string));
      expect(keyword.color).not.toBe(quoted.color);
    }
  });

  await test.step("a hunk inside a comment opened above it reads as comment", async () => {
    const opening = diff.newLine(27);
    const added = await tokenAppearance(diff.newLine(29).token(/new/));
    expect(await tokenAppearance(opening.token(/and close here/))).toEqual(
      added,
    );
    expect(
      (await tokenAppearance(opening.token(/and close here/))).color,
    ).not.toBe((await tokenAppearance(unchanged.token(/greeting/))).color);
  });

  await test.step("the removed line reads as the old file's string, the added one as code", async () => {
    const oldString = await tokenAppearance(
      diff.removedLine(31).token(/status/),
    );
    const newCode = await tokenAppearance(diff.newLine(30).token(/^const$/));
    expect(oldString.color).toBe(
      (await tokenAppearance(removed.token(/bye/))).color,
    );
    expect(newCode.color).not.toBe(oldString.color);
    expect(newCode).toEqual(await tokenAppearance(unchanged.token(/^const$/)));
  });

  await test.step("markers, numbers, backgrounds and copied text equal the plain diff's", async () => {
    expect(await diff.lineFacts()).toEqual(plainFacts);
    expect(
      await diff.selectedText(diff.newLine(28), diff.removedLine(30)),
    ).toBe(plainCopy);
    expect(plainCopy).toBe(
      ' const greeting = "hello";\n-const farewell = "bye"; // old\n-const banner = `\n',
    );
  });

  await test.step("20 revealed context lines arrive styled from the new side", async () => {
    await diff.showPrecedingLines().click();
    await expect(diff.revealedBefore()).toHaveCount(20);
    for (const line of await diff.revealedLines())
      await expect(line.token(/./)).toBeVisible();
    expect(
      await tokenAppearance(diff.newLine(25).token(/greeting's notes/)),
    ).toEqual(await tokenAppearance(diff.newLine(27).token(/close/)));
  });

  await fileRow(review, `Modified ${plainPath}`).click();
  await plain.showPrecedingLines().click();
  await expect(plain.revealedBefore()).toHaveCount(20);
  await expect(plain.codeTokens()).toHaveCount(0);
});
