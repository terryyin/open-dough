import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  enableSettingsTouch,
  touchAt,
} from "../configuration/system-settings-browser.ts";
import { center } from "../navigation/board-reading-page.ts";
import { sessions as sessionsButton } from "../navigation/dashboard-header-reading.ts";
import { scopeName, scopeToggle } from "./intent-browser-page.ts";
import {
  deepFile,
  openIntentFileLayout,
} from "./intent-file-layout-fixture.ts";
import { fileLayout, projectView } from "./intent-file-layout-page.ts";
import {
  showsSummaryPath,
  summaryRegion,
} from "./intent-summary-proof-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const clickAt = (point: { x: number; y: number }) =>
  userEvent.click(page.elementLocator(document.body), { position: point });

async function openStoryOnPhone() {
  await openIntentFileLayout({ viewport: { width: 390, height: 844 } });
  return intentStoryCompare();
}

type Story = ReturnType<typeof intentStoryCompare>;

// The story header's review-details eye, a page control beyond the open
// Files drawer, which lies over the browser below that header.
function eyeBeyondDrawer(story: Story, files: ReturnType<typeof fileLayout>) {
  const drawer = document.getElementById(
    files.toggle.element().getAttribute("aria-controls") ?? "",
  );
  const eye = center(story.detailsEye(false).element());
  expect(
    eye.x > (drawer?.getBoundingClientRect().right ?? 0) ||
      eye.y < (drawer?.getBoundingClientRect().top ?? 0),
  ).toBe(true);
  return eye;
}

async function expectDetailsShown(story: Story, shown: boolean) {
  await expect
    .element(story.detailsEye(shown))
    .toHaveAttribute("aria-expanded", String(shown));
}

test("on a phone, Files opens over the full story reader and an outside click closes it before the page acts", async () => {
  const story = await openStoryOnPhone();
  const files = fileLayout();
  await files.showsFiles(false);
  await files.showsFullReader();

  await files.toggle.click();
  await files.showsFiles(true);
  await files.showsFullReader();
  const eye = eyeBeyondDrawer(story, files);
  await clickAt(eye);
  await files.showsFiles(false);
  await expectDetailsShown(story, false);

  await clickAt(eye);
  await expectDetailsShown(story, true);
});

test("on a phone, expanding a folder keeps the Files drawer open, choosing a file exposes its reading and Files reopens to the same browsing place", async () => {
  const story = await openStoryOnPhone();
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
  await openStoryOnPhone();
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

test("on a phone, a native tap beyond the Files drawer closes it without acting on the control under it, and the next tap does", async () => {
  await enableSettingsTouch();
  const story = await openStoryOnPhone();
  const files = fileLayout();
  await files.toggle.click();
  await files.showsFiles(true);
  const eye = eyeBeyondDrawer(story, files);

  await touchAt(eye.x, eye.y);
  await files.showsFiles(false);
  await expectDetailsShown(story, false);

  await touchAt(eye.x, eye.y);
  await expectDetailsShown(story, true);
});

test("on a phone, the Sessions shortcut over an open Files drawer leaves one drawer, which one outside tap dismisses", async () => {
  await enableSettingsTouch();
  await openStoryOnPhone();
  const files = fileLayout();
  await files.toggle.click();
  await files.showsFiles(true);

  await userEvent.keyboard("{Meta>}b{/Meta}");
  await expect.element(sessionsButton).toHaveAttribute("aria-expanded", "true");
  await files.showsFiles(false);
  expect(
    [...document.querySelectorAll(".sidebar-drawer-backdrop")].filter(
      (backdrop) => getComputedStyle(backdrop).display !== "none",
    ),
  ).toHaveLength(1);

  const sidebarEdge = page
    .getByRole("complementary", { name: "Sessions sidebar" })
    .element()
    .getBoundingClientRect().right;
  await touchAt(sidebarEdge + 10, center(files.toggle.element()).y);
  await expect
    .element(sessionsButton)
    .toHaveAttribute("aria-expanded", "false");
  await files.showsFiles(false);
});

for (const selected of [false, true]) {
  for (const width of [390, 1280]) {
    test(`${selected ? "story" : "Project Intent"} opens folder Summary at ${width}px`, async () => {
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
}
