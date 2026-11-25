import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  touchAt,
  enableSettingsTouch,
} from "../configuration/system-settings-browser.ts";
import { center } from "../navigation/board-reading-page.ts";
import {
  recentStories,
  sessions as sessionsButton,
} from "../navigation/dashboard-header-reading.ts";
import { openIntentFileLayout } from "./intent-file-layout-fixture.ts";
import { fileLayout } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const sessionsSidebar = page.getByRole("complementary", {
  name: "Sessions sidebar",
});

type Files = ReturnType<typeof fileLayout>;

async function openFilesLayout(viewport: { width: number; height: number }) {
  await openIntentFileLayout({ viewport });
  await intentStoryCompare().chooseTab("Changes");
  const files = fileLayout();
  await expect.element(files.toggle).toBeVisible();
  return files;
}

async function openSessionsOverFiles(files: Files) {
  await sessionsButton.click();
  await expect.element(sessionsSidebar).toBeVisible();
  await expect.element(sessionsButton).toHaveAttribute("aria-expanded", "true");
  const edge = sessionsSidebar.element().getBoundingClientRect().right;
  const target = center(files.toggle.element());
  expect(target.x).toBeGreaterThan(edge);
  return target;
}

async function closedWithFilesUnchanged(files: Files, shown: boolean) {
  await expect.element(sessionsSidebar).not.toBeInTheDocument();
  await expect
    .element(sessionsButton)
    .toHaveAttribute("aria-expanded", "false");
  await files.showsFiles(shown);
}

test("over a phone page, a click beyond the Sessions sidebar closes it without toggling Files, and the next click does", async () => {
  const files = await openFilesLayout({ width: 390, height: 844 });
  const shown = files.shown();
  const target = await openSessionsOverFiles(files);

  await userEvent.click(page.elementLocator(document.body), {
    position: target,
  });
  await closedWithFilesUnchanged(files, shown);

  await files.toggle.click();
  await files.showsFiles(!shown);
});

test("over a phone page, a native tap beyond the Sessions sidebar closes it without toggling Files, and the next tap does", async () => {
  await enableSettingsTouch();
  const files = await openFilesLayout({ width: 390, height: 844 });
  const shown = files.shown();
  const target = await openSessionsOverFiles(files);

  await touchAt(target.x, target.y);
  await closedWithFilesUnchanged(files, shown);

  await touchAt(target.x, target.y);
  await files.showsFiles(!shown);
});

test("Escape closes the Sessions sidebar over the page and returns focus to the Sessions button, which reopens it", async () => {
  const files = await openFilesLayout({ width: 390, height: 844 });
  const shown = files.shown();
  await openSessionsOverFiles(files);
  (sessionsSidebar.element().querySelector("button") as HTMLElement).focus();

  await userEvent.keyboard("{Escape}");
  await closedWithFilesUnchanged(files, shown);
  await expect.element(sessionsButton).toHaveFocus();

  await userEvent.keyboard("{Enter}");
  await expect.element(sessionsSidebar).toBeVisible();
});

test("beside a wide page, the Sessions sidebar stays open and keeps focus while the page's Files control works", async () => {
  const files = await openFilesLayout({ width: 1280, height: 800 });
  await files.showsFiles(true);
  await sessionsButton.click();
  await expect.element(sessionsSidebar).toBeVisible();

  await files.toggle.click();
  await files.showsFiles(false);
  await expect.element(sessionsSidebar).toBeVisible();
  await expect.element(files.toggle).toHaveFocus();
});

const recentStoriesPopover = page.getByRole("dialog", {
  name: "Recent stories",
});

test("over a phone page, a click and then a native tap on another banner control close Sessions without opening that control", async () => {
  await enableSettingsTouch();
  const files = await openFilesLayout({ width: 390, height: 844 });
  const shown = files.shown();

  await openSessionsOverFiles(files);
  await userEvent.click(page.elementLocator(document.body), {
    position: center(recentStories.element()),
  });
  await closedWithFilesUnchanged(files, shown);
  await expect.element(recentStoriesPopover).not.toBeInTheDocument();

  await openSessionsOverFiles(files);
  const target = center(recentStories.element());
  await touchAt(target.x, target.y);
  await closedWithFilesUnchanged(files, shown);
  await expect.element(recentStoriesPopover).not.toBeInTheDocument();
});

test("over a phone page, Tab and Shift+Tab wrap within the open Sessions sidebar and its Sessions button", async () => {
  const files = await openFilesLayout({ width: 390, height: 844 });
  await openSessionsOverFiles(files);
  const inside = [
    ...sessionsSidebar
      .element()
      .querySelectorAll<HTMLElement>("button, a[href], summary"),
  ].filter((element) => element.getClientRects().length > 0);
  const last = inside.at(-1);
  if (last === undefined) throw new Error("The sidebar has no controls");

  last.focus();
  await userEvent.tab();
  await expect.element(sessionsButton).toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect.poll(() => document.activeElement).toBe(last);
  for (let step = 0; step <= inside.length; step += 1) {
    await userEvent.tab();
    const focused = document.activeElement;
    expect(
      focused === sessionsButton.element() ||
        sessionsSidebar.element().contains(focused),
    ).toBe(true);
  }

  await userEvent.keyboard("{Escape}");
  await expect.element(sessionsButton).toHaveFocus();
  await userEvent.tab();
  expect(sessionsSidebar.query()).toBeNull();
  expect(document.activeElement).not.toBe(sessionsButton.element());
});
