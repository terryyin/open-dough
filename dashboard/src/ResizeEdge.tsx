// A boundary between two areas that resizes the one it belongs to: the side
// panel's left edge (`./SidePanelEdge.tsx`) and the edge above Running Cursor
// sessions in the Sessions sidebar (`./SessionSidebar.tsx`). It is a
// focusable separator that says its area's current size and bounds. Dragged
// with the pointer toward the area's far side, or, while it holds the
// keyboard, with Left or Up, the area grows; away from it, or with Right or
// Down, it shrinks, along the edge's own axis. A drag ends wherever the
// pointer is released, or when the browser cancels it. Each caller owns its
// area's sizes: the edge only asks for one (`choose`), within the bounds the
// caller gives. Where the room offers no range to choose from, the edge says
// so and resizes nothing.

import { useRef, type PointerEvent } from "react";
import "./resize-edge.css";

// The area's size and its bounds, in CSS px, and how a new one is asked for.
export type EdgeRange = {
  readonly size: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
  readonly choose: (size: number) => void;
};

type Drag = {
  readonly pointerId: number;
  readonly from: number;
  readonly size: number;
};

const axes = {
  // Beside the area: across the page.
  vertical: {
    position: (event: PointerEvent) => event.clientX,
    grow: "ArrowLeft",
    shrink: "ArrowRight",
  },
  // Above the area: down the page.
  horizontal: {
    position: (event: PointerEvent) => event.clientY,
    grow: "ArrowUp",
    shrink: "ArrowDown",
  },
} as const;

export function ResizeEdge({
  orientation,
  label,
  title,
  valueText,
  className,
  range,
}: {
  readonly orientation: keyof typeof axes;
  readonly label: string;
  readonly title: string;
  readonly valueText: (size: number) => string;
  readonly className: string;
  // Undefined while the room offers nothing to choose from.
  readonly range: EdgeRange | undefined;
}) {
  const drag = useRef<Drag | undefined>(undefined);
  const axis = axes[orientation];
  const end = (event: PointerEvent) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = undefined;
  };
  if (range === undefined)
    return (
      <div
        role="separator"
        aria-label={label}
        aria-orientation={orientation}
        aria-disabled
        className={`resize-edge ${className}`}
      />
    );
  const { size, minimum, maximum, step, choose } = range;
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={size}
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-valuetext={valueText(size)}
      title={title}
      className={`resize-edge ${className}`}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
          return;
        const change =
          event.key === axis.grow
            ? step
            : event.key === axis.shrink
              ? -step
              : undefined;
        if (change === undefined) return;
        // Taken from the page's own arrow navigation and scrolling, even at a
        // bound.
        event.preventDefault();
        choose(size + change);
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        // No text selection while dragging; the edge takes the keyboard.
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          from: axis.position(event),
          size,
        };
      }}
      onPointerMove={(event) => {
        const dragged = drag.current;
        if (dragged?.pointerId !== event.pointerId) return;
        choose(dragged.size + dragged.from - axis.position(event));
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    />
  );
}
