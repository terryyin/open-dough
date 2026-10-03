// Git's unified diff of one reviewed file, as a story review shows it
// (`./StoryReviewFileDiff.tsx`): its hunks and their lines, or that Git read
// the file as binary. Git's file headers (paths, modes, similarity, object
// IDs) are not shown; a diff without hunks has no textual diff to show.

export type DiffLine = {
  readonly kind: "added" | "removed" | "context";
  // The line without Git's leading marker.
  readonly text: string;
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
  " ": "context",
};

// Within a hunk every line starts with its marker, so a removed line that
// reads like a header (`--- x`) stays a removal; any other line ends it.
export function parsedUnifiedDiff(printed: string): UnifiedDiff {
  const hunks: { header: string; lines: DiffLine[] }[] = [];
  let hunk: (typeof hunks)[number] | undefined;
  let binary = false;
  for (const line of printed.split("\n")) {
    if (line.startsWith("@@")) {
      hunk = { header: line, lines: [] };
      hunks.push(hunk);
      continue;
    }
    const kind = lineKinds[line.charAt(0)];
    if (hunk !== undefined && kind !== undefined) {
      hunk.lines.push({ kind, text: line.slice(1) });
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
