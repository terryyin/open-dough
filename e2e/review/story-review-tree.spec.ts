// A story's review shows its changed files under their folders, of Story A's
// worktree changing nested files, a chain of single folders, a root file, and
// a rename across folders (../../dashboard/test-support/support/storyReviewWorktree.ts). Every folder
// shows expanded; a chain is one folder row; the rename sits once under its
// new folder and its old folder is absent. Each file shows by its name alone,
// its kind told by the name's style, a modified one's distinct from plain;
// its control is named, and titled, by its kind and full path, and selecting
// a nested file heads its diff with them.
// Folders collapse and expand in ./story-review-tree-collapse.spec.ts.

import {
  diffHeading,
  diffLines,
} from "../../dashboard/test-support/support/reviewPanes.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  kindStyles,
  nameStyle,
} from "../../dashboard/test-support/support/changeKindStyle.ts";
import { nestedTreeRows } from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  nestedRepository,
  storyWorktree,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

test.use({ originRepository: nestedRepository });

test("a story's changed files show by name under their folders", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  writeAt(workspace, "dashboard/src/a.tsx", "added\nconst example = 1;\n");
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const { files, diffs } = await openIntentReviewChanges(page, card);
  await files.expectOutsideCount(6);

  await test.step("files sit under their expanded folders, a chain as one row, the root file at the top level", async () => {
    await files.expectOutsideRows(nestedTreeRows);
    for (const name of [
      "Deleted dashboard/server/c.ts",
      "Added dashboard/src/a.tsx",
      "Modified dashboard/src/b.ts",
      "Added docs/adrs/drafts/0009-tree.md",
      "Renamed old/a.ts → new/a.ts",
      "Modified README.md",
    ]) {
      const file = files.row(name);
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
      await expect(files.folder(name)).toHaveAttribute("aria-expanded", "true");
    }
  });

  await test.step("selecting the first changed row opens its diff", async () => {
    await files.choose("Deleted dashboard/server/c.ts");
    await files.expectSelected("Deleted dashboard/server/c.ts");
    await expect(
      files.outsideList.locator('button[aria-pressed="true"]'),
    ).toHaveCount(1);
    const diff = diffs.toRead("Deleted dashboard/server/c.ts");
    await expect(diffHeading(diff, { level: 3 })).toHaveText(
      "Deleted dashboard/server/c.ts",
    );
    await expect(diffLines(diff).first()).toHaveText("-c 0");
  });

  await test.step("each file's kind shows only in the style of its name", async () => {
    const style = await kindStyles(files.outsideList);
    for (const [name, expected] of [
      ["Added dashboard/src/a.tsx", style.added],
      ["Added docs/adrs/drafts/0009-tree.md", style.added],
      ["Modified dashboard/src/b.ts", style.modified],
      ["Modified README.md", style.modified],
      ["Deleted dashboard/server/c.ts", style.deleted],
      ["Renamed old/a.ts → new/a.ts", style.renamed],
    ] as const) {
      expect(await nameStyle(files.row(name)), name).toEqual(expected);
    }
    // Each row carries its kind from the shared change-kind model.
    await expect(
      files.outsideList.getByRole("listitem").filter({
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
    await files.folderName("server").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAccessibleName(
      "Deleted dashboard/server/c.ts",
    );
    // Its row shows its name, with its line counts beside it.
    await expect(page.locator(":focus > code")).toHaveText("c.ts");
  });

  await test.step("selecting a nested file heads its diff with its kind and full path", async () => {
    await files.choose("Added dashboard/src/a.tsx", "keyboard");
    const diff = diffs.toRead("Added dashboard/src/a.tsx");
    await expect(diffHeading(diff, { level: 3 })).toHaveText(
      "Added dashboard/src/a.tsx",
    );
    await expect(diffLines(diff)).toHaveText(["+added", "+const example = 1;"]);
    await diffs.expectSyntaxToken("Added dashboard/src/a.tsx", "const");
    await files.choose("Renamed old/a.ts → new/a.ts", "keyboard");
    await expect(
      diffHeading(diffs.toRead("Renamed old/a.ts → new/a.ts"), {
        level: 3,
      }),
    ).toHaveText("Renamed old/a.ts → new/a.ts");
  });
});
