// When a story-review diff's path names no grammar, Intent locations at the
// review's pinned settings revision may supply a known `syntax` hint; path
// grammar still wins, renames follow the new path, and outside Intent or
// unfamiliar hints stay plain.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  frontendFileDiff,
  frontendPublishedReview,
  frontendReviewIds,
  frontendReviewSnapshot,
} from "../../tests/support/frontendStoryReview.ts";
import {
  openFrontendDoneStoryReview,
  openFrontendStoryReview,
} from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import { codePane } from "../../tests/support/reviewPanes.ts";
import { storyReviewDiff } from "../../tests/support/reviewDiffSyntax.ts";
import type { Locator } from "@playwright/test";

const shellCode = "if true; then echo x; fi";
const typescriptCode = "const shown: number = 1;";
const lines = { added: 1, removed: 0 };
const hintedPath = "scripts/setup.test";
const renamedPath = "scripts/setup-renamed.test";
const pathWinsPath = "lib/app.ts";
const plainOutsidePath = "notes.txt";
const plainUnfamiliarPath = "scripts/odd.check";

async function shownFile(review: Locator, name: string) {
  await fileRow(review, name).click();
  const diff = storyReviewDiff(fileDiff(review, name));
  await expect(codePane(diff.locator)).toHaveAttribute("aria-busy", "false");
  const line = diff.newLine(1);
  await expect(line.line).toBeVisible();
  return line;
}

test("Intent syntax hints style path-silent diffs; path grammar, outside Intent and unfamiliar hints stay as today", async ({
  page,
  frontendServices,
}) => {
  const tree = frontendReviewIds.tree;
  Object.assign(frontendServices, {
    locations: {
      revision: tree,
      locations: [
        makeMe.anIntentLocation
          .at("scripts")
          .withSources(
            { include: ["**/*.test"], syntax: "shell" },
            {
              include: ["**/*.check"],
              syntax: "unfamiliar-language",
            },
          )
          .selecting(hintedPath, renamedPath, plainUnfamiliarPath)
          .please(),
        makeMe.anIntentLocation
          .at("lib")
          .withSources({ include: ["**/*.ts"], syntax: "shell" })
          .selecting(pathWinsPath)
          .please(),
      ],
      recovery: undefined,
    },
  });

  const cases = [
    { path: hintedPath, code: shellCode },
    { path: pathWinsPath, code: typescriptCode },
    { path: plainOutsidePath, code: typescriptCode },
    { path: plainUnfamiliarPath, code: shellCode },
    { path: renamedPath, code: shellCode, oldPath: "legacy/run" },
  ] as const;

  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: cases.map(({ path, ...rest }) =>
        "oldPath" in rest
          ? {
              kind: "renamed" as const,
              path,
              oldPath: rest.oldPath,
              lines,
            }
          : { kind: "modified" as const, path, lines },
      ),
    }),
    (answers) => {
      for (const { path, code } of cases) {
        answers.answerFile(frontendFileDiff(path, [code]), path);
        answers.answerFileText(
          { kind: "text", baseline: null, tree: `${code}\n` },
          path,
        );
      }
    },
  );

  const shellLine = await shownFile(review, `Modified ${hintedPath}`);
  await expect(shellLine.token(/^if$/)).toHaveText("if");
  await expect(shellLine.line).toHaveText(`+${shellCode}`);

  const tsLine = await shownFile(review, `Modified ${pathWinsPath}`);
  await expect(tsLine.token(/^const$/)).toHaveText("const");

  for (const { name, code } of [
    { name: `Modified ${plainOutsidePath}`, code: typescriptCode },
    { name: `Modified ${plainUnfamiliarPath}`, code: shellCode },
  ]) {
    const line = await shownFile(review, name);
    await expect(line.line).toHaveText(`+${code}`);
    await expect(line.codeTokens(), name).toHaveCount(0);
  }

  const renamedLine = await shownFile(
    review,
    `Renamed legacy/run → ${renamedPath}`,
  );
  await expect(renamedLine.token(/^if$/)).toHaveText("if");
});

test("a published Done review styles by completion Intent settings, not a later tip change", async ({
  page,
  frontendServices,
}) => {
  const published = frontendPublishedReview([
    { kind: "modified", path: hintedPath, lines },
  ]);
  Object.assign(frontendServices, {
    revision: frontendReviewIds.head,
    locations: {
      revision: published.completion,
      locations: [
        makeMe.anIntentLocation
          .at("scripts")
          .withSources({ include: ["**/*.test"], syntax: "shell" })
          .selecting(hintedPath)
          .please(),
      ],
      recovery: undefined,
    },
  });
  const { review } = await openFrontendDoneStoryReview(
    page,
    frontendServices,
    published,
    (answers) => {
      answers.answerFile(frontendFileDiff(hintedPath, [shellCode]), hintedPath);
      answers.answerFileText(
        { kind: "text", baseline: null, tree: `${shellCode}\n` },
        hintedPath,
      );
    },
  );
  const line = await shownFile(review, `Modified ${hintedPath}`);
  await expect(line.token(/^if$/)).toHaveText("if");
});
