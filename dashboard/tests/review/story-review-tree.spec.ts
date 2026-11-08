// A story's review shows its changed files under their folders, of Story A's
// worktree changing nested files, a chain of single folders, a root file, and
// a rename across folders (../support/storyReviewWorktree.ts). Every folder
// shows expanded; a chain is one folder row; the rename sits once under its
// new folder and its old folder is absent. Each file shows by its name alone,
// its kind told by the name's style, a modified one's distinct from plain;
// its control is named, and titled, by its kind and full path, and selecting
// a nested file heads its diff with them.
// The review opens on the first file in the browser's order, inside the
// folders that come first.
// Folders collapse and expand in ./story-review-tree-collapse.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { kindStyles, nameStyle } from "../support/changeKindStyle.ts";
import {
  nestedTreeRows,
  treeFolder,
  treeRows,
} from "../support/reviewTreeRows.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import { nestedWorktree } from "../support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../support/storyLaunchRecord.ts";

test("a story's changed files show by name under their folders", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = nestedWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Story review" });
  const files = review.getByRole("list", { name: "6 changed files" });
  await expect(files).toBeVisible();

  await test.step("files sit under their expanded folders, a chain as one row, the root file at the top level", async () => {
    await expect.poll(() => treeRows(files)).toEqual(nestedTreeRows);
    for (const name of [
      "Deleted dashboard/server/c.ts",
      "Added dashboard/src/a.tsx",
      "Modified dashboard/src/b.ts",
      "Added docs/adrs/drafts/0009-tree.md",
      "Renamed old/a.ts → new/a.ts",
      "Modified README.md",
    ]) {
      const file = files.getByRole("button", { name, exact: true });
      await expect(file).toBeVisible();
      await expect(file).toHaveAttribute("title", name);
    }
    for (const name of [
      "dashboard",
      "server",
      "src",
      "docs/adrs/drafts",
      "new",
    ]) {
      await expect(treeFolder(review, name)).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    }
  });

  await test.step("the review opens on the first file in the browser's order", async () => {
    const first = files.getByRole("button", {
      name: "Deleted dashboard/server/c.ts",
      exact: true,
    });
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await expect(files.locator('button[aria-pressed="true"]')).toHaveCount(1);
    const diff = review.getByRole("region", {
      name: "Deleted dashboard/server/c.ts",
    });
    await expect(diff.getByRole("heading", { level: 3 })).toHaveText(
      "Deleted dashboard/server/c.ts",
    );
    await expect(diff.locator("li.story-review-line").first()).toHaveText(
      "-c 0",
    );
  });

  await test.step("each file's kind shows only in the style of its name", async () => {
    const style = await kindStyles(files);
    for (const [name, expected] of [
      ["Added dashboard/src/a.tsx", style.added],
      ["Added docs/adrs/drafts/0009-tree.md", style.added],
      ["Modified dashboard/src/b.ts", style.modified],
      ["Modified README.md", style.modified],
      ["Deleted dashboard/server/c.ts", style.deleted],
      ["Renamed old/a.ts → new/a.ts", style.renamed],
    ] as const) {
      expect(
        await nameStyle(files.getByRole("button", { name, exact: true })),
        name,
      ).toEqual(expected);
    }
    // Each row carries its kind from the shared change-kind model.
    await expect(
      files.getByRole("listitem").filter({
        has: page.getByRole("button", {
          name: "Modified README.md",
          exact: true,
        }),
      }),
    ).toHaveAttribute("data-kind", "modified");
    // The kinds' colours differ from each other and from plain text, so the
    // comparison above can tell them.
    expect(
      new Set(
        [style.plain, style.added, style.modified, style.deleted].map(
          ({ color }) => color,
        ),
      ).size,
    ).toBe(4);
  });

  await test.step("a keyboard-focused file says its kind and full path in words", async () => {
    // The browser's first file follows its folder in the tab order.
    await treeFolder(review, "server").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAccessibleName(
      "Deleted dashboard/server/c.ts",
    );
    // Its row shows its name, with its line counts beside it.
    await expect(page.locator(":focus > code")).toHaveText("c.ts");
  });

  await test.step("selecting a nested file heads its diff with its kind and full path", async () => {
    await files
      .getByRole("button", { name: "Added dashboard/src/a.tsx" })
      .press("Enter");
    const diff = review.getByRole("region", {
      name: "Added dashboard/src/a.tsx",
    });
    await expect(diff.getByRole("heading", { level: 3 })).toHaveText(
      "Added dashboard/src/a.tsx",
    );
    await expect(diff.locator("li.story-review-line")).toHaveText(["+added"]);
    await files
      .getByRole("button", { name: "Renamed old/a.ts → new/a.ts" })
      .press("Enter");
    await expect(
      review
        .getByRole("region", { name: "Renamed old/a.ts → new/a.ts" })
        .getByRole("heading", { level: 3 }),
    ).toHaveText("Renamed old/a.ts → new/a.ts");
  });
});
