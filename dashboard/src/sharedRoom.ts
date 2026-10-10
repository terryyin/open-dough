// How one area takes its share of a room it shares with another, along one
// axis: the side panel beside the page (`./sidePanelWidth.ts`) and Running
// Cursor sessions' content below the session list
// (`./runningCursorHeight.ts`). The area takes the size the developer prefers,
// or half the room until one is chosen, and neither area gets less than its
// usable floor. The preference is kept in this browser's disposable storage
// (`./keptPreference.ts`), so a reload recovers it; where the browser keeps
// none or an unusable one, none is chosen. Each caller owns its room, floors,
// key step and the key its preference is kept under.
// All sizes are CSS px; an area's size is a whole number of them.

import { useCallback, useState } from "react";
import { keep, readKept } from "./keptPreference.ts";

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

function readPreferredSize(key: string): number | undefined {
  const kept = Number(readKept(key));
  return Number.isFinite(kept) && kept > 0 ? kept : undefined;
}

// The size the developer prefers, if this browser keeps a usable one under
// `key`, and how a choice replaces it, here and in what the browser keeps.
export function usePreferredSize(
  key: string,
): [number | undefined, (size: number) => void] {
  const [preferred, setPreferred] = useState(() => readPreferredSize(key));
  const prefer = useCallback(
    (size: number) => {
      setPreferred(size);
      keep(key, String(size));
    },
    [key],
  );
  return [preferred, prefer];
}

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
