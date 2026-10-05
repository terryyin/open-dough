// Previous file and Next file beside a story review's diff heading
// (`./StoryReviewSnapshotView.tsx`): icon controls that move the selection
// one file up or down the browser's order (`reviewFileOrder` in
// `./reviewFileTree.ts`). Previous file is unavailable on the first file and
// Next file on the last, each still focusable so the keyboard stays on it.

import { ChevronDown, ChevronUp } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import type { ReviewedFile } from "./storyReview.ts";

export function FileMoves({
  order,
  selectedPath,
  onMove,
}: {
  // The files in the browser's order, and the one selected among them.
  readonly order: readonly ReviewedFile[];
  readonly selectedPath: string;
  readonly onMove: (to: ReviewedFile) => void;
}) {
  const at = order.findIndex((file) => file.path === selectedPath);
  const previous = at > 0 ? order[at - 1] : undefined;
  const next = order[at + 1];
  return (
    <div className="story-review-file-moves">
      <IconButton
        label="Previous file"
        icon={ChevronUp}
        aria-disabled={previous === undefined}
        onClick={() => {
          if (previous !== undefined) onMove(previous);
        }}
      />
      <IconButton
        label="Next file"
        icon={ChevronDown}
        align="end"
        aria-disabled={next === undefined}
        onClick={() => {
          if (next !== undefined) onMove(next);
        }}
      />
    </div>
  );
}

// Scrolls the browser's pane, and only it, the least that brings a row
// wholly into its visible box.
export function revealRow(pane: HTMLElement, row: Element) {
  const shown = pane.getBoundingClientRect();
  const placed = row.getBoundingClientRect();
  const top = shown.top + pane.clientTop;
  const above = placed.top - top;
  const below = placed.bottom - (top + pane.clientHeight);
  if (above < 0) pane.scrollBy({ top: above });
  else if (below > 0) pane.scrollBy({ top: below });
}
