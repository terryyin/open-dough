// The side panel's left edge, which resizes it (`./sidePanelWidth.ts`) in the
// normal split: dragged with the pointer, or, while it holds the keyboard,
// with Left, which widens the panel, and Right, which narrows it. Both change
// the one preferred width within the same bounds. It is a focusable separator
// that says the panel's current width. A drag ends wherever the pointer is
// released, or when the browser cancels it. While the panel is maximized or
// stacked above the page there is no edge.

import { useRef, type PointerEvent } from "react";
import { useSidePanelEdge } from "./sidePanelWidth.ts";

type Drag = {
  readonly pointerId: number;
  readonly from: number;
  readonly width: number;
};

export function SidePanelEdge() {
  const edge = useSidePanelEdge();
  const drag = useRef<Drag | undefined>(undefined);
  if (edge === undefined) return null;
  const { width, minimum, maximum, step, choose } = edge;
  const end = (event: PointerEvent) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = undefined;
  };
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label="Resize panel"
      aria-orientation="vertical"
      aria-valuenow={width}
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-valuetext={`${String(width)} pixels wide`}
      title="Drag, or use Left and Right, to resize the panel"
      className="side-panel-edge"
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
          return;
        const change =
          event.key === "ArrowLeft"
            ? step
            : event.key === "ArrowRight"
              ? -step
              : undefined;
        if (change === undefined) return;
        // Taken from the page's own arrow navigation, even at a bound.
        event.preventDefault();
        choose(width + change);
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        // No text selection while dragging; the edge takes the keyboard.
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          from: event.clientX,
          width,
        };
      }}
      onPointerMove={(event) => {
        const dragged = drag.current;
        if (dragged?.pointerId !== event.pointerId) return;
        choose(dragged.width + dragged.from - event.clientX);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    />
  );
}
