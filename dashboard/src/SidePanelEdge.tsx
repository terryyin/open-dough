// The side panel's left edge (`./ResizeEdge.tsx`), which resizes it
// (`./sidePanelWidth.ts`) in the normal split: dragged with the pointer, or,
// while it holds the keyboard, with Left, which widens the panel, and Right,
// which narrows it. Both change the one preferred width within the same
// bounds, and it says the panel's current width. While the panel is maximized
// or stacked above the page there is no edge.

import { ResizeEdge } from "./ResizeEdge.tsx";
import { useSidePanelEdge } from "./sidePanelWidth.ts";

export function SidePanelEdge() {
  const edge = useSidePanelEdge();
  if (edge === undefined) return null;
  const { width, minimum, maximum, step, choose } = edge;
  return (
    <ResizeEdge
      orientation="vertical"
      label="Resize panel"
      title="Drag, or use Left and Right, to resize the panel"
      valueText={(size) => `${String(size)} pixels wide`}
      className="side-panel-edge"
      range={{ size: width, minimum, maximum, step, choose }}
    />
  );
}
