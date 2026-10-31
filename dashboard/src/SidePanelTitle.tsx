// The Side panel header's title line, shared by a terminal (`./Terminal.tsx`),
// story review (`./StoryReview.tsx`), and final report (`./FinalReport.tsx`).
// The title stays on one truncated line until the heading's toggle wraps it
// in full; the heading's accessible name is the complete title in either
// state. A native `title` tooltip is not used: touch cannot reach it.

import { useState } from "react";

export function SidePanelTitle({
  title,
  id,
}: {
  readonly title: string;
  readonly id?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <h2
      id={id}
      className={
        expanded
          ? "side-panel-title side-panel-title-expanded"
          : "side-panel-title"
      }
    >
      <button
        type="button"
        className="side-panel-title-toggle"
        aria-expanded={expanded}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {title}
      </button>
    </h2>
  );
}
