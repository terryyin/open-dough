// Emphasized character ranges for words that changed inside a story-review
// diff block: a run of removed lines followed by added lines, compared as
// one word stream with line breaks read as whitespace.

import type { DiffLine } from "./unifiedDiff.ts";

export type EmphasizedRange = {
  readonly start: number;
  readonly end: number;
};

type FlatChar = {
  readonly lineIndex: number;
  readonly column: number;
};

type FlatToken = {
  readonly text: string;
  readonly chars: readonly (FlatChar | null)[];
};

const wordPattern = /[A-Za-z0-9_]+|\s+|./g;

function wordsIn(text: string) {
  return [...text.matchAll(wordPattern)].map((match) => {
    const start = match.index;
    return { text: match[0], start, end: start + match[0].length };
  });
}

// Flatten block lines, joining with one space so a line break reads as
// whitespace; that join space maps to no line.
function flattenLines(texts: readonly string[]) {
  let flat = "";
  const at: (FlatChar | null)[] = [];
  texts.forEach((text, lineIndex) => {
    if (lineIndex > 0) {
      flat += " ";
      at.push(null);
    }
    for (let column = 0; column < text.length; column++) {
      flat += text.charAt(column);
      at.push({ lineIndex, column });
    }
  });
  return { flat, at };
}

function tokensFor(texts: readonly string[]): FlatToken[] {
  const { flat, at } = flattenLines(texts);
  return wordsIn(flat).map((token) => ({
    text: token.text,
    chars: at.slice(token.start, token.end),
  }));
}

function lcsAt(table: readonly (readonly number[])[], i: number, j: number) {
  return table.at(i)?.at(j) ?? 0;
}

// Longest common subsequence of word texts; equal words keep their order.
function lcsTable(a: readonly string[], b: readonly string[]) {
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      const row = table.at(i);
      if (row === undefined) continue;
      row[j] =
        a.at(i) === b.at(j)
          ? lcsAt(table, i + 1, j + 1) + 1
          : Math.max(lcsAt(table, i + 1, j), lcsAt(table, i, j + 1));
    }
  }
  return table;
}

function isWordChars(text: string) {
  return /^[A-Za-z0-9_]+$/.test(text);
}

function isSingleSpace(text: string) {
  return text === " ";
}

function tokenAt(tokens: readonly FlatToken[], at: number) {
  return tokens.at(at);
}

// Drop single-space glue beside an emphasized word so an inserted word does
// not also mark its neighbouring space (rewrap); keep longer whitespace runs
// (continuation indent) and whitespace-only changes (re-indent).
function emphasisChars(tokens: readonly FlatToken[], changedAt: Set<number>) {
  const hasNonSpaceChange = [...changedAt].some((at) => {
    const token = tokenAt(tokens, at);
    return token !== undefined && !/^\s+$/.test(token.text);
  });
  const chars: FlatChar[] = [];
  for (const at of changedAt) {
    const token = tokenAt(tokens, at);
    if (token === undefined) continue;
    const before = tokenAt(tokens, at - 1);
    const after = tokenAt(tokens, at + 1);
    if (
      hasNonSpaceChange &&
      isSingleSpace(token.text) &&
      ((before !== undefined &&
        changedAt.has(at - 1) &&
        isWordChars(before.text)) ||
        (after !== undefined &&
          changedAt.has(at + 1) &&
          isWordChars(after.text)))
    )
      continue;
    for (const char of token.chars) {
      if (char !== null) chars.push(char);
    }
  }
  return chars;
}

function changedWordChars(
  removedTexts: readonly string[],
  addedTexts: readonly string[],
) {
  const removed = tokensFor(removedTexts);
  const added = tokensFor(addedTexts);
  const table = lcsTable(
    removed.map((token) => token.text),
    added.map((token) => token.text),
  );
  const removedChanged = new Set<number>();
  const addedChanged = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < removed.length && j < added.length) {
    if (removed.at(i)?.text === added.at(j)?.text) {
      i++;
      j++;
      continue;
    }
    if (lcsAt(table, i + 1, j) >= lcsAt(table, i, j + 1)) {
      removedChanged.add(i);
      i++;
    } else {
      addedChanged.add(j);
      j++;
    }
  }
  while (i < removed.length) {
    removedChanged.add(i);
    i++;
  }
  while (j < added.length) {
    addedChanged.add(j);
    j++;
  }
  return {
    removedChanged: emphasisChars(removed, removedChanged),
    addedChanged: emphasisChars(added, addedChanged),
  };
}

function rangesFromChars(
  chars: readonly FlatChar[],
  lineCount: number,
): EmphasizedRange[][] {
  const ranges = Array.from(
    { length: lineCount },
    () => [] as EmphasizedRange[],
  );
  for (const { lineIndex, column } of chars) {
    const lineRanges = ranges.at(lineIndex);
    if (lineRanges === undefined) continue;
    const last = lineRanges.at(-1);
    if (last !== undefined && last.end === column) {
      lineRanges[lineRanges.length - 1] = {
        start: last.start,
        end: column + 1,
      };
    } else {
      lineRanges.push({ start: column, end: column + 1 });
    }
  }
  return ranges;
}

function takeRun(
  lines: readonly DiffLine[],
  start: number,
  kind: DiffLine["kind"],
) {
  const indexes: number[] = [];
  let index = start;
  while (index < lines.length && lines.at(index)?.kind === kind) {
    indexes.push(index);
    index++;
  }
  return { indexes, next: index };
}

// Each hunk line's emphasized ranges (character offsets in `line.text`), keyed
// by that line's index in `lines`. Only mixed removed-then-added blocks contribute.
export function emphasizedRangesByLine(
  lines: readonly DiffLine[],
): ReadonlyMap<number, readonly EmphasizedRange[]> {
  const result = new Map<number, readonly EmphasizedRange[]>();
  let index = 0;
  while (index < lines.length) {
    const line = lines.at(index);
    if (line === undefined) break;
    if (line.kind === "unchanged") {
      index++;
      continue;
    }
    const removed = takeRun(lines, index, "removed");
    const added = takeRun(lines, removed.next, "added");
    index = added.indexes.length > 0 ? added.next : removed.next;
    if (removed.indexes.length === 0 && added.indexes.length === 0) {
      index++;
      continue;
    }
    if (removed.indexes.length === 0 || added.indexes.length === 0) continue;
    const { removedChanged, addedChanged } = changedWordChars(
      removed.indexes.map((at) => lines.at(at)?.text ?? ""),
      added.indexes.map((at) => lines.at(at)?.text ?? ""),
    );
    const removedRanges = rangesFromChars(
      removedChanged,
      removed.indexes.length,
    );
    const addedRanges = rangesFromChars(addedChanged, added.indexes.length);
    removed.indexes.forEach((at, lineIndex) => {
      const ranges = removedRanges.at(lineIndex) ?? [];
      if (ranges.length > 0) result.set(at, ranges);
    });
    added.indexes.forEach((at, lineIndex) => {
      const ranges = addedRanges.at(lineIndex) ?? [];
      if (ranges.length > 0) result.set(at, ranges);
    });
  }
  return result;
}
