// Project Intent discloses repository ancestors and configured roots independently.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { fileName } from "./intent-browser-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";
import { intentScopeTree, locationHeader } from "./intent-scope-tree-page.ts";

const featuresPath = "e2e_test/features";
const packagedPath = "e2e_test/packaged/features";
const recallPath = `${featuresPath}/recall/recall_note.feature`;
const packagedFile = `${packagedPath}/packaged.feature`;
const emptyNotice =
  "No gherkin files are published at empty_features for this revision.";

const files: Readonly<Record<string, string>> = {
  [recallPath]: "Feature: Recall a note\n  Scenario: Recall\n",
  [packagedFile]: "Feature: Packaged\n",
};

async function mountProjectTree() {
  const work = makeMe.aPublishedWork
    .of(makeMe.aPublishedSource.pygardon.please())
    .at("e7".repeat(20))
    .please();
  const locations = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(featuresPath)
        .ofKind("gherkin")
        .selecting(recallPath)
        .please(),
      makeMe.anIntentLocation
        .at(packagedPath)
        .ofKind("gherkin")
        .selecting(packagedFile)
        .please(),
      {
        ...makeMe.anIntentLocation
          .at("empty_features")
          .ofKind("gherkin")
          .selecting()
          .please(),
        problem: "no-matching-files",
      },
      {
        ...makeMe.anIntentLocation
          .at("frontend/src")
          .ofKind("unfamiliar-language")
          .selecting()
          .please(),
        problem: "unsupported-kind",
      },
    )
    .please();
  const intent = intentReadsPublishing(locations, files);
  await mountIntentCiPage({ work, reads: { intent, ci: unreadCiReads } });
  return intentScopeTree();
}

test("collapsed Project Intent hides deeper roots and carries the cue on each closed ancestor", async () => {
  const tree = await mountProjectTree();
  await tree.toggle("e2e_test").isExpanded(false);
  expect(
    locationHeader("e2e_test").getAttribute("data-intent-folder-cue"),
  ).toBe("ancestor");
  await expect
    .element(page.getByRole("button", { name: featuresPath, exact: true }))
    .not.toBeInTheDocument();

  await tree.name("e2e_test").click();
  await expect
    .element(page.getByRole("heading", { name: "e2e_test", exact: true }))
    .toBeVisible();
  await tree.toggle("e2e_test").click();
  expect(
    locationHeader("e2e_test").getAttribute("data-intent-folder-cue"),
  ).toBeNull();
  expect(
    locationHeader("packaged").getAttribute("data-intent-folder-cue"),
  ).toBe("ancestor");
  expect(
    locationHeader(featuresPath).getAttribute("data-intent-folder-cue"),
  ).toBe("root");
  await expect
    .element(page.getByRole("button", { name: featuresPath, exact: true }))
    .toHaveAccessibleDescription("1 file");
  expect(locationHeader(featuresPath).querySelector("code")?.textContent).toBe(
    "features",
  );
  await tree.toggle(featuresPath).click();
  expect(
    locationHeader(featuresPath).getAttribute("data-intent-folder-cue"),
  ).toBe("root");
});

test("Project Intent discloses roots independently and keeps Purpose when closing the selected file's root", async () => {
  const tree = await mountProjectTree();
  await tree.toggle("e2e_test").click();
  await tree.toggle(featuresPath).click();
  await tree.toggle("recall").click();
  const recall = await tree.openFile(recallPath);
  await tree.toggle("packaged").click();
  await tree.toggle(packagedPath).click();
  await tree.toggle(featuresPath).isExpanded(true);
  await expect.element(fileName(packagedFile)).toBeVisible();
  await recall.shows("Feature: Recall a note");
  await tree.toggle(featuresPath).click();
  await tree.hidesFile(recallPath);
  await tree.toggle(packagedPath).isExpanded(true);
  await recall.shows("Feature: Recall a note");
});

test("empty and unsupported roots remain selectable and explain their configuration in Summary", async () => {
  const tree = await mountProjectTree();
  await tree.name("empty_features").click();
  await tree.toggle("empty_features").isExpanded(false);
  await tree.summarizes("gherkin", "0 files", emptyNotice);
  await tree.toggle("frontend").click();
  await tree.name("frontend/src").click();
  await tree.toggle("frontend/src").isExpanded(false);
  await tree.summarizes(
    "unfamiliar-language",
    "0 files",
    "Kind unfamiliar-language is not yet supported.",
  );
  expect(
    locationHeader("frontend/src").getAttribute("data-intent-folder-cue"),
  ).toBe("root");
});
