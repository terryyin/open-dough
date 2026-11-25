// The selected story's repository tree in Intent, as the story journeys
// (./intentStoryPage.ts) read and operate it: its files and folders, the
// folder rows carrying the contains-changes background, and the "Changes
// only" filter over what the tree lists.

import { expect, type Locator } from "@playwright/test";
import {
  browseStoryFiles,
  filesColumn,
  showIntentFiles,
  uncoverIntentReader,
} from "../intentModePage.ts";

// The "Changes only" toggle.
export const changesOnly = (intent: Locator) =>
  intent.getByRole("checkbox", { name: "Changes only", exact: true });

// Turns Changes only off: the tree lists the repository at the revision.
export async function listStoryRevision(intent: Locator) {
  await browseStoryFiles(intent);
  await changesOnly(intent).uncheck();
}

// A file's control in Intent's tree, by its accessible name: its full path,
// or for a changed file its kind and path as Review changes names it. A story
// comparison may append Proof's Counts and after-side words after a comma.
const fileName = (name: string) =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:,|$)`);
export const intentFile = (
  intent: Locator,
  name: string,
  options: { readonly includeHidden?: boolean } = {},
) =>
  filesColumn(intent).getByRole("button", { ...options, name: fileName(name) });

// Chooses a file in Intent's tree, opening Files first where a narrow page
// keeps it in a drawer, which the choice closes.
export async function chooseIntentFile(intent: Locator, name: string) {
  await showIntentFiles(intent);
  await intentFile(intent, name).click();
}

// Intent's tree lists no file NAME, read with Files shown and then the reader
// uncovered again where a narrow page lays Files over it as a drawer.
export async function expectNoIntentFile(intent: Locator, name: string) {
  await showIntentFiles(intent);
  await expect(intentFile(intent, name)).toHaveCount(0);
  await uncoverIntentReader(intent);
}

// The story's repository file tree.
export const repositoryTree = (intent: Locator) =>
  filesColumn(intent).getByRole("list", {
    name: "Repository files",
    exact: true,
  });

// A folder's toggle in Intent, by the folder's name and whether it is open.
export const folderToggle = (intent: Locator, name: string, open: boolean) =>
  intent.getByRole("button", {
    name: `${open ? "Collapse" : "Expand"} ${name}`,
    exact: true,
  });

// A folder's row (toggle and name) in Intent, and the list item it heads,
// which carries the contains-changes mark.
export const folderRow = (intent: Locator, name: string) =>
  intent.locator(".story-review-folder-row").filter({
    has: intent
      .page()
      .locator(`button.story-review-folder[aria-label$=" ${name}"]`),
  });

export const folderItem = (intent: Locator, name: string) =>
  folderRow(intent, name).locator("xpath=..");

// A repository folder, including a configured Intent root.
export const repositoryFolder = (intent: Locator, path: string) =>
  repositoryTree(intent).locator(
    `li[data-folder-path=${JSON.stringify(path)}]`,
  );

export const background = (row: Locator) =>
  row.evaluate((element) => getComputedStyle(element).backgroundColor);

// The selected story's tree, held by `intentStory`.
export function storyTree(intent: Locator) {
  return {
    changesOnly: (scope?: Locator) => changesOnly(scope ?? intent),
    listRevision: () => listStoryRevision(intent),
    file: (name: string) => intentFile(intent, name),
    folderToggle: (name: string, open: boolean) =>
      folderToggle(intent, name, open),
    folderRow: (name: string) => folderRow(intent, name),
    folderItem: (name: string) => folderItem(intent, name),
    folderAt: (path: string) => repositoryFolder(intent, path),
    folderRowAt: (path: string) =>
      repositoryFolder(intent, path).locator(
        ":scope > .story-review-folder-row",
      ),
    async expandFolderPath(path: string) {
      let ancestor = "";
      for (const segment of path.split("/")) {
        ancestor = ancestor ? `${ancestor}/${segment}` : segment;
        const toggle = repositoryFolder(intent, ancestor).locator(
          ":scope > div > button[aria-expanded]",
        );
        await expect(toggle).toBeVisible();
        if ((await toggle.getAttribute("aria-expanded")) === "false")
          await toggle.click();
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
      }
    },
    tree: repositoryTree(intent),
    files: filesColumn(intent),
    browseFiles: () => browseStoryFiles(intent),
  };
}
