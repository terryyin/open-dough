// One story-review diff line's code text: plain or syntax tokens, with
// word-emphasis ranges (`./diffWordEmphasis.ts`) as <del>/<ins> split at the
// same character offsets. Unemphasized token lines still render through
// Intent's shared `./SourceTokens.tsx` so its output stays unchanged.

import type { ReactNode } from "react";
import type { EmphasizedRange } from "./diffWordEmphasis.ts";
import type { SourceTokenColors, SourceTokenLine } from "./sourceHighlight.ts";
import { SourceTokens, tokenStyle } from "./SourceTokens.tsx";
import type { DiffLine } from "./unifiedDiff.ts";

// Token pieces whose content overlaps [from, to) in the line's code text.
function tokenPiecesInRange(
  tokens: SourceTokenLine,
  from: number,
  to: number,
): { content: string; token: SourceTokenColors }[] {
  const pieces: { content: string; token: SourceTokenColors }[] = [];
  let at = 0;
  for (const token of tokens) {
    const end = at + token.content.length;
    const start = Math.max(from, at);
    const stop = Math.min(to, end);
    if (start < stop) {
      pieces.push({
        content: token.content.slice(start - at, stop - at),
        token,
      });
    }
    at = end;
  }
  return pieces;
}

// Plain line text with emphasized runs as deletions or insertions.
function emphasizedPlainText(
  text: string,
  ranges: readonly EmphasizedRange[],
  kind: "added" | "removed",
) {
  if (ranges.length === 0) return text;
  const Mark = kind === "added" ? "ins" : "del";
  const parts: ReactNode[] = [];
  let at = 0;
  ranges.forEach((range, index) => {
    if (range.start > at) parts.push(text.slice(at, range.start));
    parts.push(<Mark key={index}>{text.slice(range.start, range.end)}</Mark>);
    at = range.end;
  });
  if (at < text.length) parts.push(text.slice(at));
  return parts;
}

// Syntax tokens with the same emphasized runs: each range wraps token spans
// split at its boundaries so colours stay on the emphasized words.
function emphasizedTokenSpans(
  tokens: SourceTokenLine,
  ranges: readonly EmphasizedRange[],
  kind: "added" | "removed",
) {
  const Mark = kind === "added" ? "ins" : "del";
  const parts: ReactNode[] = [];
  let key = 0;
  let at = 0;
  const total = tokens.reduce((sum, token) => sum + token.content.length, 0);

  const render = (from: number, to: number, marked: boolean) => {
    const pieces = tokenPiecesInRange(tokens, from, to);
    if (pieces.length === 0) return;
    const spans = pieces.map((piece) => (
      <span
        key={key++}
        className="source-token"
        style={tokenStyle(piece.token)}
      >
        {piece.content}
      </span>
    ));
    if (marked) parts.push(<Mark key={key++}>{spans}</Mark>);
    else parts.push(...spans);
  };

  for (const range of ranges) {
    if (range.start > at) render(at, range.start, false);
    render(range.start, range.end, true);
    at = range.end;
  }
  if (at < total) render(at, total, false);
  return parts;
}

export function diffLineCode(
  line: DiffLine,
  tokens: SourceTokenLine | undefined,
  emphasis: readonly EmphasizedRange[],
) {
  if (line.kind === "unchanged" || emphasis.length === 0) {
    return tokens === undefined ? line.text : <SourceTokens tokens={tokens} />;
  }
  if (tokens === undefined) {
    return emphasizedPlainText(line.text, emphasis, line.kind);
  }
  return emphasizedTokenSpans(tokens, emphasis, line.kind);
}
