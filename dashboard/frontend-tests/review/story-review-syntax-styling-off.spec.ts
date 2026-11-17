// Intent source reading and a story-review file diff follow the shared
// System settings Off/Default syntax-styling choice together: Default keeps
// today's tokens and appearance restyle; Off makes both plain without a
// navigation; Default restores; a .txt path stays plain under both.
// Persistence of Off across reload is
// ../../../e2e/configuration/system-settings-syntax-styling.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { setColorScheme } from "../../tests/systemAppearanceReading.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { sourceToken } from "../../tests/pageColours.ts";
import { fileSource, sourceFile } from "../../tests/intentCodeBrowsePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "../../tests/intentPerspectivePage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { frontendRevision } from "../../tests/support/frontendServiceState.ts";
import { frontendReviewSnapshot } from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import {
  greetDiff,
  greetText,
} from "../../tests/support/diffSyntaxFixtures.ts";
import { reviewedFileDiffSchema } from "../../src/storyReviewContract.ts";
import {
  codeToken,
  codeTokens,
  fileReads,
  newLine,
  tokenAppearance,
} from "../../tests/support/reviewDiffSyntax.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../tests/support/frontendSettingsSubstitutes.ts";
import {
  chooseSyntaxStyling,
  expectSyntaxStylingShown,
} from "../../tests/support/syntaxStylingSettingsPage.ts";
import { back, settings } from "../../tests/support/systemSettingsPage.ts";

const styledPath = "dashboard/tests/greet.spec.ts";
const plainPath = "notes/readme.txt";
const keyword = /^const$/;

const plainDiff = reviewedFileDiffSchema.parse({
  kind: "diff",
  printed: [
    `diff --git a/${plainPath} b/${plainPath}`,
    `--- a/${plainPath}`,
    `+++ b/${plainPath}`,
    "@@ -1 +1,2 @@",
    " plain notes",
    "+added line",
    "",
  ].join("\n"),
});

async function openStyledReaders(
  page: Page,
  frontendServices: Parameters<typeof openFrontendStoryReview>[1],
  options: { readonly syntaxStyling?: "off" | "default" } = {},
) {
  Object.assign(frontendServices, {
    files: {
      ...frontendServices.files,
      [styledPath]: greetText.tree,
      [plainPath]: "plain notes\n",
    },
    locations: {
      revision: frontendRevision,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(styledPath)
          .please(),
        makeMe.anIntentLocation
          .at("notes")
          .withSources({ include: ["**/*.txt"] })
          .selecting(plainPath)
          .please(),
      ],
      recovery: undefined,
    },
  });
  await installFrontendSettingsSubstitutes(page, frontendServices, {
    projects: productionSeedProjects,
    ...(options.syntaxStyling === undefined
      ? {}
      : { syntaxStyling: options.syntaxStyling }),
  });
  await setColorScheme(page, "dark");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [
        { kind: "modified", path: styledPath, lines: { added: 2, removed: 4 } },
        { kind: "modified", path: plainPath, lines: { added: 1, removed: 0 } },
      ],
    }),
    (answers) => {
      answers.answerFile(greetDiff(styledPath), styledPath);
      answers.answerFileText(greetText, styledPath);
      answers.answerFile(plainDiff, plainPath);
      answers.answerFileText(
        {
          kind: "text",
          baseline: "plain notes\n",
          tree: "plain notes\nadded line\n",
        },
        plainPath,
      );
    },
  );
  await fileRow(review, `Modified ${styledPath}`).click();
  const diff = fileDiff(review, `Modified ${styledPath}`);

  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  await intent.getByRole("button", { name: "Project Intent" }).click();
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  await sourceFile(intent, styledPath).click();
  const source = fileSource(intent, styledPath);
  return { review, diff, intent, source };
}

// Review stays mounted under Intent (`ConfiguredDashboard` hides the board),
// so diff token presence is counted rather than required visible.
async function expectStyled(source: Locator, diff: Locator) {
  await expect(sourceToken(source, keyword)).toBeVisible();
  await expect(codeToken(newLine(diff, 28), keyword)).toHaveCount(1);
}

async function expectPlain(source: Locator, diff: Locator) {
  await expect(source.locator(".source-line-text span")).toHaveCount(0);
  await expect(codeTokens(diff)).toHaveCount(0);
}

test("with Off already saved, newly opened Intent and review stay plain", async ({
  page,
  frontendServices,
}) => {
  const { diff, source } = await openStyledReaders(page, frontendServices, {
    syntaxStyling: "off",
  });
  await expectPlain(source, diff);
  await expect(newLine(diff, 28)).toContainText('const greeting = "hello";');
});

test("Default keeps Intent and review tokens; Off makes both plain without navigation; Default restores; appearance under Default restyles; .txt stays plain", async ({
  page,
  frontendServices,
}) => {
  const { review, diff, intent, source } = await openStyledReaders(
    page,
    frontendServices,
  );
  await expectStyled(source, diff);
  const reads = fileReads(page);

  await test.step("Off restyles open Intent and open diff plain together", async () => {
    await settings(page).click();
    await expectSyntaxStylingShown(page, "Default");
    await chooseSyntaxStyling(page, "Off");
    await back(page).click();
    await expectPlain(source, diff);
    await expect(newLine(diff, 28)).toContainText('const greeting = "hello";');
  });

  await test.step("Default restores tokens on both without navigation", async () => {
    await settings(page).click();
    await chooseSyntaxStyling(page, "Default");
    await back(page).click();
    await expectStyled(source, diff);
  });

  await test.step("under Default, light↔dark restyles tokens without re-reading the file", async () => {
    const darkKeyword = await tokenAppearance(sourceToken(source, keyword));
    await setColorScheme(page, "light");
    const lightKeyword = await tokenAppearance(sourceToken(source, keyword));
    expect(lightKeyword.color).not.toEqual(darkKeyword.color);
    expect(
      await tokenAppearance(codeToken(newLine(diff, 28), keyword)),
    ).toEqual(lightKeyword);
    expect(reads()).toEqual([]);
    await setColorScheme(page, "dark");
  });

  await test.step(".txt stays plain under Default and Off", async () => {
    await parts(page).development.click();
    await fileRow(review, `Modified ${plainPath}`).click();
    const plain = fileDiff(review, `Modified ${plainPath}`);
    await expect(codeTokens(plain)).toHaveCount(0);
    await settings(page).click();
    await chooseSyntaxStyling(page, "Off");
    await back(page).click();
    await expect(codeTokens(plain)).toHaveCount(0);
    await parts(page).intentChoice.click();
    await expandIntentGroup(intent, "notes");
    await sourceFile(intent, plainPath).click();
    await expect(
      fileSource(intent, plainPath).locator(".source-line-text span"),
    ).toHaveCount(0);
  });
});
