// Story-review word emphasis on syntax-styled lines: changed words keep token
// colours inside insertions/deletions, remain marked before tokens arrive, and
// stay readable (token and underline contrast) in light and dark.

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  colorBehind,
  contrastRatio,
  expectReadableContrast,
} from "../../tests/accessibleReading.ts";
import { setColorScheme } from "../../tests/systemAppearanceReading.ts";
import { frontendReviewSnapshot } from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import {
  limitDiff,
  limitText,
} from "../../tests/support/diffWordEmphasisFixtures.ts";
import { openLimitTsWordEmphasisDiff } from "../../tests/support/diffWordEmphasisOpen.ts";
import {
  codeToken,
  codeTokens,
  deletions,
  fileReads,
  insertions,
  newLine,
  placeOf,
  removedLine,
  tokenAppearance,
  tokensInMark,
} from "../../tests/support/reviewDiffSyntax.ts";
import { holdGrammar } from "../../tests/support/syntaxGrammar.ts";

test("styled changed words keep token colours inside insertions and deletions", async ({
  page,
  frontendServices,
}) => {
  const diff = await openLimitTsWordEmphasisDiff(page, frontendServices);
  const removed = removedLine(diff, 25);
  const added = newLine(diff, 25);

  await expect(codeToken(added, /^const$/)).toBeVisible();
  await expect(deletions(removed)).toHaveText(["20"]);
  await expect(insertions(added)).toHaveText(["25"]);

  const numberInInsertion = tokensInMark(insertions(added)).filter({
    hasText: /^25$/,
  });
  const numberInDeletion = tokensInMark(deletions(removed)).filter({
    hasText: /^20$/,
  });
  await expect(numberInInsertion).toHaveCount(1);
  await expect(numberInDeletion).toHaveCount(1);

  const numberLook = await tokenAppearance(numberInInsertion);
  const keywordLook = await tokenAppearance(codeToken(added, /^const$/));
  expect(numberLook.color).not.toBe(keywordLook.color);

  await expect(added).toHaveClass(/story-review-added/);
  await expect(removed).toHaveClass(/story-review-removed/);
  await expect(added).toHaveText(/^\+const limit = 25;/);
  await expect(removed).toHaveText(/^-const limit = 20;/);
});

test("emphasis is present before tokens arrive and stays on the same words after", async ({
  page,
  frontendServices,
}) => {
  const grammar = await holdGrammar(page, "typescript");
  const path = "limit.ts";
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [
        { kind: "modified" as const, path, lines: { added: 1, removed: 1 } },
      ],
    }),
    (answers) => {
      answers.answerFile(limitDiff(path), path);
      answers.answerFileText(limitText, path);
    },
  );
  await fileRow(review, `Modified ${path}`).click();
  const diff = fileDiff(review, `Modified ${path}`);
  await grammar.requested;

  const added = newLine(diff, 25);
  await expect(insertions(added)).toHaveText(["25"]);
  await expect(deletions(removedLine(diff, 25))).toHaveText(["20"]);
  await expect(codeTokens(diff)).toHaveCount(0);
  const place = await placeOf(added);

  grammar.release();
  await expect(codeToken(added, /^25$/)).toBeVisible();
  await expect(insertions(added)).toHaveText(["25"]);
  await expect(deletions(removedLine(diff, 25))).toHaveText(["20"]);
  await expect(
    tokensInMark(insertions(added)).filter({ hasText: /^25$/ }),
  ).toHaveCount(1);
  expect(await placeOf(added)).toBe(place);
});

test("emphasized tokens and underlines stay readable in light and dark", async ({
  page,
  frontendServices,
}) => {
  await setColorScheme(page, "dark");
  const diff = await openLimitTsWordEmphasisDiff(page, frontendServices);
  const added = newLine(diff, 25);
  const removed = removedLine(diff, 25);
  await expect(codeToken(added, /^25$/)).toBeVisible();
  const reads = fileReads(page);

  const numberInInsertion = tokensInMark(insertions(added)).filter({
    hasText: /^25$/,
  });
  const numberInDeletion = tokensInMark(deletions(removed)).filter({
    hasText: /^20$/,
  });
  const insertion = insertions(added);
  const deletion = deletions(removed);

  const looks: Record<string, { token: string; underline: string }> = {};
  for (const scheme of ["dark", "light"] as const) {
    await test.step(`${scheme}: token ≥4.5:1 on tint; underline ≥3:1 vs line`, async () => {
      await setColorScheme(page, scheme);
      await expectReadableContrast(numberInInsertion);
      await expectReadableContrast(numberInDeletion);

      for (const [mark, line] of [
        [insertion, added],
        [deletion, removed],
      ] as const) {
        const underline = await mark.evaluate(
          (node) => getComputedStyle(node).textDecorationColor,
        );
        const lineBackground = await colorBehind(line, {
          includingItself: true,
        });
        expect(
          contrastRatio(underline, lineBackground),
          `underline contrast on ${scheme}`,
        ).toBeGreaterThanOrEqual(3);
      }

      looks[scheme] = {
        token: (await tokenAppearance(numberInInsertion)).color,
        underline: await insertion.evaluate(
          (node) => getComputedStyle(node).textDecorationColor,
        ),
      };
    });
  }

  expect(looks.light?.token).not.toBe(looks.dark?.token);
  expect(looks.light?.underline).not.toBe(looks.dark?.underline);
  expect(reads()).toEqual([]);
});
