// Operate the bookmark's scope choices and observe the resulting Intent view.
import { expect } from "vitest";
import { page } from "vitest/browser";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { activateButton } from "../page-objects/activateButton.ts";
import {
  popover,
  recent as button,
  recentChoice,
  showsBookmarkFill,
  showsHistory,
  wholeProject,
} from "../navigation/recent-stories-frame.ts";

const intent = page.getByRole("main", { name: "Intent", exact: true });
const notice = page.getByRole("status", { name: "Story reference navigation" });
const story = intent.getByRole("region", {
  name: "Selected story",
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

// Opens the scope choices by activation; the popover's pointer and keyboard
// behavior is proved with Recent stories. A selected story out of view is
// revealed first, so the click's commit is awaited before the next click
// opens the choices.
async function openScopeChoices() {
  if (popover.query() !== null) return;
  await activateButton(button);
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  if (popover.query() === null) {
    await expect.poll(storyHeadingIsReadable).toBe(true);
    await activateButton(button);
  }
}

export async function chooseWholeProject() {
  await openScopeChoices();
  await activateButton(wholeProject);
  await expect.element(popover).not.toBeInTheDocument();
}

export async function showsIntentBookmark(scope?: string) {
  await expect
    .element(button)
    .toHaveAccessibleName(`Recent stories, ${scope ?? "Whole project"}`);
  showsBookmarkFill(scope !== undefined);
}

// Every remembered row is in `project`.
export function intentRecentStories(project: PublishedSource) {
  const recent = {
    // Clicks the button, which returns to a selected story out of view and
    // otherwise toggles the list.
    choose: () => activateButton(button),
    async chooseRow(identity: string, source = project) {
      await openScopeChoices();
      await activateButton(recentChoice(source.label, identity));
      await expect.element(popover).not.toBeInTheDocument();
    },
    // The list, opened from the button, holds these rows in order.
    async lists(expected: readonly { identity: string; checked: boolean }[]) {
      await openScopeChoices();
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
      await expect.element(popover).not.toBeInTheDocument();
      await expect.poll(storyHeadingIsReadable).toBe(true);
    },
    noticeText: () => notice.element().textContent,
  };
  return recent;
}
