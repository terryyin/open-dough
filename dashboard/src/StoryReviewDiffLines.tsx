// Git's printed unified diff of one story-review file, with directional
// gutter controls that splice omitted unchanged lines from revision file
// text (`./diffContextExpansion.ts`) in 20-line windows as disposable
// presentation state. Line numbers sit beside each line so copying code
// leaves them behind.

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  omittedGaps,
  revealedGapLines,
  type DiffGap,
  type FileLineSides,
  type GapReveal,
} from "./diffContextExpansion.ts";
import { ContextGap, diffLineItems } from "./StoryReviewContextGap.tsx";
import { parsedUnifiedDiff, type UnifiedDiff } from "./unifiedDiff.ts";
import "./story-review-diff.css";

const emptyReveal: GapReveal = { fromStart: 0, fromEnd: 0 };

// The widest line number in the diff's hunks and any revealed context, in digits.
function numberDigits(
  hunks: UnifiedDiff["hunks"],
  gaps: readonly DiffGap[],
  reveals: Readonly<Record<number, GapReveal>>,
  sides: FileLineSides | undefined,
) {
  const fromHunks = hunks.flatMap(({ lines }) =>
    lines.flatMap((line) => [line.oldNumber ?? 0, line.newNumber ?? 0]),
  );
  const fromGaps =
    sides === undefined
      ? []
      : gaps.flatMap((gap) => {
          const reveal = reveals[gap.id] ?? emptyReveal;
          const { start, end } = revealedGapLines(gap, reveal, sides);
          return [...start, ...end].flatMap((line) => [
            line.oldNumber ?? 0,
            line.newNumber ?? 0,
          ]);
        });
  return String(Math.max(0, ...fromHunks, ...fromGaps)).length;
}

export function DiffLines({
  printed,
  sides,
  textProblem,
  onRetryText,
}: {
  readonly printed: string;
  readonly sides: FileLineSides | undefined;
  readonly textProblem?: string;
  readonly onRetryText: () => void;
}) {
  const { binary, hunks } = parsedUnifiedDiff(printed);
  const [reveals, setReveals] = useState<Record<number, GapReveal>>({});
  const codeRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef<{
    top: number;
    hunkIndex: number;
  } | null>(null);

  const gaps = sides === undefined ? [] : omittedGaps(hunks, sides);

  useLayoutEffect(() => {
    const pending = pendingScroll.current;
    const scroller = codeRef.current;
    if (pending === null || scroller === null) return;
    // Re-query after React commits: the pre-reveal Element can be detached.
    const node = scroller.querySelector(
      `[data-hunk-index="${String(pending.hunkIndex)}"]`,
    );
    if (node === null) {
      pendingScroll.current = null;
      return;
    }
    const topAfter = node.getBoundingClientRect().top;
    scroller.scrollTop += topAfter - pending.top;
    pendingScroll.current = null;
  });

  if (hunks.length === 0)
    return (
      <p>
        {binary
          ? "This file has no textual diff: Git reads it as binary."
          : "This file has no textual diff."}
      </p>
    );

  const setGapReveal = (
    gap: DiffGap,
    next: GapReveal,
    preserve: "up" | "down",
  ) => {
    if (preserve === "up") {
      const hunkIndex = gap.afterHunk < 0 ? 0 : gap.afterHunk + 1;
      const node = codeRef.current?.querySelector(
        `[data-hunk-index="${String(hunkIndex)}"]`,
      );
      if (node !== null && node !== undefined) {
        pendingScroll.current = {
          top: node.getBoundingClientRect().top,
          hunkIndex,
        };
      }
    }
    setReveals((was) => ({ ...was, [gap.id]: next }));
  };

  const renderGap = (gap: DiffGap) => {
    if (sides === undefined) return null;
    return (
      <ContextGap
        key={`gap-${String(gap.id)}`}
        gap={gap}
        reveal={reveals[gap.id] ?? emptyReveal}
        sides={sides}
        beforeFirst={gap.afterHunk < 0}
        trailing={gap.afterHunk === hunks.length - 1}
        onReveal={(next, preserve) => {
          setGapReveal(gap, next, preserve);
        }}
      />
    );
  };

  const gapBefore = gaps.find((gap) => gap.afterHunk < 0);
  const gapAfter = (hunkIndex: number) =>
    gaps.find((gap) => gap.afterHunk === hunkIndex);

  return (
    <div
      ref={codeRef}
      className="story-review-code"
      // Long lines scroll here, never the page; the keyboard can reach it.
      tabIndex={0}
      style={
        {
          "--line-number-digits": String(
            numberDigits(hunks, gaps, reveals, sides),
          ),
        } as CSSProperties
      }
    >
      {textProblem !== undefined && (
        <p className="story-review-context-problem" role="alert">
          Additional context could not be read: {textProblem}{" "}
          <button type="button" onClick={onRetryText}>
            Retry
          </button>
        </p>
      )}
      {gapBefore !== undefined && renderGap(gapBefore)}
      {hunks.map((hunk, index) => {
        const after = gapAfter(index);
        return (
          <div key={index} className="story-review-hunk-block">
            <ol
              className="story-review-hunk"
              aria-label={hunk.header}
              data-hunk-index={index}
            >
              <li className="story-review-hunk-header" aria-hidden="true">
                {hunk.header}
              </li>
              {hunk.lines.flatMap((line, at) =>
                diffLineItems(line, String(at)),
              )}
            </ol>
            {after !== undefined && renderGap(after)}
          </div>
        );
      })}
    </div>
  );
}
