import { expect } from "vitest";

export function phoneBoardStoryCard(
  backlog: () => HTMLElement,
  title: string,
  {
    swipeFrom,
    tap,
  }: {
    swipeFrom: (target: HTMLElement, direction: "left" | "right") => void;
    tap: (target: HTMLElement) => void;
  },
) {
  const card = () => {
    const story = backlog().querySelector<HTMLElement>(
      `article[aria-label="${CSS.escape(title)}"]`,
    );
    if (story === null) throw new Error(`Expected story ${title}`);
    return story;
  };
  const part = (selector: string) => {
    const element = card().querySelector<HTMLElement>(selector);
    if (element === null) throw new Error(`Expected ${selector} on ${title}`);
    return element;
  };
  const heading = () => part("h3");
  const inspect = () => part(".inspect-story");
  const start = () => {
    const button = [...card().querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "Start execution",
    );
    if (button === undefined)
      throw new Error(`Expected Start execution on ${title}`);
    return button;
  };
  return {
    swipeFromCard: (direction: "left" | "right") => {
      swipeFrom(heading(), direction);
    },
    swipeFromStart: (direction: "left" | "right") => {
      swipeFrom(start(), direction);
    },
    showsSelected(selected: boolean) {
      const story = card();
      expect(story.classList.contains("story-card-selected")).toBe(selected);
      if (!selected) return;
      const probe = document.createElement("span");
      probe.style.backgroundColor = "var(--accent-soft)";
      story.append(probe);
      try {
        const style = getComputedStyle(story);
        expect(style.boxShadow).toMatch(/inset/);
        expect(style.backgroundColor).toBe(
          getComputedStyle(probe).backgroundColor,
        );
      } finally {
        probe.remove();
      }
    },
    showsInspected(inspected: boolean) {
      expect(inspect().getAttribute("aria-expanded")).toBe(String(inspected));
      expect(
        card().querySelector('section[aria-label^="Detail for "]') !== null,
      ).toBe(inspected);
    },
    tapInspect: () => {
      tap(inspect());
    },
    tapEmptyArea: () => {
      tap(heading());
    },
  };
}
