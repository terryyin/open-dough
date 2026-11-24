// A reviewed file whose path names no grammar takes its Intent `syntax` hint
// from the settings the comparison pins (../../src/reviewDiffSyntaxHint.ts):
// a live snapshot's tree and a published Done review's completion, never the
// project's later tip. The hint styles the diff; a path outside every Intent
// location stays plain.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds } from "../../../Distribution/tests/support/storyReviewSnapshotTestData.mjs";
import { syntaxHintOfRepositoryPath } from "../../src/intentSelectionCoverage.ts";
import { reviewIntentSettingsRevision } from "../../src/reviewDiffSyntaxHint.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { reviewDiffPage } from "./reviewDiffPage.ts";
import { printedDiff } from "./styledDiffCases.ts";
import { styledDiffReading } from "./styledDiffReading.ts";

const shellCode = "if true; then echo x; fi";
const hintedPath = "scripts/setup.test";
const shellLocation = makeMe.anIntentLocation
  .at("scripts")
  .withSources({ include: ["**/*.test"], syntax: "shell" })
  .selecting(hintedPath, "scripts/setup-renamed.test")
  .please();

test("a live review reads Intent settings at its snapshot tree, and a published Done review at its completion", () => {
  const tree = "1111111111111111111111111111111111111111";
  const completion = "2222222222222222222222222222222222222222";
  expect(reviewIntentSettingsRevision(makeMe.aStoryReview.please(), tree)).toBe(
    tree,
  );
  expect(
    reviewIntentSettingsRevision(
      makeMe.aStoryReview.published(completion).please(),
      storyReviewIds.tree,
    ),
  ).toBe(completion);
});

test("a hinted path and a renamed file's new path take the location's syntax, and a path outside it none", () => {
  expect(syntaxHintOfRepositoryPath(hintedPath, [shellLocation])).toBe("shell");
  expect(
    syntaxHintOfRepositoryPath("scripts/setup-renamed.test", [shellLocation]),
  ).toBe("shell");
  expect(syntaxHintOfRepositoryPath("notes.txt", [shellLocation])).toBe(
    undefined,
  );
});

test("a diff styles by its syntax hint and stays plain without one", async () => {
  const text = {
    kind: "text",
    baseline: null,
    tree: `${shellCode}\n`,
  } as const;
  const reading = (syntaxHint?: string) =>
    styledDiffReading({
      key: syntaxHint ?? "plain",
      path: hintedPath,
      printed: printedDiff(hintedPath, ["@@ -0,0 +1 @@", `+${shellCode}`]),
      text,
      ...(syntaxHint === undefined ? {} : { syntaxHint }),
    });
  const { rerender } = await mountComponent(reading("shell"));
  const diff = reviewDiffPage();
  await expect.element(diff.newLine(1).token(/^if$/)).toBeVisible();

  rerender(reading());
  await expect.element(diff.newLine(1).line).toHaveTextContent(`+${shellCode}`);
  await expect.element(diff.firstToken()).not.toBeInTheDocument();
});
