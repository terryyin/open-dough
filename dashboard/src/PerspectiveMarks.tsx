// Custom SVG marks for the Development and Intent perspective choices
// (./PerspectiveSelect.tsx). Same stroke-weight language as frame Lucide
// icons (./Icon.tsx); decorative beside the visible labels. Structure is
// not offered here.

import type { ReactNode } from "react";

function PerspectiveMark({
  children,
  mark,
}: {
  readonly children: ReactNode;
  readonly mark: "development" | "intent";
}) {
  return (
    <svg
      className="icon perspective-mark"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-perspective-mark={mark}
    >
      {children}
    </svg>
  );
}

// Work in flight on the board: three story-card shapes, staggered as cards
// mid-progress — not a code bracket or hammer.
export function DevelopmentMark() {
  return (
    <PerspectiveMark mark="development">
      <rect x="3" y="3.5" width="13" height="5" rx="1.25" />
      <rect x="5.5" y="9.5" width="13" height="5" rx="1.25" />
      <rect x="8" y="15.5" width="13" height="5" rx="1.25" />
    </PerspectiveMark>
  );
}

// Purpose beside Proof: a short document paired with a clear verification
// check — not a lone target or eye.
export function IntentMark() {
  return (
    <PerspectiveMark mark="intent">
      <path d="M3.5 3.5h8L15 7v12.5H3.5z" />
      <path d="M11.5 3.5V7H15" />
      <path d="M6 12h5" />
      <path d="M6 15.5h3.5" />
      <path d="M17 12.5l2 2 4-4" />
    </PerspectiveMark>
  );
}
