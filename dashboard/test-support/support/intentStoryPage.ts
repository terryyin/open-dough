import { codePane, expectContextRead } from "./reviewPanes.ts";
import {
  chooseStoryTab,
  expectStoryTab,
  filesColumn,
  storySummary,
  storyTabPanel,
  storyViews,
} from "../intentModePage.ts";
// What the story-scoped Intent journeys (../intent-story-changes*.spec.ts)
// read of the page: the selected story's header and views, the contains-changes
// background, the "Selected story only" toggle, and a changed file's diff in
// Intent's Purpose. Scenarios that read several of these hold `intentStory`.
// Arranging the taken story: ./selectTakenStoryInIntent.ts. A row's
// change-kind style: ./changeKindStyle.ts.

import { expect, type Locator } from "@playwright/test";
import { storyReviewWaitMs } from "../../src/storyReviewContract.ts";
import { purposeRegion } from "../intentPerspectivePage.ts";
import {
  fileFollowUp,
  fileFollowUpDialog,
  followUpComposer,
} from "./fileFollowUpPage.ts";

// Intent says it is reading the selected story's changes from the story's
// selection until it shows the answer, which the boundary may take up to its
// read bound to give.
export const expectStoryComparisonRead = (intent: Locator) =>
  expect(intent.getByText("Reading the story's changes…")).toHaveCount(0, {
    timeout: storyReviewWaitMs,
  });

// Preserve the established API while the shared native root lives with page modes.
export {
  storySummary,
  storyViews,
  storyTab,
  storyTabPanel,
  expectStoryTab,
  chooseStoryTab,
} from "../intentModePage.ts";

// Story-specific readings within the persistent selected-story header.
export function storyHeaderReading(intent: Locator) {
  const region = storySummary(intent);
  const revisions = region.locator(".intent-story-revisions");
  return {
    region,
    crumb: region.locator(".intent-story-crumb"),
    identity: region.locator(".record-identity"),
    revisions,
    publishedBaseline: revisions.getByText(/^Baseline /).locator("code"),
    publishedCompletion: revisions.getByText(/^Completion /).locator("code"),
    status: region.getByRole("status"),
    done: region.locator(".intent-story-done"),
  };
}

// The header's title, which names the story in full.
export const storyTitle = (intent: Locator) =>
  storySummary(intent).getByRole("heading", { level: 2 });

// The comparison details under the header's summary, revealed by its eye:
// the revisions or full explanation, the follow-up action and Refresh.
export async function showComparisonDetails(header: Locator) {
  await expect(header).toBeVisible();
  const eye = header.getByRole("button", {
    name: "Show review details",
    exact: true,
  });
  if ((await eye.count()) > 0) await eye.click();
  await expect(
    header.getByRole("button", { name: "Hide review details", exact: true }),
  ).toBeVisible();
  return header;
}

// What the header says beyond the title: the identity, and the revisions or
// full explanation of the comparison.
export async function storyHeaderDetail(intent: Locator) {
  const header = await showComparisonDetails(storySummary(intent));
  await expect(
    header.getByRole("button", { expanded: false, name: /^(?!Branch )/ }),
  ).toHaveCount(0);
  return header;
}

// The "Selected story only" toggle.
export const storyOnly = (intent: Locator) =>
  intent.getByRole("checkbox", { name: "Selected story only", exact: true });

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

// Read the already selected diff without selecting a file or changing its place.
export function intentDiffReading(intent: Locator) {
  const purpose = purposeRegion(intent);
  return {
    container: intent.locator(".intent-story-diff"),
    name: purpose.locator(".story-review-diff-heading h3"),
    code: codePane(purpose),
  };
}

async function expectDiffReady(code: Locator) {
  await expect(code).toBeVisible();
  // Omitted context must be known before its gaps are read.
  await expectContextRead(code);
}
export const readIntentDiff = (intent: Locator) =>
  intentDiffReading(intent).code.innerText();

// Selects the file's row, then reads its diff once ready.
async function selectedDiff(intent: Locator, row: Locator, name: string) {
  await row.click();
  await expect(intentDiffReading(intent).name).toHaveText(name);
  await expectDiffReady(intentDiffReading(intent).code);
  return readIntentDiff(intent);
}
export const intentDiff = (intent: Locator, name: string) =>
  selectedDiff(intent, intentFile(intent, name), name);

// Opens the Start session dialog from a Follow up control in Intent.
async function followUpFrom(intent: Locator, control: Locator) {
  await control.click();
  const dialog = fileFollowUpDialog(intent.page());
  await expect(dialog).toBeVisible();
  return followUpComposer(dialog);
}

// The selected story in Intent. Diff text comes back for the scenario to
// compare; `background` stays a measurement the scenario compares itself.
export function intentStory(intent: Locator) {
  return {
    summary: storySummary(intent),
    header: storyHeaderReading(intent),
    title: storyTitle(intent),
    views: storyViews(intent),
    diffReading: intentDiffReading(intent),
    storyOnly: (scope?: Locator) => storyOnly(scope ?? intent),
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
    headerDetail: () => storyHeaderDetail(intent),
    chooseTab: (name: Parameters<typeof chooseStoryTab>[1]) =>
      chooseStoryTab(intent, name),
    expectTab: (name: Parameters<typeof expectStoryTab>[1]) =>
      expectStoryTab(intent, name),
    panel: (name: Parameters<typeof storyTabPanel>[1]) =>
      storyTabPanel(intent, name),
    expectComparisonRead: () => expectStoryComparisonRead(intent),
    followUpComparison: () =>
      followUpFrom(
        intent,
        storySummary(intent)
          .locator(".intent-story-title-line")
          .getByRole("button", {
            name: "Follow up on comparison",
            exact: true,
          }),
      ),
    // The Follow up beside the selected diff's file path.
    followUpFile: (storyName: string) =>
      followUpFrom(intent, fileFollowUp(intent, storyName)),
    diff: (name: string) => intentDiff(intent, name),
  };
}
