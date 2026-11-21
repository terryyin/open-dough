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

async function drag(
  from: { x: number; y: number },
  dx: number,
  dy: number,
  cancel = false,
) {
  const session = browserSession();
  // Space the input timestamps so a stroke reads a bounded distance.
  const timestamp = Date.now() / 1000 - 0.5;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [pointInBrowser(from)],
    timestamp,
  });
  for (const fraction of [0.25, 0.5, 0.75, 1]) {
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

export async function swipe(
  direction: "left" | "right",
  options: { distance?: number; cancel?: boolean; target?: Element } = {},
) {
  const { distance = 160, cancel, target } = options;
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
  await drag(
    from,
    (direction === "left" ? -1 : 1) * Math.min(distance, available - 2),
    0,
    cancel,
  );
}

export function readByTouch() {
  const room = boardReading.room();
  return drag({ x: room.left + room.width / 2, y: room.top + 370 }, 0, -240);
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
