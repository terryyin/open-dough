type Point = { x: number; y: number };

// Serialized into the page by Playwright as well as called in a mounted page.
export function dispatchBoardTouch(
  target: Element,
  stroke: { from: Point; to: Point; cancel?: boolean },
): { moveAccepted: boolean; endAccepted: boolean } {
  const finger = ({ x, y }: Point) =>
    new Touch({ target, identifier: 1, clientX: x, clientY: y });
  const send = (type: string, touch: Touch, ended = false) =>
    target.dispatchEvent(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        changedTouches: [touch],
        touches: ended ? [] : [touch],
        targetTouches: ended ? [] : [touch],
      }),
    );
  const to = finger(stroke.to);
  send("touchstart", finger(stroke.from));
  const moveAccepted = send("touchmove", to);
  const endAccepted = send(
    stroke.cancel ? "touchcancel" : "touchend",
    to,
    true,
  );
  return { moveAccepted, endAccepted };
}
