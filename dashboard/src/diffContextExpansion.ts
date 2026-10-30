// Omitted unchanged ranges between a printed unified diff's hunks
// (`./unifiedDiff.ts`), filled from revision file text in 20-line windows
// (`./StoryReviewDiffLines.tsx`). Expansion is presentation state only.

import type { DiffHunk, DiffLine } from "./unifiedDiff.ts";

export const CONTEXT_EXPAND_CHUNK = 20;

export type FileLineSides = {
  readonly baseline: readonly string[];
  readonly tree: readonly string[];
};

// Lines of a revision blob: a trailing newline does not add an empty line.
export function textLines(text: string | null): string[] {
  if (text === null || text === "") return [];
  const parts = text.split("\n");
  if (parts.at(-1) === "") parts.pop();
  return parts;
}

export type DiffGap = {
  // Stable among gaps for one printed diff.
  readonly id: number;
  // 1-based inclusive start in the old and new files.
  readonly oldStart: number;
  readonly newStart: number;
  readonly count: number;
  // -1 = before the first hunk; otherwise the gap follows this hunk index.
  readonly afterHunk: number;
};

export type GapReveal = {
  readonly fromStart: number;
  readonly fromEnd: number;
};

type HunkSpan = {
  readonly oldFirst: number;
  readonly newFirst: number;
  readonly oldAfter: number;
  readonly newAfter: number;
};

function hunkHeaderSpan(header: string): HunkSpan | undefined {
  const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
  if (match === null) return undefined;
  const oldStart = Number(match[1]);
  const oldCount = match[2] === undefined ? 1 : Number(match[2]);
  const newStart = Number(match[3]);
  const newCount = match[4] === undefined ? 1 : Number(match[4]);
  return {
    oldFirst: oldCount === 0 ? oldStart + 1 : oldStart,
    newFirst: newCount === 0 ? newStart + 1 : newStart,
    oldAfter: oldCount === 0 ? oldStart + 1 : oldStart + oldCount,
    newAfter: newCount === 0 ? newStart + 1 : newStart + newCount,
  };
}

function spanOf(hunk: DiffHunk): HunkSpan | undefined {
  return hunkHeaderSpan(hunk.header);
}

function gapBetween(
  id: number,
  afterHunk: number,
  oldStart: number,
  newStart: number,
  oldEndExclusive: number,
  newEndExclusive: number,
  sides: FileLineSides,
): DiffGap | undefined {
  const oldCount = oldEndExclusive - oldStart;
  const newCount = newEndExclusive - newStart;
  if (oldCount <= 0 || newCount <= 0 || oldCount !== newCount) return undefined;
  const lastOld = oldStart + oldCount - 1;
  const lastNew = newStart + newCount - 1;
  if (lastOld > sides.baseline.length || lastNew > sides.tree.length)
    return undefined;
  for (let offset = 0; offset < oldCount; offset += 1) {
    if (
      sides.baseline[oldStart - 1 + offset] !==
      sides.tree[newStart - 1 + offset]
    )
      return undefined;
  }
  return { id, afterHunk, oldStart, newStart, count: oldCount };
}

// Gaps of omitted unchanged lines before, between, and after printed hunks.
export function omittedGaps(
  hunks: readonly DiffHunk[],
  sides: FileLineSides,
): DiffGap[] {
  if (hunks.length === 0) return [];
  const spans = hunks.map(spanOf);
  if (spans.some((span) => span === undefined)) return [];
  const known = spans as HunkSpan[];
  const gaps: DiffGap[] = [];
  let id = 0;
  const first = known[0];
  if (first !== undefined && (first.oldFirst > 1 || first.newFirst > 1)) {
    const before = gapBetween(
      id,
      -1,
      1,
      1,
      first.oldFirst,
      first.newFirst,
      sides,
    );
    if (before !== undefined) {
      gaps.push(before);
      id += 1;
    }
  }
  for (let at = 0; at < known.length - 1; at += 1) {
    const earlier = known[at];
    const later = known[at + 1];
    if (earlier === undefined || later === undefined) continue;
    const between = gapBetween(
      id,
      at,
      earlier.oldAfter,
      earlier.newAfter,
      later.oldFirst,
      later.newFirst,
      sides,
    );
    if (between !== undefined) {
      gaps.push(between);
      id += 1;
    }
  }
  const last = known.at(-1);
  if (last !== undefined) {
    const trailing = gapBetween(
      id,
      known.length - 1,
      last.oldAfter,
      last.newAfter,
      sides.baseline.length + 1,
      sides.tree.length + 1,
      sides,
    );
    if (trailing !== undefined) gaps.push(trailing);
  }
  return gaps;
}

export function remainingInGap(gap: DiffGap, reveal: GapReveal): number {
  return Math.max(0, gap.count - reveal.fromStart - reveal.fromEnd);
}

export function expandGapDown(
  gap: DiffGap,
  reveal: GapReveal,
  chunk = CONTEXT_EXPAND_CHUNK,
): GapReveal {
  const add = Math.min(chunk, remainingInGap(gap, reveal));
  return add === 0 ? reveal : { ...reveal, fromStart: reveal.fromStart + add };
}

export function expandGapUp(
  gap: DiffGap,
  reveal: GapReveal,
  chunk = CONTEXT_EXPAND_CHUNK,
): GapReveal {
  const add = Math.min(chunk, remainingInGap(gap, reveal));
  return add === 0 ? reveal : { ...reveal, fromEnd: reveal.fromEnd + add };
}

function contextLine(
  gap: DiffGap,
  offset: number,
  sides: FileLineSides,
): DiffLine {
  const oldNumber = gap.oldStart + offset;
  const newNumber = gap.newStart + offset;
  return {
    kind: "unchanged",
    text: sides.tree[newNumber - 1] ?? sides.baseline[oldNumber - 1] ?? "",
    oldNumber,
    newNumber,
  };
}

export function revealedGapLines(
  gap: DiffGap,
  reveal: GapReveal,
  sides: FileLineSides,
): { readonly start: DiffLine[]; readonly end: DiffLine[] } {
  const start = [...Array(reveal.fromStart).keys()].map((offset) =>
    contextLine(gap, offset, sides),
  );
  const endBegin = gap.count - reveal.fromEnd;
  const end = [...Array(reveal.fromEnd).keys()].map((offset) =>
    contextLine(gap, endBegin + offset, sides),
  );
  return { start, end };
}
