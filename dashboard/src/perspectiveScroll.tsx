import type { ReactNode } from "react";

const scrollClass = {
  board: "board-scroll",
  intent: "intent-scroll",
  roster: "roster-scroll",
} as const;

export type ScrolledPerspective = keyof typeof scrollClass;

// The scrolled page body of one perspective: its scroll container and the
// content inside it, whose layout (./board.css, ./intent-perspective.css)
// sizes the Board's columns and the Intent panes.
export function PerspectiveScroll({
  perspective,
  children,
}: {
  readonly perspective: ScrolledPerspective;
  readonly children?: ReactNode;
}) {
  return (
    <div className={scrollClass[perspective]}>
      <div className="scroll-content">{children}</div>
    </div>
  );
}
