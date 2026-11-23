import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds } from "../../../Distribution/tests/support/storyReviewSnapshotTestData.mjs";
import type { PageReads } from "../../src/pageReads.tsx";
import { storyNotesNames as names } from "../../test-support/storyNotesNames.ts";
import { notesKept } from "../review/story-review-page-contexts.ts";
import { printedDiff } from "../review/styledDiffCases.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  openStoryChanges,
  productPath,
} from "./intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const identity = "SEED-A#a";
const deepPath = "dashboard/tests/boundary/deep/long.spec.ts";
const deepFile = `Added ${deepPath}`;
const outsideFile = `Modified ${productPath}`;
const longFile = [...Array<unknown>(120).keys()].map(
  (index) => `long ${index + 1}`,
);
const outsideBaseline = "previous app";
const outsideLine = "app change";

async function openChangesWithNotes(
  storyNotes: PageReads["storyNotes"],
  title = "Story A",
) {
  const review = makeMe.aStoryReview
    .adding(deepPath, longFile.length)
    .modifying(productPath)
    .please();
  await openStoryChanges({
    title,
    storyNotes,
    review: () => Promise.resolve(review),
    fileDiff: ({ path }) =>
      Promise.resolve(
        path === productPath
          ? {
              kind: "diff",
              printed: printedDiff(productPath, [
                "@@ -1 +1 @@",
                `-${outsideBaseline}`,
                `+${outsideLine}`,
              ]),
            }
          : makeMe.aReviewedFileDiff.adding(deepPath, ...longFile).please(),
      ),
    fileText: ({ path }) =>
      Promise.resolve(
        path === productPath
          ? {
              kind: "text",
              baseline: `${outsideBaseline}\n`,
              tree: `${outsideLine}\n`,
            }
          : { kind: "text", baseline: "", tree: `${longFile.join("\n")}\n` },
      ),
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  return story;
}

const dialog = page.getByRole("dialog", { name: names.dialog, exact: true });
const noteText = dialog.getByRole("textbox", {
  name: names.field,
  exact: true,
});
const purpose = page.getByRole("region", { name: "Purpose", exact: true });

async function startLineNote(line: number, context: readonly string[]) {
  await purpose
    .getByRole("button", { name: `New line ${line}`, exact: true })
    .click();
  await page
    .getByRole("menu", { name: `New line ${line}`, exact: true })
    .getByRole("menuitem", { name: names.add, exact: true })
    .click();
  await expect.element(noteText).toBeVisible();
  const composer = noteText.element().closest("form");
  for (const text of context) expect(composer?.textContent).toContain(text);
}

async function saveLineNote(text: string) {
  await userEvent.fill(noteText, text);
  await dialog.getByRole("button", { name: names.save, exact: true }).click();
  await expect.element(dialog).not.toBeInTheDocument();
}

const workspaceComparison = {
  name: "All changes",
  baseline: storyReviewIds.baseline,
  tree: storyReviewIds.tree,
};

test("the unreadable Notes warning leaves the Notes icon beside a long Intent story title", async () => {
  const title = "Story A shows a long title beside its notes";
  const story = await openChangesWithNotes(
    () => Promise.resolve({ kind: "unreadable" }),
    title,
  );
  await page.viewport(420, 720);
  const heading = story.header.getByRole("heading", {
    name: title,
    exact: true,
  });
  const warning = story.header
    .getByRole("status")
    .filter({ hasText: "The notes could not be read." });
  const control = story.header.getByRole("button", {
    name: names.count(0),
    exact: true,
  });
  await expect
    .element(warning)
    .toHaveTextContent("The notes could not be read.");
  await expect
    .element(story.header.getByRole("button", { name: names.counted }))
    .not.toBeInTheDocument();
  await expect.element(control).toBeVisible();
  await expect.element(control).toHaveTextContent("");
  await expect.element(heading).toBeVisible();
  const icon = control.element().getBoundingClientRect();
  const words = heading.element().getBoundingClientRect();
  expect(icon.left).toBeGreaterThanOrEqual(words.right);
  expect(icon.top).toBeGreaterThanOrEqual(words.top);
  expect(icon.bottom).toBeLessThanOrEqual(words.bottom);
});

test("a line note from Intent Changes records the Intent view", async () => {
  const notes = notesKept();
  const story = await openChangesWithNotes(notes.source);
  await story.file(deepFile).click();
  await expect.poll(story.diffName).toBe(deepFile);
  await startLineNote(13, ["Intent → Changes", "Line 13 · new"]);
  await saveLineNote("Intent observation");
  expect(notes.changes()).toEqual([
    {
      action: "add",
      identity,
      text: "Intent observation",
      context: {
        view: "Intent → Changes",
        path: deepPath,
        comparison: workspaceComparison,
        line: { number: 13, side: "new", text: "long 13" },
      },
    },
  ]);
});

test("a note saved from Intent → Changed tests still reads its view", async () => {
  const note = makeMe.aStoryNote
    .withText("Older observation")
    .withContext({
      view: "Intent → Changed tests",
      path: productPath,
      comparison: { name: "Story branch", baseline: "abc", tree: "def" },
    })
    .please();
  const story = await openChangesWithNotes(() =>
    Promise.resolve({
      kind: "notes",
      notes: { [identity]: [note] },
    }),
  );
  await story.header.getByRole("button", { name: names.control }).click();
  const entry = dialog
    .getByRole("list", { name: names.savedNotes })
    .getByRole("listitem")
    .filter({ hasText: "Older observation" });
  await expect.element(entry).toBeVisible();
  expect(entry.element().textContent).toContain("Intent → Changed tests");
});

test("a line note can start from the diff of a file outside Intent locations", async () => {
  const notes = notesKept();
  const story = await openChangesWithNotes(notes.source);
  await story.outsideFile(outsideFile).click();
  await expect.poll(story.diffName).toBe(outsideFile);
  await startLineNote(1, ["Intent → Changes", productPath, "Line 1 · new"]);
  await saveLineNote("Outside Intent locations");
  expect(notes.changes()).toEqual([
    {
      action: "add",
      identity,
      text: "Outside Intent locations",
      context: {
        view: "Intent → Changes",
        path: productPath,
        comparison: workspaceComparison,
        line: { number: 1, side: "new", text: outsideLine },
      },
    },
  ]);
});

test("Notes from Intent keeps the selected file's reading and returns focus", async () => {
  const story = await openChangesWithNotes(notesKept().source);
  const file = story.file(deepFile);
  await file.click();
  await expect.poll(story.diffName).toBe(deepFile);
  await expect
    .element(purpose.getByLabelText("New line 120", { exact: true }))
    .toBeVisible();
  await expect
    .poll(() =>
      purpose
        .element()
        .querySelector(".story-review-code")
        ?.getAttribute("aria-busy"),
    )
    .toBe("false");
  const browser = intentBrowser();
  const offset = await browser.scrollHalfway();
  expect(offset).toBeGreaterThan(0);

  const opener = story.header.getByRole("button", { name: names.control });
  (opener.element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(dialog.getByText("Story A", { exact: true }))
    .toBeVisible();
  await expect
    .element(dialog.getByText(identity, { exact: true }))
    .toBeVisible();
  await dialog.getByRole("button", { name: names.close, exact: true }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
  await expect.element(file).toHaveAttribute("aria-pressed", "true");
  await expect.poll(story.diffName).toBe(deepFile);
  await browser.isScrolledTo(offset);
});
