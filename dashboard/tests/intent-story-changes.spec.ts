// Example 1 and 3: a Taken story whose worktree changes the tests Intent
// publishes (./support/intentStoryWorktree.ts) is selected by its card's
// empty area, and Intent names it with the revisions its default Review
// changes comparison runs between. The whole published tree shows, changed
// files styled by kind and the added one inserted; the folders and location
// groups containing changes have the contains-changes background and are
// open, with the first changed location, while everything else stays
// collapsed. The changed files outside every location are counted, pointing
// to Review changes. A changed file's Purpose is the same diff Review
// changes shows and its Proof says it describes the published revision; an
// unchanged file shows its published source. Deselecting removes the lens.
// "Selected story only": ./intent-story-changes-only.spec.ts. Deletions and
// renames: ./intent-story-changes-moves.spec.ts. No
// comparison and a failed read: ./intent-story-changes-gaps.spec.ts.

import { parts } from "./dashboardPage.ts";
import { expectSelected } from "./storyCardSelection.ts";
import { shortRevision } from "./dashboardParts.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  background,
  folderCaret,
  folderItem,
  folderRow,
  intentDiff,
  intentFile,
  lens,
  locationGroup,
  openReviewFromIntent,
  reviewDiff,
  selectTakenStoryInIntent,
} from "./support/intentStoryPage.ts";
import { kindStyles, nameStyle } from "./support/changeKindStyle.ts";
import { changed } from "./support/intentStoryWorktree.ts";
import {
  chooseReadingTab,
  intentGroupToggle,
} from "./intentPerspectivePage.ts";

test.setTimeout(120_000);

test("Intent highlights a selected Taken story's test changes over the published tree, each changed file with Review changes' own diff", async ({
  page,
  origin,
}) => {
  const { card, intent, baseline, head } = await selectTakenStoryInIntent(
    page,
    origin,
  );
  const scoped = lens(intent);

  await test.step("Intent names the story and the revisions its comparison runs between", async () => {
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expect(scoped.locator(".intent-story-name")).toHaveText(
      "Story Story A SEED-A#a",
    );
    const revisions = scoped.locator(".intent-story-revisions");
    await expect(revisions).toContainText(
      `Compared ${shortRevision(baseline)} with worktree `,
    );
    await expect(revisions).toContainText(
      `at ${shortRevision(head)}, uncommitted changes included.`,
    );
    await expect(revisions.locator(`code[title="${baseline}"]`)).toHaveCount(1);
    await expect(revisions.locator("code").nth(1)).toContainText(
      "another-agent-workspace",
    );
  });

  await test.step("the changed files outside every location are counted once each, pointing to Review changes", async () => {
    await expect(intent.locator(".intent-story-outside")).toHaveText(
      "2 changed files outside Intent locations are shown in Review changes. Review changes",
    );
    await expect(intent.getByText("App.tsx")).toHaveCount(0);
    await expect(intent.getByText(/notes\.md/)).toHaveCount(0);
  });

  await test.step("the first changed location and its folders containing changes are open; the rest stay collapsed", async () => {
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(intentGroupToggle(intent, "tests")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    for (const name of ["arriving", "boundary", "out"])
      await expect(folderCaret(intent, name, true)).toBeVisible();
    await expect(folderCaret(intent, "other", false)).toBeVisible();
    await expect(
      intentFile(intent, "dashboard/tests/other/c.spec.ts"),
    ).toBeHidden();
  });

  await test.step("changed files are styled by kind, the added one inserted at its path", async () => {
    const style = await kindStyles(intent);
    for (const [name, expected] of [
      [changed.modified, style.modified],
      [changed.added, style.added],
      [changed.deleted, style.deleted],
      [changed.into, style.renamed],
      [changed.outOf, style.renamed],
      ["dashboard/tests/boundary/kept.spec.ts", style.plain],
    ] as const) {
      const file = intentFile(intent, name);
      await expect(file).toBeVisible();
      expect(await nameStyle(file)).toEqual(expected);
    }
  });

  await test.step("folders and groups containing changes have the contains-changes background", async () => {
    const marked = await background(folderRow(intent, "boundary"));
    expect(marked).not.toBe("rgba(0, 0, 0, 0)");
    for (const name of ["arriving", "boundary", "out"]) {
      await expect(folderItem(intent, name)).toHaveAttribute(
        "data-contains-changes",
        "true",
      );
      expect(await background(folderRow(intent, name))).toBe(marked);
    }
    await expect(folderItem(intent, "other")).not.toHaveAttribute(
      "data-contains-changes",
    );
    expect(await background(folderRow(intent, "other"))).not.toBe(marked);
    for (const location of ["dashboard/tests", "tests"]) {
      const group = locationGroup(intent, location);
      await expect(group).toHaveAttribute("data-contains-changes", "true");
      expect(await background(group.locator(".intent-location-header"))).toBe(
        marked,
      );
    }
  });

  await test.step("a changed file's Purpose is Review changes' diff, and its Proof describes the published revision", async () => {
    const inIntent = await intentDiff(intent, changed.modified);
    expect(inIntent).toContain("more");
    const proof = await chooseReadingTab(intent, "Proof");
    await expect(proof.locator(".intent-proof-published")).toHaveText(
      `Proof describes the published revision ${shortRevision(baseline)}, not this story's version of the file.`,
    );
    await openReviewFromIntent(page, intent);
    const review = page.getByRole("region", { name: "Story review" });
    await expect(
      review.getByRole("button", {
        name: "Modified dashboard/src/App.tsx",
        exact: true,
      }),
    ).toBeVisible();
    expect(await reviewDiff(page, changed.modified)).toBe(inIntent);
    expect(await intentDiff(intent, changed.added)).toBe(
      await reviewDiff(page, changed.added),
    );
  });

  await test.step("an unchanged file shows its published source", async () => {
    await intentFile(intent, "dashboard/tests/boundary/kept.spec.ts").click();
    const purpose = await chooseReadingTab(intent, "Purpose");
    await expect(purpose).toContainText("kept 11");
    await expect(purpose.locator(".story-review-code")).toHaveCount(0);
    await expect(intent.locator(".intent-proof-published")).toHaveCount(0);
  });

  await test.step("closing the story's review clears the selected story and removes the lens", async () => {
    const { development, intentChoice } = parts(page);
    const review = page.getByRole("region", { name: "Story review" });
    await review.getByRole("button", { name: "Close", exact: true }).click();
    await expect(review).toHaveCount(0);
    await development.click();
    await expectSelected(card, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(scoped).toHaveCount(0);
    await expect(intent.locator(".intent-story-outside")).toHaveCount(0);
    await expect(intent.locator("[data-kind]")).toHaveCount(0);
    await expect(intent.locator("[data-contains-changes]")).toHaveCount(0);
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
