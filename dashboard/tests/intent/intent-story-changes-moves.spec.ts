// Deleted and renamed files under Intent's location rule
// (../support/intentStoryWorktree.ts): a deleted spec stays visible as
// removed; a rename between the two configured locations sits at its new
// path, its old folder gone; a rename into a location from outside is
// inserted at its new path; a rename out of a location stays reviewable at
// its old path; each opens the same diff Review changes shows. A rename with
// neither path in a location is not listed and counts once, with the
// product change, among the changed files outside the locations. All of this
// holds with "Selected story only" off and on, the location's unchanged file
// left out when it is on. A folder's Summary lists the files the overlaid
// tree shows, the story's added one included. The highlighted journey:
// ./intent-story-changes.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import {
  intentDiff,
  intentFile,
  openReviewFromIntent,
  reviewDiff,
  selectTakenStoryInIntent,
  storyOnly,
} from "../support/intentStoryPage.ts";
import { kindStyles, nameStyle } from "../support/changeKindStyle.ts";
import { changed } from "../support/intentStoryWorktree.ts";
import {
  expandIntentGroup,
  intentFolderName,
} from "../intentPerspectivePage.ts";
import { expectChildNames, summaryRegion } from "../intentScopeProofPage.ts";

test.setTimeout(120_000);

test("deletions and renames admitted by either path stay reviewable in Intent with Review changes' diff; a rename neither path admits counts once outside", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, origin);
  const style = await kindStyles(intent);
  const inIntent = new Map<string, string>();

  await test.step("a folder's Summary lists the files its tree shows, the story's added one included", async () => {
    await intentFolderName(intent, "boundary").click();
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
      // The rename out of `dashboard/tests` sits at its old path, by name.
      await expect(intentFile(intent, changed.outOf)).toHaveText(
        "leaving.spec.ts",
      );
      // The rename between locations left its old folder behind.
      await expect(intent.getByRole("button", { name: /between/ })).toHaveCount(
        0,
      );
      await expandIntentGroup(intent, "tests");
      const between = intentFile(intent, changed.between);
      await expect(between).toHaveCount(1);
      await expect(between).toHaveText("moved.sh");
      expect(await nameStyle(between)).toEqual(style.renamed);
      await expect(intentFile(intent, "tests/check.sh")).toHaveCount(
        only ? 0 : 1,
      );
    });

    await test.step(`Selected story only ${state}: a rename neither path admits is not listed and counts once outside`, async () => {
      await expect(intent.getByText(/notes\.md/)).toHaveCount(0);
      await expect(intent.locator(".intent-story-outside")).toContainText(
        "2 changed files outside Intent locations are shown in Review changes.",
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

  await test.step("each deletion and rename's diff in Intent is the one Review changes shows", async () => {
    expect(inIntent.get(changed.deleted)).toContain("gone 0");
    expect(inIntent.get(changed.between)).toContain("renamed");
    await openReviewFromIntent(page, intent);
    for (const [name, diff] of inIntent)
      expect(await reviewDiff(page, name), name).toBe(diff);
    await expect(
      page.getByRole("region", { name: "Story review" }).getByRole("button", {
        name: "Renamed docs/notes.md → docs/renamed-notes.md",
        exact: true,
      }),
    ).toBeVisible();
  });
});
