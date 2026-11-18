// A boundary between two areas that resizes the one it belongs to: the side
// Panel divider (`./PanelDivider.tsx`) and the dividers above optional Sessions
// sidebar sections (`./SessionsSidebar.tsx`). It is a
// focusable separator that says its area's current size and bounds. The area
// lies on one side of the divider along its axis: trailing (right of a
// vertical divider, below a horizontal one; the default) or leading (left of
// it, above it). Dragged with the pointer away from the area, or, while it
// holds the keyboard, with the arrow key pointing away from the area (Left or
// Up for a trailing area, Right or Down for a leading one), the area grows;
// toward it, or with the opposite key, it shrinks. A drag ends wherever the
// pointer is released, or when the browser cancels it. Each caller owns its
// area's sizes: the divider only asks for one (`choose`), within the bounds the
// caller gives. Where the room offers no range to choose from, the divider says
// so and resizes nothing.

import { useRef, type PointerEvent } from "react";
import "./resize-divider.css";

// The area's size and its bounds, in CSS px, and how a new one is asked for.
export type DividerRange = {
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

// Each axis's position and its keys toward the leading and trailing sides.
const axes = {
  // Across the page.
  vertical: {
    position: (event: PointerEvent) => event.clientX,
    leading: "ArrowLeft",
    trailing: "ArrowRight",
  },
  // Down the page.
  horizontal: {
    position: (event: PointerEvent) => event.clientY,
    leading: "ArrowUp",
    trailing: "ArrowDown",
  },
} as const;

// Which side of the divider the area lies on, and so which way it grows: away
// from the area.
const sides = {
  trailing: { grow: "leading", shrink: "trailing", direction: -1 },
  leading: { grow: "trailing", shrink: "leading", direction: 1 },
} as const;

export function ResizeDivider({
  orientation,
  side = "trailing",
  label,
  title,
  valueText,
  className,
  range,
}: {
  readonly orientation: keyof typeof axes;
  readonly side?: keyof typeof sides;
  readonly label: string;
  readonly title: string;
  readonly valueText: (size: number) => string;
  readonly className: string;
  // Undefined while the room offers nothing to choose from.
  readonly range: DividerRange | undefined;
}) {
  const drag = useRef<Drag | undefined>(undefined);
  const axis = axes[orientation];
  const growth = sides[side];
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
        className={`resize-divider ${className}`}
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
      className={`resize-divider ${className}`}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
          return;
        const change =
          event.key === axis[growth.grow]
            ? step
            : event.key === axis[growth.shrink]
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
        // No text selection while dragging; the divider takes the keyboard.
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
        choose(
          dragged.size +
            growth.direction * (axis.position(event) - dragged.from),
        );
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    />
  );
}
