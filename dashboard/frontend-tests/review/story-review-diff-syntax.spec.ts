// A review's file diff styles its code by the file's language: removed lines
// as they read in the old file's whole text, every other line (revealed
// context included) as in the new file's, while markers, numbers,
// backgrounds, copied and accessible text stay those of the plain diff that a
// file of another language shows.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { frontendReviewSnapshot } from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import { diffHunk } from "../../tests/support/reviewPanes.ts";
import {
  greetDiff,
  greetText,
} from "../../tests/support/diffSyntaxFixtures.ts";
import {
  codeToken,
  codeTokens,
  lineFacts,
  newLine,
  removedLine,
  revealedBefore,
  selectedText,
  showPrecedingLines,
  tokenAppearance,
} from "../../tests/support/reviewDiffSyntax.ts";

const styledPath = "greet.ts";
const plainPath = "greet.md";
const hunk = "@@ -27,7 +27,5 @@";

test("a TypeScript diff styles each line by its side's whole text and keeps the plain diff's change facts", async ({
  page,
  frontendServices,
}) => {
  const { review, answers } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [styledPath, plainPath].map((path) => ({
        kind: "modified" as const,
        path,
        lines: { added: 2, removed: 4 },
      })),
    }),
  );
  for (const path of [styledPath, plainPath]) {
    answers.answerFile(greetDiff(path), path);
    answers.answerFileText(greetText, path);
  }

  await fileRow(review, `Modified ${plainPath}`).click();
  const plain = fileDiff(review, `Modified ${plainPath}`);
  await expect(newLine(plain, 31)).toHaveText(" export default greeting;");
  await expect(showPrecedingLines(plain)).toBeVisible();
  const plainFacts = await lineFacts(plain);
  const plainAccessible = await diffHunk(plain, hunk).ariaSnapshot();
  const plainCopy = await selectedText(
    newLine(plain, 28),
    removedLine(plain, 30),
  );
  await expect(codeTokens(plain)).toHaveCount(0);

  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = fileDiff(review, `Modified ${styledPath}`);
  const unchanged = newLine(diff, 28);
  const added = newLine(diff, 29);
  const removed = removedLine(diff, 29);
  await expect(codeToken(unchanged, /^const$/)).toBeVisible();

  await test.step("keywords and strings differ on unchanged, added and removed lines", async () => {
    for (const [line, string] of [
      [unchanged, /hello/],
      [added, /later/],
      [removed, /bye/],
    ] as const) {
      const keyword = await tokenAppearance(codeToken(line, /^const$/));
      const quoted = await tokenAppearance(codeToken(line, string));
      expect(keyword.color).not.toBe(quoted.color);
    }
  });

  await test.step("a hunk inside a comment opened above it reads as comment", async () => {
    const opening = newLine(diff, 27);
    const added = await tokenAppearance(codeToken(newLine(diff, 29), /new/));
    expect(await tokenAppearance(codeToken(opening, /and close here/))).toEqual(
      added,
    );
    expect(
      (await tokenAppearance(codeToken(opening, /and close here/))).color,
    ).not.toBe((await tokenAppearance(codeToken(unchanged, /greeting/))).color);
  });

  await test.step("the removed line reads as the old file's string, the added one as code", async () => {
    const oldString = await tokenAppearance(
      codeToken(removedLine(diff, 31), /status/),
    );
    const newCode = await tokenAppearance(
      codeToken(newLine(diff, 30), /^const$/),
    );
    expect(oldString.color).toBe(
      (await tokenAppearance(codeToken(removed, /bye/))).color,
    );
    expect(newCode.color).not.toBe(oldString.color);
    expect(newCode).toEqual(
      await tokenAppearance(codeToken(unchanged, /^const$/)),
    );
  });

  await test.step("markers, numbers, backgrounds, accessible and copied text equal the plain diff's", async () => {
    expect(await lineFacts(diff)).toEqual(plainFacts);
    expect(await diffHunk(diff, hunk).ariaSnapshot()).toBe(plainAccessible);
    expect(await selectedText(newLine(diff, 28), removedLine(diff, 30))).toBe(
      plainCopy,
    );
    expect(plainCopy).toBe(
      ' const greeting = "hello";\n-const farewell = "bye"; // old\n-const banner = `\n',
    );
  });

  await test.step("20 revealed context lines arrive styled from the new side", async () => {
    await showPrecedingLines(diff).click();
    const revealed = revealedBefore(diff);
    await expect(revealed).toHaveCount(20);
    for (const line of await revealed.all())
      await expect(codeToken(line, /./)).toBeVisible();
    expect(
      await tokenAppearance(codeToken(newLine(diff, 25), /greeting's notes/)),
    ).toEqual(await tokenAppearance(codeToken(newLine(diff, 27), /close/)));
  });

  await fileRow(review, `Modified ${plainPath}`).click();
  await showPrecedingLines(plain).click();
  await expect(revealedBefore(plain)).toHaveCount(20);
  await expect(codeTokens(plain)).toHaveCount(0);
});
