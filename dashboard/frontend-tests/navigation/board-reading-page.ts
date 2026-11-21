import { expect, onTestFinished } from "vitest";
import { page, userEvent } from "vitest/browser";
import { browserSession } from "../review/browser-session.ts";

export const columns = ["Backlog", "Taken", "Recently done"] as const;
type Column = (typeof columns)[number];

const scroll = () =>
  page.getByRole("main").element().closest(".board-scroll") as HTMLElement;
const rect = (element: Element) => element.getBoundingClientRect();
const board = page.getByRole("region", { name: "Board", exact: true });
const column = (name: Column) =>
  board.getByRole("region", { name, exact: true });
const pagingControlName = (destination: string) =>
  new RegExp(`^${destination} (\\d+ entr(?:y|ies)|Entry count incomplete)$`);
const control = (destination: Column) =>
  board.getByRole("button", {
    name: pagingControlName(destination),
  });
const pagingControls = () =>
  board
    .getByRole("button", {
      name: pagingControlName(`(?:${columns.join("|")})`),
    })
    .elements();

function view() {
  const surface = board.element().querySelector(".board-view");
  if (surface === null) throw new Error("The Board has no column view.");
  return surface;
}

function shownAs(view: DOMRect, part: DOMRect) {
  if (part.left >= view.left - 0.5 && part.right <= view.right + 0.5)
    return "whole";
  if (part.right <= view.left + 0.5 || part.left >= view.right - 0.5)
    return "outside";
  return "clipped";
}

async function shows(shown: readonly Column[], controls: readonly string[]) {
  await expect
    .poll(() => {
      const surface = rect(view());
      return columns.map((name) =>
        shownAs(surface, rect(column(name).element())),
      );
    })
    .toEqual(
      columns.map((name) => (shown.includes(name) ? "whole" : "outside")),
    );
  await expect
    .poll(() =>
      pagingControls().map(
        (element) =>
          element.getAttribute("aria-label") ?? element.textContent.trim(),
      ),
    )
    .toEqual(controls);
  const surface = rect(view());
  const boxes = shown.map((name) => rect(column(name).element()));
  const first = boxes[0];
  const last = boxes.at(-1);
  if (first === undefined || last === undefined)
    throw new Error("Expected the Board to show a column.");
  expect(last.right - first.left).toBeCloseTo(surface.width, 0);
  for (const box of boxes) expect(box.width).toBeCloseTo(first.width, 0);
  expect(scroll().scrollWidth).toBe(scroll().clientWidth);
  expect(document.documentElement.scrollWidth).toBe(
    document.documentElement.clientWidth,
  );
}

const endOf = (element: Element) =>
  rect(element).bottom - rect(scroll()).top + scroll().scrollTop;
const bottom = () => scroll().scrollHeight - scroll().clientHeight;
const position = () => scroll().scrollTop;

export function pointInBrowser({ x, y }: { x: number; y: number }) {
  const frame = window.frameElement?.getBoundingClientRect();
  return { x: x + (frame?.left ?? 0), y: y + (frame?.top ?? 0) };
}

export function center(element: Element) {
  const bounds = rect(element);
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  };
}

// Press the control where it is already visible. Locator clicks may scroll
// a sticky target again to accommodate the scroll region's padding.
async function pressWhereShown(destination: Column) {
  const button = control(destination).element();
  expect(inReadingRoom(button)).toBe(true);
  const point = pointInBrowser(center(button));
  await browserSession().send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    button: "left",
    clickCount: 1,
    ...point,
  });
  await browserSession().send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    button: "left",
    clickCount: 1,
    ...point,
  });
}

async function wheelTo(target: number) {
  const difference = target - position();
  if (difference === 0) return;
  await userEvent.wheel(scroll(), { delta: { y: difference } });
  await expect.poll(position).toBe(target);
}

async function endsWith(shown: readonly Column[]) {
  await wheelTo(bottom());
  const end = Math.max(
    ...shown.map((name) => endOf(column(name).element())),
    ...pagingControls().map(endOf),
  );
  const extent = scroll().scrollHeight;
  // A short column can leave the rest of the viewport empty. The Board
  // must never add scroll range beyond its shown content and framing.
  expect(extent).toBeGreaterThanOrEqual(end);
  expect(extent).toBeLessThanOrEqual(Math.max(scroll().clientHeight, end + 48));
}

function inReadingRoom(element: Element) {
  const area = rect(scroll());
  const part = rect(element);
  return (
    part.top >= area.top &&
    part.bottom <= area.bottom &&
    part.left >= area.left &&
    part.right <= area.right
  );
}

function observeSlides() {
  const slides: string[] = [];
  const record = (event: TransitionEvent) => {
    if (
      event.propertyName === "transform" &&
      event.target instanceof Element &&
      event.target.matches(".board-row")
    )
      slides.push(event.propertyName);
  };
  document.addEventListener("transitionrun", record);
  onTestFinished(() => {
    document.removeEventListener("transitionrun", record);
  });
  return slides;
}

export const boardReading = {
  column,
  control,
  view,
  width: () => rect(board.element()).width,
  pressWhereShown,
  shows,
  wheelTo,
  endsWith,
  position,
  bottom,
  extent: () => scroll().scrollHeight,
  room: () => rect(scroll()),
  endOf,
  inReadingRoom,
  observeSlides,
};
