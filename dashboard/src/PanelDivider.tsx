// The Panel divider beside the Side panel (`./ResizeDivider.tsx`), which resizes it
// (`./sidePanelWidth.ts`) in the normal split: dragged with the pointer, or,
// while it holds the keyboard, with Left, which widens the panel, and Right,
// which narrows it. Both change the one preferred width within the same
// bounds, and it says the panel's current width. While the panel is maximized
// or covering the page column there is no divider.

import { ResizeDivider } from "./ResizeDivider.tsx";
import { usePanelDivider } from "./sidePanelWidth.ts";

export function PanelDivider() {
  const divider = usePanelDivider();
  if (divider === undefined) return null;
  const { width, minimum, maximum, step, choose } = divider;
  return (
    <ResizeDivider
      orientation="vertical"
      label="Panel divider"
      title="Drag, or use Left and Right, to resize the panel"
      valueText={(size) => `${String(size)} pixels wide`}
      className="panel-divider"
      range={{ size: width, minimum, maximum, step, choose }}
    />
  );
}
