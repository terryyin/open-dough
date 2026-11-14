// One omitted unchanged range in a story-review file diff: revealed context
// lines and directional gutter controls that splice the next 20-line window
// from revision file text (`./diffContextExpansion.ts`).

import {
  CONTEXT_EXPAND_CHUNK,
  expandGapDown,
  expandGapUp,
  remainingInGap,
  revealedGapLines,
  type DiffGap,
  type FileLineSides,
  type GapReveal,
} from "./diffContextExpansion.ts";
import { DiffLineNumber, type DiffLineSide } from "./DiffLineNumber.tsx";
import type { DiffLine } from "./unifiedDiff.ts";

const lineMarkers: Record<DiffLine["kind"], string> = {
  added: "+",
  removed: "-",
  unchanged: " ",
};

export type DiffLineMenu = {
  readonly open: { readonly side: DiffLineSide; readonly line: number } | null;
  readonly onOpen: (side: DiffLineSide, line: number) => void;
  readonly onClose: () => void;
  readonly onFollowUp: (side: DiffLineSide, line: number) => void;
};

// One printed or revealed diff line (and its optional no-newline note).
export function diffLineItems(
  line: DiffLine,
  key: string,
  menu?: DiffLineMenu,
) {
  const number = (side: DiffLineSide, value: number | undefined) => {
    if (value === undefined) return null;
    if (menu === undefined) return null;
    const open = menu.open?.side === side && menu.open.line === value;
    return (
      <DiffLineNumber
        side={side}
        line={value}
        open={open}
        onOpen={() => {
          menu.onOpen(side, value);
        }}
        onClose={menu.onClose}
        onFollowUp={() => {
          menu.onFollowUp(side, value);
        }}
      />
    );
  };
  return [
    <li
      key={key}
      className={`story-review-line story-review-${line.kind}`}
      data-old={line.oldNumber}
      data-new={line.newNumber}
      data-line-menu={menu === undefined ? undefined : ""}
    >
      {number("old", line.oldNumber)}
      {number("new", line.newNumber)}
      <span className="story-review-line-code">
        {lineMarkers[line.kind]}
        {line.text}
      </span>
    </li>,
    ...(line.noNewlineAtEnd === true
      ? [
          <li key={`${key}-end`} className="story-review-note">
            \ No newline at end of file
          </li>,
        ]
      : []),
  ];
}

export function ContextGap({
  gap,
  reveal,
  sides,
  beforeFirst,
  trailing,
  onReveal,
  lineMenu,
}: {
  readonly gap: DiffGap;
  readonly reveal: GapReveal;
  readonly sides: FileLineSides;
  readonly beforeFirst: boolean;
  readonly trailing: boolean;
  readonly onReveal: (next: GapReveal, preserve: "up" | "down") => void;
  readonly lineMenu?: DiffLineMenu;
}) {
  const { start, end } = revealedGapLines(gap, reveal, sides);
  const remaining = remainingInGap(gap, reveal);
  const showUp = !trailing && remaining > 0;
  const showDown = !beforeFirst && remaining > 0;
  const chunk = Math.min(CONTEXT_EXPAND_CHUNK, remaining);
  const linesLabel = chunk === 1 ? "" : "s";

  return (
    <ol
      className="story-review-hunk story-review-context-gap"
      data-gap={gap.id}
      aria-label={
        beforeFirst
          ? "Omitted lines before the next change"
          : trailing
            ? "Omitted lines after the previous change"
            : "Omitted lines between changes"
      }
    >
      {start.flatMap((line) =>
        diffLineItems(line, `s-${String(line.oldNumber)}`, lineMenu),
      )}
      {remaining > 0 && (
        <li className="story-review-expand" data-gap={gap.id}>
          <span className="story-review-expand-controls">
            {showUp && (
              <button
                type="button"
                data-expand="up"
                aria-label={`Show ${String(chunk)} preceding line${linesLabel}`}
                onClick={() => {
                  onReveal(expandGapUp(gap, reveal), "up");
                }}
              >
                ▲
              </button>
            )}
            {showDown && (
              <button
                type="button"
                data-expand="down"
                aria-label={`Show ${String(chunk)} following line${linesLabel}`}
                onClick={() => {
                  onReveal(expandGapDown(gap, reveal), "down");
                }}
              >
                ▼
              </button>
            )}
          </span>
        </li>
      )}
      {end.flatMap((line) =>
        diffLineItems(line, `e-${String(line.oldNumber)}`, lineMenu),
      )}
    </ol>
  );
}
