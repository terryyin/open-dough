// Live and published Done reviews supply their pinned Intent settings to a
// diff's path-silent files. The mounted reader covers choosing the grammar.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  frontendFileDiff,
  frontendPublishedReview,
  frontendReviewIds,
  frontendReviewSnapshot,
} from "../../test-support/support/frontendStoryReview.ts";
import {
  openFrontendDoneStoryReview,
  openFrontendStoryReview,
  selectedFrontendStoryDiff,
} from "../../test-support/support/frontendStoryReviewOpen.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { expandIntentGroup } from "../../test-support/intentPerspectivePage.ts";
import { codePane } from "../../test-support/support/reviewPanes.ts";
import { intentFile } from "../../test-support/support/intentStoryPage.ts";
import { storyReviewDiff } from "../../test-support/support/reviewDiffSyntax.ts";
import { recordIntentLocations } from "../../test-support/support/intentDoneProjectRefresh.ts";
import type { Locator } from "@playwright/test";

const shellCode = "if true; then echo x; fi";
const typescriptCode = "const shown: number = 1;";
const lines = { added: 1, removed: 0 };
const hintedPath = "scripts/setup.test";
const renamedPath = "scripts/setup-renamed.test";
const plainOutsidePath = "notes.txt";

async function shownFile(review: Locator, name: string) {
  await intentFile(review, name).click();
  const diff = storyReviewDiff(await selectedFrontendStoryDiff(review, name));
  await expect(codePane(diff.locator)).toHaveAttribute("aria-busy", "false");
  const line = diff.newLine(1);
  await expect(line.line).toBeVisible();
  return line;
}

test("a live review supplies a diff's hint from Intent settings at the snapshot tree", async ({
  page,
  frontendServices,
}) => {
  const tree = frontendReviewIds.tree;
  const intentReads = recordIntentLocations(page);
  const files = [hintedPath, renamedPath];
  const location = makeMe.anIntentLocation
    .at("scripts")
    .withSources({ include: ["**/*.test"], syntax: "shell" })
    .selecting(...files)
    .please();
  Object.assign(frontendServices, {
    revision: frontendReviewIds.head,
    locations: {
      revision: frontendReviewIds.head,
      locations: [
        makeMe.anIntentLocation
          .at("scripts")
          .withSources({ include: ["**/*.test"] })
          .selecting(...files)
          .please(),
      ],
    },
  });
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations" &&
      url.searchParams.get("revision") === tree,
    (route) =>
      route.fulfill({ json: { revision: tree, locations: [location] } }),
  );
  const cases = [
    { path: hintedPath, code: shellCode },
    { path: plainOutsidePath, code: typescriptCode },
    { path: renamedPath, code: shellCode, oldPath: "legacy/run" },
  ] as const;

  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: cases.map(({ path, ...rest }) =>
        makeMe.aReviewedFile
          .with(
            "oldPath" in rest
              ? { kind: "renamed", path, oldPath: rest.oldPath, lines }
              : { kind: "modified", path, lines },
          )
          .please(),
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

  await expandIntentGroup(review, "scripts");
  const shellLine = await shownFile(review, `Modified ${hintedPath}`);
  await expect(shellLine.token(/^if$/)).toHaveText("if");
  await expect(shellLine.line).toHaveText(`+${shellCode}`);
  expect(intentReads.locations).toContain(tree);

  const outside = await shownFile(review, `Modified ${plainOutsidePath}`);
  await expect(outside.line).toHaveText(`+${typescriptCode}`);
  await expect(outside.codeTokens()).toHaveCount(0);

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
  await expandIntentGroup(review, "scripts");
  const line = await shownFile(review, `Modified ${hintedPath}`);
  await expect(line.token(/^if$/)).toHaveText("if");
});
