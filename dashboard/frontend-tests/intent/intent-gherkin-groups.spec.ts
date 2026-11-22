// Intent location groups expand exclusively on the page's Intent body
// (./intent-ci-page-mount.ts, ../../src/IntentPerspective.tsx,
// ../../src/IntentLocationGroup.tsx): they start collapsed, one body opens at
// a time, all can close, Purpose survives collapsing its group, empty and
// unsupported bodies take part, nested folder toggles stay local, and with no
// story selected each header spans the column apart from its rows.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { fileName, scopeToggle } from "./intent-browser-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";
import { intentScopeTree } from "./intent-scope-tree-page.ts";

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

async function mountGroups() {
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

const bodyText = () =>
  page.getByRole("main", { name: "Intent", exact: true }).query()
    ?.textContent ?? "";

// How the header of the location at PATH reads against its column.
function headerLook(path: string) {
  const header = scopeToggle(path).element().parentElement as HTMLElement;
  const column = header.closest(".intent-locations") ?? header;
  const box = header.getBoundingClientRect();
  const columnLeft = column.getBoundingClientRect().left + column.clientLeft;
  const label = header.querySelector(".intent-location-name > *") ?? header;
  return {
    background: getComputedStyle(header).backgroundColor,
    mark: getComputedStyle(header).boxShadow,
    controlsShowHeader: [...header.children].every(
      (child) => getComputedStyle(child).backgroundColor === "rgba(0, 0, 0, 0)",
    ),
    fullWidth:
      Math.abs(box.left - columnLeft) < 1 &&
      Math.abs(box.width - column.clientWidth) < 1,
    labelWeight: Number(getComputedStyle(label).fontWeight),
  };
}

test("location groups start collapsed and expand exclusively, keeping Purpose across collapse and nested folders local", async () => {
  const tree = await mountGroups();
  const features = tree.toggle(featuresPath);
  const packaged = tree.toggle(packagedPath);
  const empty = tree.toggle("empty_features");
  for (const path of [featuresPath, packagedPath, "empty_features"])
    await tree.toggle(path).isExpanded(false);
  await tree.toggle("frontend/src").isExpanded(false);

  await features.click();
  await tree.toggle("recall").click();
  const recall = await tree.openFile(recallPath);
  await packaged.click();
  await features.isExpanded(false);
  await packaged.isExpanded(true);
  await tree.hidesFile(recallPath);
  await packaged.click();
  await packaged.isExpanded(false);

  // Purpose keeps the selected file while its group collapses.
  await features.click();
  await recall.shows("Feature: Recall a note");
  await features.click();
  await features.isExpanded(false);
  await recall.shows("Feature: Recall a note");
  await features.click();
  await expect
    .element(fileName(recallPath))
    .toHaveAttribute("aria-pressed", "true");

  // Empty and unsupported bodies take part in exclusive expansion.
  await empty.click();
  await features.isExpanded(false);
  await expect.poll(bodyText).toContain(emptyNotice);
  await tree.toggle("frontend/src").click();
  await empty.isExpanded(false);
  await expect.poll(bodyText).not.toContain(emptyNotice);
  await expect
    .poll(bodyText)
    .toContain("Kind unfamiliar-language is not yet supported.");

  // A nested folder toggle leaves its group open.
  await features.click();
  const folder = tree.toggle("recall");
  await folder.isExpanded(true);
  await folder.click();
  await folder.isExpanded(false);
  await features.isExpanded(true);
  await tree.hidesFile(recallPath);
  await folder.click();
  await folder.isExpanded(true);
});

test("with no story selected, full-width bold location headers stand apart from their rows; selection fills one header and expansion shows only in its toggle", async () => {
  const tree = await mountGroups();
  await tree.toggle(featuresPath).click();
  await tree.toggle("recall").click();
  await tree.name(packagedPath).click();
  await tree.name(packagedPath).isSelected(true);
  await tree.toggle(featuresPath).isExpanded(true);
  await tree.toggle(packagedPath).isExpanded(false);

  const transparent = "rgba(0, 0, 0, 0)";
  const fileRow = fileName(recallPath).element();
  const folderRow = document.querySelector(".story-review-folder-row");
  expect(folderRow).not.toBeNull();
  const rowBackgrounds = [folderRow as Element, fileRow].map(
    (row) => getComputedStyle(row).backgroundColor,
  );
  expect(rowBackgrounds).toEqual([transparent, transparent]);

  const expanded = headerLook(featuresPath);
  const selected = headerLook(packagedPath);
  expect(expanded.background).not.toBe(transparent);
  for (const path of ["empty_features", "frontend/src"])
    expect(headerLook(path).background).toBe(expanded.background);
  expect(selected.background).not.toBe(expanded.background);
  expect(selected.background).not.toBe(transparent);
  for (const path of [
    featuresPath,
    packagedPath,
    "empty_features",
    "frontend/src",
  ]) {
    const look = headerLook(path);
    expect(look).toMatchObject({
      mark: "none",
      controlsShowHeader: true,
      fullWidth: true,
    });
    expect(look.labelWeight).toBeGreaterThanOrEqual(600);
  }
});
