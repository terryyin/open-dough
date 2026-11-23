import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { center, pointInBrowser } from "../navigation/board-reading-page.ts";
import { tapWhereShown } from "../navigation/board-touch-page.ts";
import { browserSession } from "../review/browser-session.ts";
import { card } from "./session-card-page.ts";

export const panel = page.getByRole("region", { name: "Final report" });
export const reportText = (text: string) =>
  panel.getByText(text, { exact: true });
export const reportScroll = () => reportPart(".final-report-scroll");
export const mark = panel
  .getByRole("button", { name: "Mark as done", exact: true })
  .first();

function reportPart(selector: string) {
  const part = panel.element().querySelector(selector);
  if (!part) throw new Error(`Missing final report part: ${selector}`);
  return part;
}

export async function expectReportText(text: string) {
  const body = reportText(text);
  await expect.element(body).toBeInTheDocument();
  expect(body.element().textContent).toBe(text);
}

export function expectNoPrivateSessionId() {
  expect(reportPart(".side-panel-names").querySelector("code")).toBeNull();
}

export function expectReportSessionName() {
  expect(
    reportPart(".side-panel-names").querySelector("p")?.textContent,
  ).toMatch(/ session$/);
  expectNoPrivateSessionId();
}
export const close = panel.getByRole("button", { name: "Close", exact: true });
export const question = panel.getByRole("group", {
  name: "This session reported unfinished work. Mark it done anyway?",
  exact: true,
});
export const questionText = question.getByText(
  "This session reported unfinished work. Mark it done anyway?",
  { exact: true },
);
export const markAnyway = question.getByRole("button", {
  name: "Mark as done",
});
export const keep = question.getByRole("button", { name: "Keep open" });
export const reportOpener = card.getByRole("button", {
  name: "Read final report",
  exact: true,
});
export const divider = panel.getByRole("separator", { name: "Panel divider" });

export async function openReport(opener: Locator = reportOpener) {
  await userEvent.click(opener);
  await expect.element(panel).toBeInTheDocument();
}

function lineBoxes(element: Element, words: string) {
  const source = element.firstChild;
  const start = source?.textContent?.indexOf(words) ?? -1;
  if (!source || start < 0) throw new Error("Missing report words.");
  const range = document.createRange();
  range.setStart(source, start);
  range.setEnd(source, start + words.length);
  return [...range.getClientRects()];
}

function reportBounds(element: Element) {
  const report = panel.element().getBoundingClientRect();
  let left = Math.max(0, report.left);
  let right = Math.min(innerWidth, report.right);
  let top = Math.max(0, report.top);
  let bottom = Math.min(innerHeight, report.bottom);
  for (
    let ancestor = element.parentElement;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(ancestor);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const bounds = ancestor.getBoundingClientRect();
    if (overflowX !== "visible") {
      left = Math.max(left, bounds.left);
      right = Math.min(right, bounds.right);
    }
    if (overflowY !== "visible") {
      top = Math.max(top, bounds.top);
      bottom = Math.min(bottom, bounds.bottom);
    }
  }
  return { left, right, top, bottom };
}

export function reportGeometry(target: Locator, words?: string) {
  const element = target.element();
  const boxes =
    words === undefined
      ? [element.getBoundingClientRect()]
      : lineBoxes(element, words);
  const clip = reportBounds(element);
  return {
    visible:
      boxes.length > 0 &&
      boxes.every(
        (box) =>
          box.height > 0 &&
          box.top >= clip.top - 1 &&
          box.bottom <= clip.bottom + 1 &&
          box.left >= clip.left - 1 &&
          box.right <= clip.right + 1,
      ),
    hit:
      boxes.length > 0 &&
      boxes.every((box) =>
        element.contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          ),
        ),
      ),
    movement:
      (Math.min(...boxes.map((box) => box.top)) +
        Math.max(...boxes.map((box) => box.bottom)) -
        clip.top -
        clip.bottom) /
      2,
  };
}

async function swipeReport(distance: number) {
  const bounds = reportScroll().getBoundingClientRect();
  const amount = Math.min(
    Math.max(Math.abs(distance) + 12, 26),
    bounds.height - 28,
  );
  const movement = Math.sign(distance) * amount;
  const edge = movement > 0 ? bounds.bottom - 14 : bounds.top + 14;
  const point = (offset: number) =>
    pointInBrowser({ x: bounds.x + bounds.width / 2, y: edge - offset });
  const session = browserSession();
  const timestamp = Date.now() / 1000 - 0.6;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point(0)],
    timestamp,
  });
  for (const fraction of [0.35, 0.7, 1]) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [point(movement * fraction)],
      timestamp: timestamp + fraction * 0.25,
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
    timestamp: timestamp + 0.45,
  });
}

export async function readByTouch(target: Locator, words?: string) {
  let shown = reportGeometry(target, words);
  const scroll = reportScroll();
  for (
    let attempt = 0;
    attempt < 10 && (!shown.visible || !shown.hit);
    attempt += 1
  ) {
    if (Math.abs(shown.movement) < 1) break;
    const before = scroll.scrollTop;
    await swipeReport(shown.movement);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
    shown = reportGeometry(target, words);
    if (scroll.scrollTop === before) break;
  }
  expect(shown).toMatchObject({ visible: true, hit: true });
}

export async function touchReport(target: Locator) {
  await readByTouch(target);
  await tapWhereShown(target.element());
}

async function mouse(
  type: "mousePressed" | "mouseMoved" | "mouseReleased",
  x: number,
  y: number,
) {
  await browserSession().send("Input.dispatchMouseEvent", {
    type,
    ...pointInBrowser({ x, y }),
    button: "left",
    buttons: type === "mouseReleased" ? 0 : 1,
    clickCount: 1,
  });
}

export async function pressReport(target: Locator) {
  expect(reportGeometry(target)).toMatchObject({ visible: true, hit: true });
  const { x, y } = center(target.element());
  await mouse("mousePressed", x, y);
  await mouse("mouseReleased", x, y);
}

export function dividerHit(fraction: number) {
  const element = divider.element();
  const rect = element.getBoundingClientRect();
  return element.contains(
    document.elementFromPoint(
      rect.x + rect.width * fraction,
      rect.y + rect.height / 2,
    ),
  );
}

export async function widenReport(by: number) {
  const { x, y } = center(divider.element());
  expect(dividerHit(0.5)).toBe(true);
  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x - by, y);
  await mouse("mouseReleased", x - by, y);
}

export async function showReportAt(width: number, height: number) {
  await page.viewport(width, height);
  const covering = width <= 800;
  await expect
    .poll(() => {
      const frame = panel.element().closest(".page-frame");
      const report = panel.element().getBoundingClientRect();
      return (
        frame?.classList.contains("page-covering") === covering &&
        Math.abs(report.height - height) < 1
      );
    })
    .toBe(true);
}
