// A story's review shows its changed files under their folders, of Story A's
// worktree changing nested files, a chain of single folders, a root file, and
// a rename across folders (./support/storyReviewWorktree.ts). Every folder
// shows expanded; a chain is one folder row; the rename sits once under its
// new folder and its old folder is absent. Each file shows by its name alone,
// its kind told by the name's style; its control is named, and titled, by its
// kind and full path, and selecting a nested file heads its diff with them.

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
        "    c.ts",
        "  src",
        "    a.tsx",
        "    b.ts",
        "docs/adrs/drafts",
        "  0009-tree.md",
        // The rename's old folder shows nothing for it.
        "new",
        "  a.ts",
        "README.md",
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

  await test.step("each file's kind shows only in the style of its name", async () => {
    // The dashboard's own colours, as this page resolves them.
    const tokens = await files.evaluate((list) => {
      const probe = document.createElement("span");
      list.append(probe);
      const resolve = (token: string) => {
        probe.style.color = `var(${token})`;
        return getComputedStyle(probe).color;
      };
      const resolved = {
        text: resolve("--text"),
        ready: resolve("--ready"),
        quiet: resolve("--quiet"),
      };
      probe.remove();
      return resolved;
    });
    const nameStyle = (name: string) =>
      files
        .getByRole("button", { name, exact: true })
        .locator("code")
        .evaluate((code) => {
          const style = getComputedStyle(code);
          return {
            color: style.color,
            line: style.textDecorationLine,
            fontStyle: style.fontStyle,
          };
        });
    const plain = { color: tokens.text, line: "none", fontStyle: "normal" };
    for (const [name, style] of [
      ["Added dashboard/src/a.tsx", { ...plain, color: tokens.ready }],
      [
        "Added docs/adrs/drafts/0009-tree.md",
        { ...plain, color: tokens.ready },
      ],
      ["Modified dashboard/src/b.ts", plain],
      ["Modified README.md", plain],
      [
        "Deleted dashboard/server/c.ts",
        { ...plain, color: tokens.quiet, line: "line-through" },
      ],
      ["Renamed old/a.ts → new/a.ts", { ...plain, fontStyle: "italic" }],
    ] as const) {
      expect(await nameStyle(name), name).toEqual(style);
    }
    // The three kinds' colours differ, so the comparison above can tell them.
    expect(new Set(Object.values(tokens)).size).toBe(3);
  });

  await test.step("a keyboard-focused file says its kind and full path in words", async () => {
    // The browser's first file follows Hide files in the tab order.
    await review.getByRole("button", { name: "Hide files" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAccessibleName(
      "Deleted dashboard/server/c.ts",
    );
    await expect(page.locator(":focus")).toHaveText("c.ts");
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
