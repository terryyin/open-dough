// The selected story's file browser in a mounted Intent view, as the
// comparison (./intent-story-compare-page.ts) lists it: the repository tree
// and its folders, the Changes only filter, and the listed files' controls.
import { expect } from "vitest";
import { userEvent } from "vitest/browser";
import "../page-objects/cssLocator.ts";
import { fileLayout, intentPage as intent } from "./intent-file-layout-page.ts";

const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A listed file's control is named by its kind and path.
const fileNamed = (name: string) => ({
  name: new RegExp(`^${escaped(name)}(?:,|$)`),
});

export function intentStoryFiles() {
  const sidebar = intent.getByCSS(".intent-locations");
  const tree = intent.getByRole("list", {
    name: "Repository files",
    exact: true,
  });
  const folder = (path: string) =>
    tree.getByCSS(`li[data-folder-path="${CSS.escape(path)}"]`);
  const changesOnly = intent.getByRole("checkbox", {
    name: "Changes only",
    exact: true,
  });
  // Files shown without choosing a path, opening its drawer where the page
  // is narrow: each newly entered view starts it closed, and choosing a file
  // closes it.
  const browseFiles = () => fileLayout().showFiles();
  return {
    browseFiles,
    sidebar,
    tree,
    treeText: () => tree.query()?.textContent ?? "",
    folder,
    async expandFolderPath(path: string) {
      await browseFiles();
      let ancestor = "";
      for (const segment of path.split("/")) {
        ancestor = ancestor ? `${ancestor}/${segment}` : segment;
        const toggle = folder(ancestor).getByCSS(
          ":scope > div > button[aria-expanded]",
        );
        await expect.element(toggle).toBeVisible();
        if (toggle.element().getAttribute("aria-expanded") === "false")
          await userEvent.click(toggle);
        await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
      }
    },
    changesOnly,
    // Turns Changes only off, listing the repository at the revision.
    async listRevision() {
      await browseFiles();
      if ((changesOnly.element() as HTMLInputElement).checked)
        await userEvent.click(changesOnly);
      await expect.element(changesOnly).not.toBeChecked();
    },
    // A listed file's control, named by its kind and path.
    file: (name: string) => sidebar.getByRole("button", fileNamed(name)),
    // A location's or folder's toggle, by its name and whether it is open.
    folderToggle: (name: string, open: boolean) =>
      intent.getByRole("button", {
        name: `${open ? "Collapse" : "Expand"} ${name}`,
        exact: true,
      }),
  };
}
