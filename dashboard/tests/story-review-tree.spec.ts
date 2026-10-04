// A story's review shows its changed files under their folders, of Story A's
// worktree changing nested files, a chain of single folders, a root file, and
// a rename across folders (./support/storyReviewWorktree.ts). Every folder
// shows expanded; a chain is one folder row; the rename sits once under its
// new folder and its old folder is absent. Each file's control is named, and
// titled, by its kind and full path, and selecting a nested file heads its
// diff with them.

import { expect, test } from "./support/preparationPage.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  keepLaunchRecord,
  nestedWorktree,
} from "./support/storyReviewWorktree.ts";

test("a story's changed files show by name under their folders", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = nestedWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  const files = review.getByRole("list", { name: "6 changed files" });
  await expect(files).toBeVisible();

  await test.step("files sit under their expanded folders, a chain as one row, the root file at the top level", async () => {
    await expect
      .poll(() => treeRows(files))
      .toEqual([
        "dashboard",
        "  server",
        "    Deleted c.ts",
        "  src",
        "    Added a.tsx",
        "    Modified b.ts",
        "docs/adrs/drafts",
        "  Added 0009-tree.md",
        // The rename's old folder shows nothing for it.
        "new",
        "  Renamed a.ts",
        "Modified README.md",
      ]);
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
    await expect(diff.getByRole("listitem")).toHaveText(["+added"]);
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
