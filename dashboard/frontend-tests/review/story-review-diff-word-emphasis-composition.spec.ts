// Story-review word emphasis on syntax-styled lines: changed words keep token
// colours inside insertions and deletions, and stay readable in light and dark.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  colorBehind,
  contrastRatio,
  expectReadableContrast,
} from "../../test-support/accessibleReading.ts";
import { setColorScheme } from "../../test-support/systemAppearanceReading.ts";
import { openLimitTsWordEmphasisDiff } from "../../test-support/support/diffWordEmphasisOpen.ts";
import {
  fileReads,
  tokenAppearance,
} from "../../test-support/support/reviewDiffSyntax.ts";

test("styled changed words keep token colours inside insertions and deletions", async ({
  page,
  frontendServices,
}) => {
  const diff = await openLimitTsWordEmphasisDiff(page, frontendServices);
  const removed = diff.removedLine(25);
  const added = diff.newLine(25);

  await expect(added.token(/^const$/)).toBeVisible();
  await expect(removed.deletions()).toHaveText(["20"]);
  await expect(added.insertions()).toHaveText(["25"]);
  await expect(added.tokenInInsertion(/^25$/)).toHaveCount(1);
  await expect(removed.tokenInDeletion(/^20$/)).toHaveCount(1);

  const numberLook = await tokenAppearance(added.token(/^25$/));
  const keywordLook = await tokenAppearance(added.token(/^const$/));
  expect(numberLook.color).not.toBe(keywordLook.color);

  await expect(added.line).toHaveClass(/story-review-added/);
  await expect(removed.line).toHaveClass(/story-review-removed/);
  await expect(added.line).toHaveText(/^\+const limit = 25;/);
  await expect(removed.line).toHaveText(/^-const limit = 20;/);
});

test("emphasized tokens and underlines stay readable in light and dark", async ({
  page,
  frontendServices,
}) => {
  await setColorScheme(page, "dark");
  const diff = await openLimitTsWordEmphasisDiff(page, frontendServices);
  const added = diff.newLine(25);
  const removed = diff.removedLine(25);
  await expect(added.token(/^25$/)).toBeVisible();
  const reads = fileReads(page);

  const numberInInsertion = added.tokenInInsertion(/^25$/);
  const numberInDeletion = removed.tokenInDeletion(/^20$/);
  const insertion = added.insertions();
  const deletion = removed.deletions();

  const looks: Record<string, { token: string; underline: string }> = {};
  for (const scheme of ["dark", "light"] as const) {
    await test.step(`${scheme}: token ≥4.5:1 on tint; underline ≥3:1 vs line`, async () => {
      await setColorScheme(page, scheme);
      await expectReadableContrast(numberInInsertion);
      await expectReadableContrast(numberInDeletion);

      for (const [mark, line] of [
        [insertion, added.line],
        [deletion, removed.line],
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
