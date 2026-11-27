// Intent's Files drawer on a phone: what Files adds to the shared drawer
// (`../../src/SidebarDrawer.tsx`, whose dismissal and keys
// ./intent-sessions-drawer.spec.ts proves once). It starts closed over a
// full-size reader, a folder's expansion keeps it open, a reading choice
// closes it, and it reopens to the same browsing place.
import { expect, test } from "vitest";
import { scopeName, scopeToggle } from "./intent-browser-page.ts";
import {
  deepFile,
  openIntentFileLayout,
} from "./intent-file-layout-fixture.ts";
import { fileLayout } from "./intent-file-layout-page.ts";
import {
  showsSummaryPath,
  summaryRegion,
} from "./intent-summary-proof-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

test("on a phone, Files starts closed over the full reader, expanding a folder keeps it open, choosing a file exposes its reading and Files reopens to the same browsing place", async () => {
  await openIntentFileLayout({ viewport: { width: 390, height: 844 } });
  const story = intentStoryCompare();
  const files = fileLayout();
  await files.showsFiles(false);
  await files.showsFullReader();

  await files.toggle.click();
  await files.showsFiles(true);
  await files.showsFullReader();
  await expect.element(story.changesOnly).toBeChecked();
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
  await expect.element(story.changesOnly).toBeChecked();
  await expect
    .element(story.file(deepFile))
    .toHaveAttribute("aria-pressed", "true");
  const offset = await files.scrollFilesHalfway();
  await files.toggle.click();
  await files.toggle.click();
  await expect.poll(files.fileScroll).toBe(offset);
});

// A folder's Summary is a reading choice: it closes the drawer on a phone and
// leaves docked Files beside it on a wide window.
for (const { selected, width } of [
  { selected: true, width: 390 },
  { selected: false, width: 1280 },
]) {
  test(`${selected ? "story" : "Project Intent"} opens folder Summary at ${String(width)}px`, async () => {
    await openIntentFileLayout({
      viewport: { width, height: 844 },
      selected,
    });
    const files = fileLayout();
    await files.showFiles();
    const root = "dashboard/tests";
    if (!selected) await scopeToggle("dashboard").click();
    const disclosure = scopeToggle(root);
    await expect.element(disclosure).toBeVisible();
    if (disclosure.element().getAttribute("aria-expanded") === "true")
      await disclosure.click();
    await disclosure.click();
    await files.showsFiles(true);
    await scopeName(root).click();
    await files.showsFiles(width > 390);
    await showsSummaryPath(summaryRegion(), root);
    await files.showFiles();
    await scopeName("boundary").click();
    await files.showsFiles(width > 390);
    await showsSummaryPath(summaryRegion(), `${root}/boundary`);
  });
}
