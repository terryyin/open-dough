import type { Locator } from "@playwright/test";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  intentDiff,
  intentFile,
  intentStory,
  repositoryFolder,
  repositoryTree,
  changesOnly,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { intentReviewFiles } from "../../dashboard/test-support/reviewChangesPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { selectTakenStoryInIntent } from "../../dashboard/test-support/support/selectTakenStoryInIntent.ts";
import {
  kindStyles,
  nameStyle,
} from "../../dashboard/test-support/support/changeKindStyle.ts";
import { changed } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import {
  expandIntentGroup,
  intentFolderName,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  childName,
  expectChildNames,
  summaryRegion,
} from "../../dashboard/test-support/intentScopeProofPage.ts";

type KindStyles = Awaited<ReturnType<typeof kindStyles>>;

const movedKinds = (style: KindStyles) =>
  [
    [changed.deleted, style.deleted],
    [changed.into, style.renamed],
    [changed.outOf, style.renamed],
    [changed.between, style.renamed],
  ] as const;

const destinations = [
  [changed.outOf, "scripts"],
  [changed.into, "dashboard/tests/arriving"],
  [changed.deleted, "dashboard/tests"],
  [changed.between, "tests"],
] as const;

const treeOrder = [
  "Modified dashboard/src/App.tsx",
  changed.into,
  changed.added,
  changed.modified,
  changed.deleted,
  "Renamed docs/notes.md → docs/renamed-notes.md",
  changed.outOf,
  changed.between,
] as const;

async function expectOneRowOfKind(intent: Locator, name: string, kind: object) {
  const file = intentFile(intent, name);
  await expect(file).toHaveCount(1);
  await expect(file).toBeVisible();
  expect(await nameStyle(file), name).toEqual(kind);
}

// Each deletion and rename shows once, styled by its kind, in its folder.
async function expectMovesAtDestinations(intent: Locator, style: KindStyles) {
  await expandIntentGroup(intent, "tests");
  for (const [name, kind] of movedKinds(style))
    await expectOneRowOfKind(intent, name, kind);
  for (const [name, folder] of destinations)
    await intentReviewFiles(intent).expectFileInFolder(name, folder);
}

// Reads each deletion's and rename's diff, leaving both locations expanded.
async function readMoveDiffs(intent: Locator) {
  const diffs = new Map<string, string>();
  for (const [name] of destinations) {
    await expandIntentGroup(
      intent,
      name === changed.between ? "tests" : "dashboard/tests",
    );
    diffs.set(name, await intentDiff(intent, name));
  }
  await expandIntentGroup(intent, "dashboard/tests");
  return diffs;
}

test("every rename has one destination row and every deletion keeps its removed path", async ({
  page,
  origin,
}) => {
  const { intent, style } =
    await test.step("Given a Taken story with deletions and renames is selected in Intent", async () => {
      const { intent } = await selectTakenStoryInIntent(page, origin);
      return { intent, style: await kindStyles(intent) };
    });
  const summary =
    await test.step("When I open the boundary folder's Summary", async () => {
      await intentFolderName(intent, "dashboard/tests/boundary").click();
      return summaryRegion(intent);
    });
  await test.step("Then with Changes only on, it lists only the story's added file", async () => {
    await expect(changesOnly(intent)).toBeChecked();
    await expect(summary.locator(".intent-summary-files")).toHaveText("1 file");
    await expectChildNames(summary, ["b.spec.ts"]);
  });

  await test.step("When I turn Changes only off", () =>
    changesOnly(intent).uncheck());
  await test.step("Then the Summary also lists the unchanged file", async () => {
    await expect(summary.locator(".intent-summary-files")).toHaveText(
      "2 files",
    );
    await expectChildNames(summary, ["b.spec.ts", "kept.spec.ts"]);
  });
  await test.step("And each deletion and rename shows once at its destination with its kind", async () => {
    await expectMovesAtDestinations(intent, style);
  });
  await test.step("And the between rename's old folder is gone while the unchanged tests/check.sh shows", async () => {
    await expect(
      repositoryFolder(intent, "dashboard/tests/between"),
    ).toHaveCount(0);
    await expect(intentFile(intent, "tests/check.sh")).toHaveCount(1);
  });
  await test.step("And the rename neither path admits is listed once", () =>
    expect(repositoryTree(intent).getByText(/notes\.md/)).toHaveCount(1));
  const offDiffs =
    await test.step("When I read each deletion and rename's diff", () =>
      readMoveDiffs(intent));
  await test.step("Then the deletion and the between rename show their change", () => {
    expect(offDiffs.get(changed.deleted)).toContain("gone 0");
    expect(offDiffs.get(changed.between)).toContain("renamed");
  });

  await test.step("When I turn Changes only on", async () => {
    await changesOnly(intent).check();
    await expect(changesOnly(intent)).toBeChecked();
  });
  await test.step("Then each deletion and rename still shows once at its destination with its kind", async () => {
    await expectMovesAtDestinations(intent, style);
  });
  await test.step("And the between rename's old folder and the unchanged tests/check.sh are left out", async () => {
    await expect(
      repositoryFolder(intent, "dashboard/tests/between"),
    ).toHaveCount(0);
    await expect(intentFile(intent, "tests/check.sh")).toHaveCount(0);
  });
  await test.step("And the rename neither path admits is still listed once", () =>
    expect(repositoryTree(intent).getByText(/notes\.md/)).toHaveCount(1));
  await test.step("And each deletion and rename opens the same diff as with Changes only off", async () => {
    expect(await readMoveDiffs(intent)).toEqual(offDiffs);
  });
});

test("folder proof opens a former path at its destination and Board re-entry keeps it selected", async ({
  page,
  origin,
}) => {
  const { card, intent, development, files, story } =
    await test.step("Given a Taken story with a rename out of its location is selected", async () => {
      const { card, intent } = await selectTakenStoryInIntent(page, origin);
      const { development } = parts(page);
      return {
        card,
        intent,
        development,
        files: intentReviewFiles(intent),
        story: intentStory(intent),
      };
    });
  await test.step("When I open Review changes from the story card", async () => {
    await development.click();
    await reviewChanges(card).press("Enter");
  });
  await test.step("Then the first changed file is selected", () =>
    files.expectSelected("Modified dashboard/src/App.tsx"));
  const summary =
    await test.step("When I open the Summary of the folder the rename left", async () => {
      await story.expandFolderPath("dashboard/tests/out");
      await intentFolderName(intent, "dashboard/tests/out").click();
      return summaryRegion(intent);
    });
  await test.step("Then it lists the renamed file at its former path", () =>
    expectChildNames(summary, ["leaving.spec.ts"]));
  await test.step("When I follow that file from the Summary", () =>
    childName(summary, "leaving.spec.ts").click());
  await test.step("Then its destination row in scripts is selected with its diff", async () => {
    await files.expectFileInFolder(changed.outOf, "scripts");
    await files.expectSelected(changed.outOf);
    await expect(story.diffReading.name).toHaveText(changed.outOf);
  });
  await test.step("When I return to the Board and reopen Review changes from the card", async () => {
    await development.click();
    await reviewChanges(card).press("Enter");
  });
  await test.step("Then the destination row stays selected", () =>
    files.expectSelected(changed.outOf));
});

for (const only of [false, true]) {
  const state = only ? "on" : "off";
  test(`Previous and Next follow the repository tree with Changes only ${state}`, async ({
    page,
    origin,
  }) => {
    const files =
      await test.step(`Given a Taken story with changes across the repository is selected with Changes only ${state}`, async () => {
        const { intent } = await selectTakenStoryInIntent(page, origin);
        await changesOnly(intent).setChecked(only);
        return intentReviewFiles(intent);
      });
    await test.step("When I choose the first changed file", () =>
      files.choose(treeOrder[0]));
    await test.step("Then Previous file is at its end", () =>
      files.expectMoveAtEnd("Previous file"));
    await test.step("When I move Next file to the end, each changed file is selected in tree order", async () => {
      for (const name of treeOrder.slice(1))
        await (await files.move("Next file", "keyboard")).expectSelected(name);
    });
    await test.step("Then Next file keeps focus at its end", async () => {
      await expect(files.moveControl("Next file")).toBeFocused();
      await files.expectMoveAtEnd("Next file");
    });
    await test.step("When I move Previous file", () =>
      files.move("Previous file", "keyboard"));
    await test.step("Then the file before the last is selected and Previous file keeps focus", async () => {
      await files.expectSelected(changed.outOf);
      await expect(files.moveControl("Previous file")).toBeFocused();
    });
  });
}
