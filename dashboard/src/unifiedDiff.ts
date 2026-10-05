// Git's unified diff of one reviewed file, as a story review shows it
// (`./StoryReviewFileDiff.tsx`): its hunks and their lines, or that Git read
// the file as binary. Git's file headers (paths, modes, similarity, object
// IDs) are not shown; a diff without hunks has no textual diff to show. Each
// line carries its numbers in the old and new file, counted from its hunk's
// header.

export type DiffLine = {
  readonly kind: "added" | "removed" | "unchanged";
  // The line without Git's leading marker.
  readonly text: string;
  // Its line number in the old file, for an unchanged or removed line.
  readonly oldNumber?: number;
  // Its line number in the new file, for an unchanged or added line.
  readonly newNumber?: number;
  // Git noted that this line ends its side of the file without a newline.
  readonly noNewlineAtEnd?: true;
};

export type DiffHunk = {
  // Git's `@@ -old +new @@` line, with any section heading it printed.
  readonly header: string;
  readonly lines: readonly DiffLine[];
};

export type UnifiedDiff = {
  readonly binary: boolean;
  readonly hunks: readonly DiffHunk[];
};

const lineKinds: Partial<Record<string, DiffLine["kind"]>> = {
  "+": "added",
  "-": "removed",
  " ": "unchanged",
};

// Where a hunk starts in the old and new file, from its `@@ -old[,count]
// +new[,count] @@` header; any other line is not a hunk header.
function hunkStarts(line: string) {
  const starts = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
  return starts === null
    ? undefined
    : { old: Number(starts[1]), new: Number(starts[2]) };
}

// Within a hunk every line starts with its marker, so a removed line that
// reads like a header (`--- x`) stays a removal; any other line ends it.
// Lines are numbered from where their hunk starts: an unchanged line
// advances both numbers, a removed line the old, an added line the new.
export function parsedUnifiedDiff(printed: string): UnifiedDiff {
  const hunks: DiffHunk[] = [];
  let hunk:
    { lines: DiffLine[]; next: { old: number; new: number } } | undefined;
  let binary = false;
  for (const line of printed.split("\n")) {
    const starts = hunkStarts(line);
    if (starts !== undefined) {
      hunk = { lines: [], next: starts };
      hunks.push({ header: line, lines: hunk.lines });
      continue;
    }
    const kind = lineKinds[line.charAt(0)];
    if (hunk !== undefined && kind !== undefined) {
      const { next } = hunk;
      hunk.lines.push({
        kind,
        text: line.slice(1),
        ...(kind === "added" ? {} : { oldNumber: next.old++ }),
        ...(kind === "removed" ? {} : { newNumber: next.new++ }),
      });
      continue;
    }
    if (hunk !== undefined && line.startsWith("\\")) {
      const last = hunk.lines.pop();
      if (last !== undefined)
        hunk.lines.push({ ...last, noNewlineAtEnd: true });
      continue;
    }
    hunk = undefined;
    if (/^Binary files .* differ$/.test(line)) binary = true;
  }
  return { binary, hunks };
}
