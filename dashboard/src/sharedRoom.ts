// How one area takes its share of a room it shares with another, along one
// axis: the side panel beside the page (`./sidePanelWidth.ts`) and Running
// Cursor sessions' content below the session list
// (`./runningCursorHeight.ts`). The area takes the size the developer prefers,
// or half the room until one is chosen, and neither area gets less than its
// usable floor. Each caller owns its room, floors, key step and preference.
// All sizes are CSS px; an area's size is a whole number of them.

export type Share = {
  readonly size: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

// The size nearest `size` that the bounds allow.
export const sizeWithin = (size: number, minimum: number, maximum: number) =>
  Math.round(clamp(size, minimum, maximum));

// The area's size and bounds in the room, for the preferred size, if one was
// chosen; undefined where the room cannot hold both floors.
export function shareOfRoom(
  room: number,
  preferred: number | undefined,
  {
    floor,
    otherFloor,
    step,
  }: {
    readonly floor: number;
    readonly otherFloor: number;
    readonly step: number;
  },
): Share | undefined {
  const minimum = Math.ceil(floor);
  const maximum = Math.floor(room - otherFloor);
  if (maximum < minimum) return undefined;
  return {
    size: sizeWithin(preferred ?? room / 2, minimum, maximum),
    minimum,
    maximum,
    step,
  };
}
