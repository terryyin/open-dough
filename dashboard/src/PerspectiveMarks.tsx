// Custom SVG marks for the Development and Intent perspective choices
// (./PerspectiveSelect.tsx). Same stroke-weight language as frame Lucide
// icons (./Icon.tsx); decorative, since each choice carries its name. Structure is
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

// Incremental and iterative delivery: a turning cycle around bars that grow
// with each pass — not a staggered cascade, which reads as waterfall.
export function DevelopmentMark() {
  return (
    <PerspectiveMark mark="development">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M8.5 16v-2" />
      <path d="M12 16v-4.5" />
      <path d="M15.5 16v-7" />
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
