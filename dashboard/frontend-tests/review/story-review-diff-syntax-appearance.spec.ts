// A diff's syntax styling reads at 4.5:1 on added, removed and unchanged
// lines in dark and light, follows a live appearance change without reading
// the file again, and matches Intent's source reading of the same code token
// for token in both appearances.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { expectReadableContrast } from "../../tests/accessibleReading.ts";
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
import {
  fileReads,
  storyReviewDiff,
  tokenAppearance,
} from "../../tests/support/reviewDiffSyntax.ts";

const path = "dashboard/tests/greet.spec.ts";
const schemes = ["dark", "light"] as const;

// Token roles, each by the text that finds it in a line.
const keyword = /^const$/;
const identifier = /^ ?(greeting|farewell)$/;
const quoted = /hello|later|bye/;
const comment = /old|new|and close here|greeting's notes/;

async function appearances(page: Page, tokens: Record<string, Locator>) {
  const read: Record<string, Record<string, unknown>> = {};
  for (const scheme of schemes) {
    await setColorScheme(page, scheme);
    const shown: Record<string, unknown> = {};
    for (const [name, token] of Object.entries(tokens))
      shown[name] = await tokenAppearance(token);
    read[scheme] = shown;
  }
  return read;
}

test("diff tokens read at 4.5:1 in both appearances and match Intent's source reading of the same code", async ({
  page,
  frontendServices,
}) => {
  Object.assign(frontendServices, {
    files: { ...frontendServices.files, [path]: greetText.tree },
    locations: {
      revision: frontendRevision,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(path)
          .please(),
      ],
      recovery: undefined,
    },
  });
  await setColorScheme(page, "dark");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [{ kind: "modified", path, lines: { added: 2, removed: 4 } }],
    }),
    (answers) => {
      answers.answerFile(greetDiff(path), path);
      answers.answerFileText(greetText, path);
    },
  );
  await fileRow(review, `Modified ${path}`).click();
  const diff = storyReviewDiff(fileDiff(review, `Modified ${path}`));
  const lines = {
    unchanged: diff.newLine(28),
    added: diff.newLine(29),
    removed: diff.removedLine(29),
  };
  await expect(lines.removed.token(comment)).toBeVisible();
  const reads = fileReads(page);

  for (const scheme of schemes) {
    await test.step(`${scheme}: keyword and comment tokens read at 4.5:1 on every line kind`, async () => {
      await setColorScheme(page, scheme);
      for (const line of Object.values(lines)) {
        await expectReadableContrast(line.token(keyword));
        await expectReadableContrast(line.token(quoted));
      }
      for (const line of [lines.added, lines.removed, diff.newLine(27)])
        await expectReadableContrast(line.token(comment));
    });
  }
  expect(reads()).toEqual([]);

  const diffTokens = {
    ...Object.fromEntries(
      Object.entries(lines).flatMap(([kind, line]) => [
        [`${kind} keyword`, line.token(keyword)],
        [`${kind} identifier`, line.token(identifier)],
        [`${kind} string`, line.token(quoted)],
      ]),
    ),
    "added comment": lines.added.token(comment),
    "removed comment": lines.removed.token(comment),
    "unchanged comment": diff.newLine(27).token(comment),
  };
  const inDiff = await appearances(page, diffTokens);

  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  // The review selected its story; Project Intent lists the project's source.
  await intent.getByRole("button", { name: "Project Intent" }).click();
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  await sourceFile(intent, path).click();
  const source = fileSource(intent, path);
  const sourceTokens = {
    keyword: sourceToken(source, keyword),
    identifier: sourceToken(source, identifier),
    string: sourceToken(source, quoted),
    comment: sourceToken(source, comment),
  };
  await expect(sourceTokens.comment).toBeVisible();
  const inSource = await appearances(page, sourceTokens);

  for (const scheme of schemes) {
    const expected = Object.fromEntries(
      Object.keys(diffTokens).map((name) => [
        name,
        inSource[scheme]?.[name.split(" ")[1] ?? ""],
      ]),
    );
    expect(inDiff[scheme], `${scheme} diff tokens equal Intent's`).toEqual(
      expected,
    );
  }
  expect(inSource.dark?.keyword).not.toEqual(inSource.light?.keyword);
  expect(inSource.dark?.keyword).not.toEqual(inSource.dark?.string);
  expect(inSource.dark?.comment).not.toEqual(inSource.dark?.identifier);
});
