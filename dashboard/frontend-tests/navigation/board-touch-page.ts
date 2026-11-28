import { expect, onTestFinished } from "vitest";
import { emulateTouch, browserSession } from "../review/browser-session.ts";
import { boardReading, center, pointInBrowser } from "./board-reading-page.ts";

export const portrait = { width: 390, height: 844 };
export const landscape = { width: 844, height: 390 };

export async function useTouchScreen() {
  const wasTouch = matchMedia("(any-pointer: coarse)").matches;
  const session = browserSession();
  onTestFinished(async () => {
    await session.send("Emulation.setTouchEmulationEnabled", {
      enabled: wasTouch,
    });
  });
  await emulateTouch();
}

// A stroke from `from` by `dx`, `dy`, moving through each fraction of the
// distance. Every touch event waits for a rendered frame, so a stroke the
// Board recognizes from its first move takes one.
async function drag(
  from: { x: number; y: number },
  dx: number,
  dy: number,
  { cancel = false, moves = [1] }: { cancel?: boolean; moves?: number[] } = {},
) {
  const session = browserSession();
  // Space the input timestamps so a stroke reads a bounded distance.
  const timestamp = Date.now() / 1000 - 0.5;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [pointInBrowser(from)],
    timestamp,
  });
  for (const fraction of moves) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        pointInBrowser({
          x: from.x + dx * fraction,
          y: from.y + dy * fraction,
        }),
      ],
      timestamp: timestamp + fraction * 0.3,
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: cancel ? "touchCancel" : "touchEnd",
    touchPoints: [],
    timestamp: timestamp + 0.45,
  });
}

// The Board reads the stroke's own touch coordinates (`boardSwipe.ts`).
// An in-page stroke is that event. A native scroll still needs a real touch.
function stroke(
  from: { x: number; y: number },
  dx: number,
  dy: number,
  { cancel = false, moves = [1] }: { cancel?: boolean; moves?: number[] } = {},
) {
  const area = boardReading.view();
  const emit = (
    type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
    at: { x: number; y: number } | undefined,
  ) => {
    const active = type === "touchstart" || type === "touchmove";
    const touch =
      at === undefined
        ? undefined
        : new Touch({
            identifier: 1,
            target: area,
            clientX: at.x,
            clientY: at.y,
          });
    area.dispatchEvent(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        touches: active && touch !== undefined ? [touch] : [],
        targetTouches: active && touch !== undefined ? [touch] : [],
        changedTouches: touch === undefined ? [] : [touch],
      }),
    );
  };
  emit("touchstart", from);
  for (const fraction of moves)
    emit("touchmove", {
      x: from.x + dx * fraction,
      y: from.y + dy * fraction,
    });
  emit(
    cancel ? "touchcancel" : "touchend",
    cancel ? undefined : { x: from.x + dx, y: from.y + dy },
  );
}

export function swipe(
  direction: "left" | "right",
  options: { distance?: number; cancel?: boolean; target?: Element } = {},
): Promise<void> {
  const { distance = 160, cancel = false, target } = options;
  const room = boardReading.room();
  const from =
    target === undefined
      ? { x: room.left + room.width / 2, y: room.top + 130 }
      : center(target);
  if (target !== undefined)
    expect(target.contains(document.elementFromPoint(from.x, from.y))).toBe(
      true,
    );
  const available =
    direction === "left" ? from.x - room.left : room.right - from.x;
  const dx =
    (direction === "left" ? -1 : 1) * Math.min(distance, available - 2);
  // Use browser hit testing and event delivery for swipes that start on a control.
  if (target !== undefined) return drag(from, dx, 0, { cancel });
  stroke(from, dx, 0, { cancel });
  return Promise.resolve();
}

export function readByTouch() {
  const room = boardReading.room();
  return drag({ x: room.left + room.width / 2, y: room.top + 370 }, 0, -240, {
    moves: [0.25, 0.5, 0.75, 1],
  });
}

export async function tapWhereShown(element: Element) {
  const point = center(element);
  expect(element.contains(document.elementFromPoint(point.x, point.y))).toBe(
    true,
  );
  const session = browserSession();
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [pointInBrowser(point)],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}
