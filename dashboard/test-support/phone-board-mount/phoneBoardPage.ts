import { act } from "react";
import { expect, vi } from "vitest";
import { dispatchBoardTouch } from "../phoneBoardTouch.ts";
import { phoneBoardStoryCard } from "./phoneBoardStoryCard.ts";

type Column = "Backlog" | "Taken" | "Recently done";
const columnNames: readonly Column[] = ["Backlog", "Taken", "Recently done"];
const from = { x: 195, y: 260 };
type Direction = "left" | "right";

function get(root: ParentNode, selector: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error(`Expected ${selector}`);
  return element;
}

export function phoneBoardPage(
  container: HTMLElement,
  titles: { backlog: readonly string[]; taken: readonly string[] },
) {
  const view = () => get(container, ".board-view");
  const row = () => get(container, ".board-row");
  const scroll = () => get(container, ".board-scroll");
  const controls = () => [
    ...container.querySelectorAll<HTMLButtonElement>(".column-paging-control"),
  ];
  const column = (name: Column) => {
    const sections = [...row().querySelectorAll<HTMLElement>("[data-column]")];
    const region = sections.find(
      (section) => section.querySelector("h2")?.textContent === name,
    );
    if (region === undefined) throw new Error(`Expected column ${name}`);
    return region;
  };
  const indicator = (destination: Column) => {
    const control = controls().find(
      (button) =>
        button.querySelector(".column-paging-control-name")?.textContent ===
        destination,
    );
    if (control === undefined)
      throw new Error(`Expected indicator for ${destination}`);
    return control;
  };
  const finishSlide = () => {
    const slidingRow = row();
    if (!slidingRow.hasAttribute("data-sliding")) return;
    act(() => {
      slidingRow.dispatchEvent(
        new TransitionEvent("transitionend", {
          bubbles: true,
          propertyName: "transform",
        }),
      );
    });
  };
  const click = (target: HTMLElement, detail: number) => {
    act(() => {
      target.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, detail }),
      );
    });
  };
  const tap = (target: HTMLElement) => {
    dispatchBoardTouch(target, { from, to: from });
    click(target, 1);
  };
  const stroke = (
    direction: Direction,
    {
      distance = 180,
      cancel,
      target = view(),
      compatibilityClick = false,
      finish = true,
    }: {
      distance?: number;
      cancel?: boolean;
      target?: HTMLElement;
      compatibilityClick?: boolean;
      finish?: boolean;
    } = {},
  ) => {
    const to = {
      ...from,
      x: from.x + (direction === "left" ? -distance : distance),
    };
    act(() => {
      dispatchBoardTouch(target, { from, to, ...(cancel && { cancel }) });
    });
    if (compatibilityClick) click(target, 1);
    if (finish) finishSlide();
  };
  const showsDestination = (
    shown: readonly Column[],
    destinations: readonly string[],
  ) => {
    expect(controls().map((button) => button.textContent.trim())).toEqual(
      destinations,
    );
    expect(row().hasAttribute("data-sliding")).toBe(false);
    const hidden = (row().getAttribute("data-hidden") ?? "").split(" ");
    expect(
      columnNames.filter(
        (name) => !hidden.includes(String(columnNames.indexOf(name) + 1)),
      ),
    ).toEqual(shown);
  };
  const showsColumns = (
    shown: readonly Column[],
    destinations: readonly string[],
  ) => {
    showsDestination(shown, destinations);
    const bounds = view().getBoundingClientRect();
    const headings = new Map(
      [...row().querySelectorAll<HTMLElement>("[data-column]")].map(
        (region) => {
          const heading = get(region, "h2");
          return [heading.textContent, { region, heading }] as const;
        },
      ),
    );
    const visible: DOMRect[] = [];
    for (const name of columnNames) {
      const part = headings.get(name);
      if (part === undefined) throw new Error(`Expected column ${name}`);
      const { region, heading } = part;
      const rect = region.getBoundingClientRect();
      if (shown.includes(name)) {
        expect(rect.left, name).toBeGreaterThanOrEqual(bounds.left - 0.5);
        expect(rect.right, name).toBeLessThanOrEqual(bounds.right + 0.5);
        expect(heading.getBoundingClientRect().height, name).toBeGreaterThan(0);
        visible.push(rect);
      } else {
        expect(
          rect.right <= bounds.left + 0.5 || rect.left >= bounds.right - 0.5,
          name,
        ).toBe(true);
      }
    }
    expect(visible).toHaveLength(shown.length);
    const first = visible[0];
    const last = visible.at(-1);
    if (first && last)
      expect(last.right - first.left).toBeGreaterThanOrEqual(bounds.width - 1);
    expect(scroll().scrollWidth).toBeLessThanOrEqual(scroll().clientWidth);
  };
  return {
    showsPublishedStories() {
      for (const [name, expected] of [
        ["Backlog", titles.backlog],
        ["Taken", titles.taken],
      ] as const) {
        expect(
          [...column(name).querySelectorAll("article[aria-label]")].map(
            (card) => card.getAttribute("aria-label"),
          ),
        ).toEqual(expected);
      }
    },
    swipe: stroke,
    showsColumn: (name: Column, destinations: readonly string[]) => {
      showsDestination([name], destinations);
    },
    showsPhoneColumn: (name: Column, destinations: readonly string[]) => {
      showsColumns([name], destinations);
    },
    showsPhone: showsColumns,
    columnReadingRoom(name: Column) {
      return {
        board: get(container, ".board").getBoundingClientRect().width,
        view: view().getBoundingClientRect().width,
        card: get(column(name), "article.story-card").getBoundingClientRect()
          .width,
        controlWidths: controls().map(
          (button) => button.getBoundingClientRect().width,
        ),
      };
    },
    tapIndicator(destination: Column) {
      const control = indicator(destination);
      const { x, y, width, height } = control.getBoundingClientRect();
      expect(
        control.contains(
          document.elementFromPoint(x + width / 2, y + height / 2),
        ),
      ).toBe(true);
      click(control, 1);
      finishSlide();
    },
    focusIndicator(destination: Column) {
      act(() => {
        indicator(destination).focus();
      });
    },
    indicatorFocused(destination: Column) {
      const control = indicator(destination);
      expect(document.activeElement).toBe(control);
      expect(control.tagName).toBe("BUTTON");
      expect(control.disabled).toBe(false);
    },
    activateIndicator(destination: Column) {
      const control = indicator(destination);
      expect(document.activeElement).toBe(control);
      click(control, 0);
      finishSlide();
    },
    scrollY: () => scroll().scrollTop,
    readVertically(distance: number) {
      const gesture = dispatchBoardTouch(view(), {
        from,
        to: { ...from, y: from.y - distance },
      });
      expect(gesture).toEqual({ moveAccepted: true, endAccepted: true });
      expect(getComputedStyle(view()).touchAction).toContain("pan-y");
      expect(
        scroll().scrollHeight - scroll().clientHeight,
      ).toBeGreaterThanOrEqual(distance);
      act(() => {
        scroll().scrollTop += distance;
      });
    },
    showsNoLaunchDialog() {
      expect(container.querySelector("dialog[open], [role=dialog]")).toBeNull();
    },
    prefersReducedMotion: () =>
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    isSliding: () => row().hasAttribute("data-sliding"),
    showsSlidingColumn() {
      const slidingRow = row();
      expect(slidingRow.hasAttribute("data-sliding")).toBe(true);
      expect(getComputedStyle(slidingRow).transitionProperty).toBe("transform");
    },
    finishSlide,
    storyCard(title: string) {
      const swipeFrom = (target: HTMLElement, direction: Direction) => {
        const clock = vi.spyOn(performance, "now").mockReturnValue(1000);
        try {
          stroke(direction, { target, compatibilityClick: true });
        } finally {
          clock.mockRestore();
        }
      };
      return phoneBoardStoryCard(() => column("Backlog"), title, {
        swipeFrom,
        tap,
      });
    },
  };
}
