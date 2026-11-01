// Keeps `--terminal-rows-height` on the identity at the height of its title
// and session rows, however they wrap, so the agent portrait beside them
// stays proportionate to both, with its stylesheet's compact cap.

import { useLayoutEffect, type RefObject } from "react";
import { keepHeight } from "./measuredHeight.ts";

export function useRowsHeight(
  identity: RefObject<HTMLDivElement | null>,
  rows: RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    const target = identity.current;
    const measured = rows.current;
    if (!target || !measured) return;
    return keepHeight(measured, target, "--terminal-rows-height").stop;
  }, [identity, rows]);
}
