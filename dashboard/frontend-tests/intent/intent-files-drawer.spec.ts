import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { center } from "../navigation/board-reading-page.ts";
import { scopeToggle } from "./intent-browser-page.ts";
import {
  deepFile,
  openIntentFileLayout,
} from "./intent-file-layout-fixture.ts";
import { fileLayout, projectView } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const clickAt = (point: { x: number; y: number }) =>
  userEvent.click(page.elementLocator(document.body), { position: point });

async function openStoryChangesOnPhone() {
  await openIntentFileLayout({ viewport: { width: 390, height: 844 } });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  return story;
}

test("on a phone, Files opens over the full story reader and an outside click closes it before the page acts", async () => {
  const story = await openStoryChangesOnPhone();
  const files = fileLayout();
  await files.showsFiles(false);
  await files.showsFullReader();

  await files.toggle.click();
  await files.showsFiles(true);
  await files.showsFullReader();
  const coverage = center(story.viewTab("Intent coverage").element());
  await clickAt(coverage);
  await files.showsFiles(false);
  await expect
    .element(story.viewTab("Changes"))
    .toHaveAttribute("aria-selected", "true");

  await clickAt(coverage);
  await expect
    .element(story.viewTab("Intent coverage"))
    .toHaveAttribute("aria-selected", "true");
});

test("on a phone, expanding a folder keeps the Files drawer open, choosing a file exposes its reading and Files reopens to the same browsing place", async () => {
  const story = await openStoryChangesOnPhone();
  const files = fileLayout();
  await files.toggle.click();
  await story.onlyChangedFiles.click();
  await files.showsFiles(true);
  const folder = scopeToggle("deep");
  for (const expanded of ["false", "true"]) {
    await folder.click();
    await expect.element(folder).toHaveAttribute("aria-expanded", expanded);
    await files.showsFiles(true);
  }

  await story.file(deepFile).click();
  await files.showsFiles(false);
  await expect.poll(story.diffName).toBe(deepFile);
  await files.showsFullReader();

  await files.toggle.click();
  await files.showsFiles(true);
  await expect.element(story.onlyChangedFiles).toBeChecked();
  await expect
    .element(story.file(deepFile))
    .toHaveAttribute("aria-pressed", "true");
  const offset = await files.scrollFilesHalfway();
  await files.toggle.click();
  await files.toggle.click();
  await expect.poll(files.fileScroll).toBe(offset);
});

test("on a phone, Escape closes the Files drawer to the full reader and returns focus to its toggle", async () => {
  await openStoryChangesOnPhone();
  const files = fileLayout();
  await files.toggle.click();
  await files.showsFiles(true);

  await userEvent.keyboard("{Escape}");
  await files.showsFiles(false);
  await expect.element(files.toggle).toHaveFocus();
  await files.showsFullReader();
});

test("on a phone, Project Intent without a selected file starts with its reader and Files dismisses before the page acts", async () => {
  await openIntentFileLayout({
    viewport: { width: 390, height: 844 },
    selected: false,
  });
  const files = fileLayout();
  const candidates = projectView("Optimization Candidates");
  await files.showsFiles(false);
  await files.showsFullReader();

  await files.toggle.click();
  await files.showsFiles(true);
  await files.showsFullReader();
  const drawer = document.getElementById(
    files.toggle.element().getAttribute("aria-controls") ?? "",
  );
  const beyond = (drawer?.getBoundingClientRect().right ?? 0) + 10;
  await clickAt({ x: beyond, y: center(files.toggle.element()).y + 200 });
  await files.showsFiles(false);
  await expect.element(candidates).toHaveAttribute("aria-selected", "false");
  await files.toggle.click();
  await files.toggle.click();
  await files.showsFiles(false);
  await candidates.click();
  await expect.element(candidates).toHaveAttribute("aria-selected", "true");
});

test("docked at a wide window, Files stays beside the reader while a page control works", async () => {
  await openIntentFileLayout({
    viewport: { width: 1280, height: 720 },
    selected: false,
  });
  const files = fileLayout();
  const candidates = projectView("Optimization Candidates");
  const status = projectView("CI status");
  await files.showsFiles(true);
  await candidates.click();
  await expect.element(candidates).toHaveAttribute("aria-selected", "true");
  await status.click();
  await files.showsFiles(true);
  expect(files.reading().left).toBeGreaterThan(files.browser().left + 100);
});
