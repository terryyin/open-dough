// A review's file sidebar and diff side by side (`./StoryReviewSnapshotView.tsx`),
// with the Files divider between them while the sidebar is shown
// (`./ResizeDivider.tsx`). The sidebar lies on the divider's leading side:
// dragging it rightward, or Right while it holds the keyboard, widens the
// sidebar and narrows the diff by the same width; leftward, or Left, the
// reverse. The width is the reviewer's preference
// (`./reviewFileSidebarWidth.ts`). Where the panes stack, the divider is not
// shown (`./story-review-workarea.css`).

import { useRef, type CSSProperties, type ReactNode } from "react";
import { ResizeDivider } from "./ResizeDivider.tsx";
import { useFileSidebarWidth } from "./reviewFileSidebarWidth.ts";
import "./story-review-workarea.css";

export function StoryReviewWorkarea({
  sidebarShown,
  sidebar,
  diff,
}: {
  readonly sidebarShown: boolean;
  readonly sidebar: ReactNode;
  readonly diff: ReactNode;
}) {
  const workarea = useRef<HTMLDivElement>(null);
  const { width, range } = useFileSidebarWidth(workarea, sidebarShown);
  const style =
    width === undefined
      ? undefined
      : ({
          "--story-review-files-width": `${String(width)}px`,
        } as CSSProperties);
  return (
    <div ref={workarea} className="story-review-workarea" style={style}>
      {sidebar}
      {sidebarShown && (
        <ResizeDivider
          orientation="vertical"
          side="leading"
          label="Files divider"
          title="Drag, or use Left and Right, to resize the file sidebar"
          valueText={(size) => `${String(size)} pixels wide`}
          className="story-review-files-divider"
          range={range}
        />
      )}
      {diff}
    </div>
  );
}
