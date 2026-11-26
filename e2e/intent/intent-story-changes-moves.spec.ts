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
  storyOnly,
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

test("every rename has one destination row and every deletion keeps its removed path", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, origin);
  const style = await kindStyles(intent);
  const files = intentReviewFiles(intent);
  const inIntent = new Map<string, string>();

  await test.step("a folder's Summary lists the files its tree shows, the story's added one included", async () => {
    await intentFolderName(intent, "dashboard/tests/boundary").click();
    const summary = summaryRegion(intent);
    await expect(summary.locator(".intent-summary-path")).toHaveText(
      "dashboard/tests/boundary",
    );
    await expect(summary.locator(".intent-summary-files")).toHaveText(
      "2 files",
    );
    await expectChildNames(summary, ["b.spec.ts", "kept.spec.ts"]);
  });

  for (const only of [false, true]) {
    const state = only ? "on" : "off";
    if (only) await storyOnly(intent).check();
    await expect(storyOnly(intent)).toBeChecked({ checked: only });

    await test.step(`Selected story only ${state}: the deletion and the renames show with their kind, each once`, async () => {
      for (const [name, expected] of [
        [changed.deleted, style.deleted],
        [changed.into, style.renamed],
        [changed.outOf, style.renamed],
      ] as const) {
        const file = intentFile(intent, name);
        await expect(file).toHaveCount(1);
        await expect(file).toBeVisible();
        expect(await nameStyle(file)).toEqual(expected);
      }
      await files.expectFileInFolder(changed.outOf, "scripts");
      await files.expectFileInFolder(changed.into, "dashboard/tests/arriving");
      await files.expectFileInFolder(changed.deleted, "dashboard/tests");
      await expect(
        repositoryFolder(intent, "dashboard/tests/between"),
      ).toHaveCount(0);
      await expandIntentGroup(intent, "tests");
      await files.expectFileInFolder(changed.between, "tests");
      const between = intentFile(intent, changed.between);
      await expect(between).toHaveCount(1);
      expect(await nameStyle(between)).toEqual(style.renamed);
      await expect(intentFile(intent, "tests/check.sh")).toHaveCount(
        only ? 0 : 1,
      );
    });

    await test.step(`Selected story only ${state}: a rename neither path admits is listed once outside`, async () => {
      await expect(repositoryTree(intent).getByText(/notes\.md/)).toHaveCount(
        1,
      );
    });

    await test.step(`Selected story only ${state}: each deletion and rename opens its diff, the same in both states`, async () => {
      const diffs = new Map<string, string>();
      await expandIntentGroup(intent, "dashboard/tests");
      for (const name of [changed.deleted, changed.into, changed.outOf])
        diffs.set(name, await intentDiff(intent, name));
      await expandIntentGroup(intent, "tests");
      diffs.set(changed.between, await intentDiff(intent, changed.between));
      for (const [name, diff] of diffs) {
        if (only) expect(diff, name).toBe(inIntent.get(name));
        inIntent.set(name, diff);
      }
      await expandIntentGroup(intent, "dashboard/tests");
    });
  }

  await test.step("each deletion and rename's diff shows its change", () => {
    expect(inIntent.get(changed.deleted)).toContain("gone 0");
    expect(inIntent.get(changed.between)).toContain("renamed");
  });
});

test("folder proof opens a former path at its destination and Board re-entry keeps it selected", async ({
  page,
  origin,
}) => {
  const { card, intent } = await selectTakenStoryInIntent(page, origin);
  const { development } = parts(page);
  await development.click();
  await reviewChanges(card).press("Enter");
  const files = intentReviewFiles(intent);
  await files.expectSelected("Modified dashboard/src/App.tsx");

  const story = intentStory(intent);
  await story.expandFolderPath("dashboard/tests/out");
  await intentFolderName(intent, "dashboard/tests/out").click();
  const summary = summaryRegion(intent);
  await expectChildNames(summary, ["leaving.spec.ts"]);
  await childName(summary, "leaving.spec.ts").click();
  await files.expectFileInFolder(changed.outOf, "scripts");
  await files.expectSelected(changed.outOf);
  await expect(story.diffReading.name).toHaveText(changed.outOf);

  await development.click();
  await reviewChanges(card).press("Enter");
  await files.expectSelected(changed.outOf);
});

test("Previous and Next follow the repository tree in both filter states", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, origin);
  const files = intentReviewFiles(intent);
  const order = [
    "Modified dashboard/src/App.tsx",
    changed.into,
    changed.added,
    changed.modified,
    changed.deleted,
    "Renamed docs/notes.md → docs/renamed-notes.md",
    changed.outOf,
    changed.between,
  ] as const;
  for (const only of [false, true]) {
    if (only) await storyOnly(intent).check();
    await files.choose(order[0]);
    await files.expectMoveAtEnd("Previous file");
    for (const name of order.slice(1)) {
      await files.move("Next file", "keyboard");
      await files.expectSelected(name);
    }
    await expect(files.moveControl("Next file")).toBeFocused();
    await files.expectMoveAtEnd("Next file");
    await files.move("Previous file", "keyboard");
    await files.expectSelected(changed.outOf);
    await expect(files.moveControl("Previous file")).toBeFocused();
  }
});
