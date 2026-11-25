// The banner's Recent stories control as a reader operates it in Intent: the
// selected story's header link to Project Intent, the button and its list of
// remembered rows, and what Intent then shows: the selected story, its view's
// start readable, the Intent perspective chosen and the story reference
// notice.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { PublishedSource } from "../../src/publishedSource.ts";
import {
  popover,
  recent as button,
  recentChoice,
  showsBookmark,
  showsHistory,
} from "../navigation/recent-stories-frame.ts";

const intent = page.getByRole("main", { name: "Intent", exact: true });
const notice = page.getByRole("status", { name: "Story reference navigation" });
// The selected story's header link to Project Intent, and Project Intent's
// way back to the story.
const story = intent.getByRole("region", {
  name: "Selected story",
  exact: true,
});
export const projectIntentLink = story.getByRole("button", {
  name: "Project Intent",
  exact: true,
});
export const backToStory = intent.getByRole("button", {
  name: "Back to selected story",
  exact: true,
});

export const storyHeading = story.getByRole("heading", { level: 2 });

export function intentScroll() {
  const scroll = intent.element().closest<HTMLElement>(".intent-scroll");
  if (scroll === null) throw new Error("Expected Intent's reading region.");
  return scroll;
}

export const storyHeadingIsReadable = () => {
  const heading = storyHeading.query()?.getBoundingClientRect();
  const room = intentScroll().getBoundingClientRect();
  return (
    heading !== undefined &&
    heading.top >= room.top &&
    heading.bottom <= room.bottom
  );
};

// Every remembered row is in `project`.
export function intentRecentStories(project: PublishedSource) {
  const recent = {
    async openProjectIntent() {
      await userEvent.click(projectIntentLink);
      await expect
        .element(intent.getByRole("heading", { name: "Project Intent" }))
        .toBeVisible();
    },
    // Clicks the button, which returns to a selected story out of view and
    // otherwise toggles the list.
    choose: () => userEvent.click(button),
    async chooseRow(identity: string, source = project) {
      if (popover.query() === null) await userEvent.click(button);
      await userEvent.click(recentChoice(source.label, identity));
      await expect.element(popover).not.toBeInTheDocument();
    },
    // The list, opened from the button, holds these rows in order.
    async lists(expected: readonly { identity: string; checked: boolean }[]) {
      if (popover.query() === null) await userEvent.click(button);
      await showsHistory(
        expected.map(({ identity, checked }) => [
          project.label,
          identity,
          checked,
        ]),
      );
    },
    async selects(identity: string) {
      await expect
        .element(intent)
        .toHaveAttribute("data-selected-story", identity);
    },
    // Intent stays shown and the chosen perspective.
    async intentStays() {
      await expect.element(intent).toBeVisible();
      await expect
        .element(page.getByRole("radio", { name: "Intent", exact: true }))
        .toBeChecked();
    },
    // Intent shows the story's own view, from its start, with the list closed.
    async showsStoryFromStart(identity: string) {
      await recent.selects(identity);
      await recent.intentStays();
      await expect.element(backToStory).not.toBeInTheDocument();
      await expect.element(popover).not.toBeInTheDocument();
      await expect.poll(storyHeadingIsReadable).toBe(true);
    },
    // The button names the selected story and fills its bookmark, or names
    // none with an outline.
    isLabelled: showsBookmark,
    noticeText: () => notice.element().textContent,
  };
  return recent;
}
