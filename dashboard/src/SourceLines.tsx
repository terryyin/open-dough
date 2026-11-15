// Whole-file source text with line numbers for Intent Purpose reading and,
// later, other readers. Plain text shows immediately; when `language` is
// set, Shiki token colours arrive without delaying that text, and a failed
// grammar load leaves the lines plain with no error (`./useSourceHighlight.ts`).
// Tokens render through the shared `./SourceTokens.tsx`, whose colours follow
// a system appearance change without a new fetch or tokenization. An optional
// 1-based `targetLine` identifies and scrolls that case into view.

import { useEffect, useRef } from "react";
import type { SourceTokenLine } from "./sourceHighlight.ts";
import { SourceTokens } from "./SourceTokens.tsx";
import { useSourceHighlight } from "./useSourceHighlight.ts";
import "./source-lines.css";

function LineText({
  line,
  tokens,
}: {
  readonly line: string;
  readonly tokens: SourceTokenLine | undefined;
}) {
  return (
    <code className="source-line-text">
      {tokens === undefined ? line : <SourceTokens tokens={tokens} />}
    </code>
  );
}

export function SourceLines({
  text,
  language,
  targetLine,
  "aria-label": ariaLabel,
}: {
  readonly text: string;
  // Shiki language id (from `sourceLanguage` for Intent syntax hints).
  readonly language?: string;
  /** 1-based line to identify and bring into view. */
  readonly targetLine?: number;
  readonly "aria-label": string;
}) {
  const lines = text.length === 0 ? [""] : text.split("\n");
  // A trailing newline leaves an empty final segment; keep it so the last
  // blank line is visible, matching the published file.
  const digits = String(lines.length).length;
  const tokenLines = useSourceHighlight(text, language);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (targetLine === undefined) return;
    targetRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    // Highlighting only colours the same text; its later arrival must not
    // move the reader back after they have scrolled away from this case.
  }, [targetLine, text]);

  return (
    <pre
      className="source-lines"
      style={{ ["--line-number-digits" as string]: String(digits) }}
      tabIndex={0}
      aria-label={ariaLabel}
    >
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        const isTarget = targetLine === lineNumber;
        return (
          <div
            key={index}
            ref={isTarget ? targetRef : undefined}
            className={isTarget ? "source-line is-target" : "source-line"}
            data-line={lineNumber}
            {...(isTarget ? { "aria-current": "location" as const } : {})}
          >
            <span className="source-line-number" aria-hidden="true">
              {lineNumber}
            </span>
            <LineText line={line} tokens={tokenLines?.[index]} />
          </div>
        );
      })}
    </pre>
  );
}
