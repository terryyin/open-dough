// Syntax styling for a story-review file diff (`./StoryReviewFileDiff.tsx`):
// the file's path selects the grammar first (`./sourceHighlight.ts`); when
// that names none, an optional Intent `syntax` hint maps through the same
// `sourceLanguage` Intent source reading uses. Each side's whole text is
// tokenized once through the shared lifecycle (`./useSourceHighlight.ts`), so
// a comment or string opened outside a hunk styles the lines inside it. A
// removed line reads its token line from the old side and every other line
// from the new side, by line number; a line stays plain until its side's
// tokens arrive, or when they do not spell it.

import type { ReviewedFileText } from "./storyReviewContract.ts";
import {
  pathLanguage,
  sourceLanguage,
  type SourceTokenLine,
} from "./sourceHighlight.ts";
import type { DiffLine } from "./unifiedDiff.ts";
import { useSourceHighlight } from "./useSourceHighlight.ts";

export type DiffLineTokens = (line: DiffLine) => SourceTokenLine | undefined;

function tokenLineAt(
  side: readonly SourceTokenLine[] | undefined,
  number: number | undefined,
  text: string,
): SourceTokenLine | undefined {
  if (side === undefined || number === undefined) return undefined;
  const tokens = side[number - 1];
  if (tokens === undefined) return undefined;
  return tokens.map((token) => token.content).join("") === text
    ? tokens
    : undefined;
}

// The grammar a diff of `path` reads in: its path's grammar, else the hint's.
export function diffLanguage(
  path: string,
  syntaxHint?: string,
): string | undefined {
  return (
    pathLanguage(path) ??
    (syntaxHint === undefined ? undefined : sourceLanguage(syntaxHint, path))
  );
}

export function useDiffLineTokens(
  path: string,
  text: Extract<ReviewedFileText, { kind: "text" }> | undefined,
  syntaxHint?: string,
): DiffLineTokens {
  const language =
    text === undefined ? undefined : diffLanguage(path, syntaxHint);
  const oldSide = useSourceHighlight(text?.baseline ?? "", language);
  const newSide = useSourceHighlight(text?.tree ?? "", language);
  return (line) =>
    line.kind === "removed"
      ? tokenLineAt(oldSide, line.oldNumber, line.text)
      : tokenLineAt(newSide, line.newNumber, line.text);
}
