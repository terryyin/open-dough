// Split Locations (or similar) prose into plain text and matched references
// for Intent candidates (`./intentCandidatesLocationMatch.ts`). Markdown link
// targets resolve relative to the record; backtick bodies match as recorded.

import {
  matchRecordedLocationReference,
  type IntentConfiguredInventory,
  type MatchedLocationTarget,
} from "./intentCandidatesLocationMatch.ts";

export type LocationTextSegment =
  | { readonly kind: "text"; readonly text: string }
  | {
      readonly kind: "reference";
      readonly recorded: string;
      readonly label: string;
      readonly match: MatchedLocationTarget;
    };

const markdownLink = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const backtickSpan = /`([^`]+)`/g;

type Span = {
  readonly start: number;
  readonly end: number;
  readonly recorded: string;
  readonly label: string;
};

function collectSpans(text: string): Span[] {
  const spans: Span[] = [];
  markdownLink.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = markdownLink.exec(text)) !== null) {
    const [whole, label, target] = match;
    if (label === undefined || target === undefined) continue;
    spans.push({
      start: match.index,
      end: match.index + whole.length,
      recorded: target,
      label,
    });
  }
  backtickSpan.lastIndex = 0;
  while ((match = backtickSpan.exec(text)) !== null) {
    const [whole, body] = match;
    if (body === undefined) continue;
    const start = match.index;
    const end = start + whole.length;
    if (spans.some((span) => start < span.end && end > span.start)) {
      continue;
    }
    spans.push({
      start,
      end,
      recorded: body,
      label: body,
    });
  }
  return spans.sort((a, b) => a.start - b.start);
}

/**
 * Split Locations (or similar) prose into plain text and matched references.
 * Markdown link targets resolve relative to `recordPath`; backtick bodies do
 * not — they are repository paths or bare names as recorded.
 */
export function segmentLocationReferences(
  text: string,
  recordPath: string,
  inventory: IntentConfiguredInventory,
): LocationTextSegment[] {
  const spans = collectSpans(text);
  const segments: LocationTextSegment[] = [];
  let last = 0;
  for (const span of spans) {
    if (span.start > last) {
      segments.push({ kind: "text", text: text.slice(last, span.start) });
    }
    // Relative Markdown targets (`../…`) resolve beside the record; backtick
    // full paths and bare names match as written.
    const match = matchRecordedLocationReference(
      span.recorded,
      recordPath,
      inventory,
    );
    segments.push({
      kind: "reference",
      recorded: span.recorded,
      label: span.label,
      match,
    });
    last = span.end;
  }
  if (last < text.length) {
    segments.push({ kind: "text", text: text.slice(last) });
  }
  return segments;
}
