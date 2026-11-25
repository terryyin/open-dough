import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { recentStoriesKey } from "../../src/recentStories.ts";
import { withFramePreference } from "../../test-support/component-mount/framePreferences.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardReading, storyCard } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";
import { focus, projectRadio } from "./project-navigation-frame.ts";
import {
  popover,
  recent,
  recentChoice,
  selectCard,
  showsBookmark,
  showsEmptyHistory,
  showsHistory,
  showsRevealed,
  wholeProject,
} from "./recent-stories-frame.ts";
import { controlDestinationCueTime } from "./story-destination-cue.ts";

const viewport = { width: 1280, height: 800 };

test("Whole project is available from the keyboard even with no recent stories", async () => {
  withFramePreference(recentStoriesKey, null);
  const work = boardWork([], { taken: [] });
  await mountBoardFrame(work, viewport);
  focus(recent);
  await userEvent.keyboard("{Enter}{Tab}");
  await showsEmptyHistory();
  await expect.element(wholeProject).toHaveFocus();

  await userEvent.keyboard("{Enter}");

  await expect.element(popover).not.toBeInTheDocument();
  await expect.element(recent).toHaveFocus();
  await expect.element(projectRadio(work.source.label)).toBeChecked();
});

test("the keyboard can clear the Board to Whole project and reselect an ordered recent", async () => {
  withFramePreference(recentStoriesKey, null);
  controlDestinationCueTime();
  const first = story("First story read from the Board", 936);
  const latest = story("Latest story read from the Board", 937);
  const work = boardWork([first, latest], { taken: [] });
  const { id, label } = work.source;
  await mountBoardFrame(work, viewport);
  await selectCard(first.title);
  await selectCard(latest.title);
  focus(recent);
  await userEvent.keyboard("{Enter}{Tab}");
  await expect.element(wholeProject).toHaveFocus();
  await expect.element(wholeProject).not.toHaveAttribute("aria-current");
  await showsHistory([
    [label, latest.identity, true],
    [label, first.identity, false],
  ]);

  await userEvent.keyboard("{Enter}");

  await showsBookmark();
  await expect.element(recent).toHaveFocus();
  await boardReading.expectStorySelection(storyCard(latest.title), false);
  await expect.element(projectRadio(label)).toBeChecked();
  await expect
    .element(page.getByRole("radio", { name: "Development", exact: true }))
    .toBeChecked();
  expect(JSON.parse(localStorage.getItem(recentStoriesKey) ?? "null")).toEqual([
    { project: id, identity: latest.identity },
    { project: id, identity: first.identity },
  ]);

  await userEvent.keyboard("{Enter}{Tab}{Tab}");
  await expect.element(wholeProject).toHaveAttribute("aria-current", "true");
  await showsHistory([
    [label, latest.identity, false],
    [label, first.identity, false],
  ]);
  await expect.element(recentChoice(label, latest.identity)).toHaveFocus();

  await userEvent.keyboard("{Enter}");

  await expect.element(popover).not.toBeInTheDocument();
  await showsBookmark(latest.identity);
  await showsRevealed(storyCard(latest.title));
});
