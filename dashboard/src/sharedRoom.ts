// How areas take their share of a room along one axis: the side panel beside
// the page (`./sidePanelWidth.ts`) and the Sessions sidebar's visible lists
// (`./runningCursorHeight.ts`). Preferred-capable areas take each chosen size;
// unpreferred areas share what remains. While none of those preferred-capable
// areas has a usable chosen preference, every area — preferred-capable and
// unpreferred — shares the room equally. When some preferences are chosen and
// others are not, the chosen sizes take their constrained share first and the
// unset preferred-capable areas share what remains with the unpreferred floors.
// Neither area gets less than its usable floor. Preferences are kept in this
// browser's disposable storage (`./keptPreference.ts`), so a reload recovers
// them; where the browser keeps none or an unusable one, none is chosen. Each
// caller owns its room, floors, key step and the keys its preferences are kept
// under. All sizes are CSS px; an area's size is a whole number of them.

import { useCallback, useState } from "react";
import { keep, readKept } from "./keptPreference.ts";

export type Share = {
  readonly size: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
};

// One area that can take a preferred size in the room. Omit `preferred` while
// none is chosen; that area then shares with the unpreferred floors.
export type PreferredArea = {
  readonly floor: number;
  readonly preferred?: number | undefined;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

// The size nearest `size` that the bounds allow.
export const sizeWithin = (size: number, minimum: number, maximum: number) =>
  Math.round(clamp(size, minimum, maximum));

function readPreferredSize(
  key: string,
  formerKey?: string,
): number | undefined {
  const kept = Number(readKept(key, formerKey));
  return Number.isFinite(kept) && kept > 0 ? kept : undefined;
}

// The size the developer prefers, if this browser keeps a usable one under
// `key`, and how a choice replaces it, here and in what the browser keeps.
export function usePreferredSize(
  key: string,
  formerKey?: string,
): [number | undefined, (size: number) => void] {
  const [preferred, setPreferred] = useState(() =>
    readPreferredSize(key, formerKey),
  );
  const prefer = useCallback(
    (size: number) => {
      setPreferred(size);
      keep(key, String(size));
    },
    [key],
  );
  return [preferred, prefer];
}

const sum = (values: readonly number[]) =>
  values.reduce((total, value) => total + value, 0);

// Bounds each preferred-capable area may take while every floor still fits.
// Each area's minimum is a whole-pixel ceiling of its floor; its maximum leaves
// the other areas' raw floors, matching the established two-area divider range.
function areaBounds(
  room: number,
  preferredAreas: readonly PreferredArea[],
  otherFloors: readonly number[],
): { readonly minimum: number; readonly maximum: number }[] | undefined {
  const floorSum =
    sum(preferredAreas.map((area) => area.floor)) + sum(otherFloors);
  const bounds = preferredAreas.map((area) => ({
    minimum: Math.ceil(area.floor),
    maximum: Math.floor(room - (floorSum - area.floor)),
  }));
  if (bounds.some(({ minimum, maximum }) => maximum < minimum))
    return undefined;
  return bounds;
}

// The preferred-capable areas' sizes and bounds in the room. Unpreferred
// floors claim only their usable minimum; what remains is shared among areas
// that have no chosen preference. Undefined where the room cannot hold every
// floor.
export function sharesOfRoom(
  room: number,
  preferredAreas: readonly PreferredArea[],
  otherFloors: readonly number[],
  step: number,
): Share[] | undefined {
  const bounds = areaBounds(room, preferredAreas, otherFloors);
  if (bounds === undefined) return undefined;

  const remainderFloor = sum(otherFloors.map((floor) => Math.ceil(floor)));
  const areaCount = preferredAreas.length + otherFloors.length;
  const chosen = preferredAreas.map((area) => area.preferred !== undefined);
  const allUnset = chosen.every((has) => !has);

  if (allUnset) {
    const equal = room / areaCount;
    return bounds.map(({ minimum, maximum }) => ({
      size: sizeWithin(equal, minimum, maximum),
      minimum,
      maximum,
      step,
    }));
  }

  // One preferred-capable area against unpreferred floors: the established
  // side-panel and two-list result — sizeWithin alone, no second allocator.
  if (preferredAreas.length === 1) {
    const area = preferredAreas[0];
    const bound = bounds[0];
    if (
      area === undefined ||
      bound === undefined ||
      area.preferred === undefined
    )
      return undefined;
    return [
      {
        size: sizeWithin(area.preferred, bound.minimum, bound.maximum),
        minimum: bound.minimum,
        maximum: bound.maximum,
        step,
      },
    ];
  }

  // Several preferred-capable areas share one calculation. Each chosen
  // preference takes sizeWithin against the full-floor bounds; if those
  // claims leave too little for every unpreferred floor, scale the chosen
  // extras down so floors still fit. Unset preferred-capable areas then
  // share what remains with the remainder floors.
  const unsetIndexes = chosen
    .map((has, index) => (has ? -1 : index))
    .filter((index) => index >= 0);
  const unsetFloor = sum(
    unsetIndexes.map((index) => bounds[index]?.minimum ?? 0),
  );
  const unpreferredFloor = remainderFloor + unsetFloor;

  const tentative = preferredAreas.map((area, index) => {
    const bound = bounds[index];
    if (bound === undefined) return 0;
    if (!chosen[index] || area.preferred === undefined) return bound.minimum;
    return sizeWithin(area.preferred, bound.minimum, bound.maximum);
  });
  let chosenSizes = tentative.map((size, index) => (chosen[index] ? size : 0));
  let chosenSum = sum(chosenSizes);
  if (chosenSum + unpreferredFloor > room) {
    const floors = bounds.map((bound, index) =>
      chosen[index] ? bound.minimum : 0,
    );
    const floorSum = sum(floors);
    const budget = Math.max(0, Math.floor(room - unpreferredFloor - floorSum));
    const wants = chosenSizes.map((size, index) => size - (floors[index] ?? 0));
    const totalWant = sum(wants);
    const extras = wants.map((want, index) =>
      chosen[index] && totalWant > 0
        ? Math.floor((budget * want) / totalWant)
        : 0,
    );
    chosenSizes = floors.map((floor, index) => floor + (extras[index] ?? 0));
    let leftover = budget - sum(extras);
    while (leftover > 0) {
      let hungriest = -1;
      let shortfall = -1;
      for (let index = 0; index < wants.length; index += 1) {
        if (!chosen[index]) continue;
        const need =
          (wants[index] ?? 0) -
          ((chosenSizes[index] ?? 0) - (floors[index] ?? 0));
        if (need > shortfall) {
          shortfall = need;
          hungriest = index;
        }
      }
      if (hungriest < 0 || shortfall <= 0) break;
      chosenSizes[hungriest] = (chosenSizes[hungriest] ?? 0) + 1;
      leftover -= 1;
    }
    chosenSum = sum(chosenSizes);
  }

  const left = room - chosenSum;
  const unpreferredCount = unsetIndexes.length + otherFloors.length;
  const equalUnpreferred = unpreferredCount > 0 ? left / unpreferredCount : 0;
  return bounds.map((bound, index) => ({
    size: chosen[index]
      ? (chosenSizes[index] ?? bound.minimum)
      : sizeWithin(equalUnpreferred, bound.minimum, bound.maximum),
    minimum: bound.minimum,
    maximum: bound.maximum,
    step,
  }));
}

// One preferred-capable area and one unpreferred floor: the side panel's
// width and the Sessions sidebar's two-list case.
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
  return sharesOfRoom(room, [{ floor, preferred }], [otherFloor], step)?.[0];
}
