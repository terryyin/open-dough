// Whole-file source text with line numbers for Intent Purpose reading and,
// later, other readers. Plain text shows immediately; when `language` is
// set, Shiki token colours arrive without delaying that text, and a failed
// grammar load leaves the lines plain with no error.

import { useEffect, useState } from "react";
import {
  highlightSourceLines,
  type SourceTokenLine,
} from "./sourceHighlight.ts";
import "./source-lines.css";

function LineText({
  line,
  tokens,
}: {
  readonly line: string;
  readonly tokens: SourceTokenLine | undefined;
}) {
  if (tokens === undefined) {
    return <code className="source-line-text">{line}</code>;
  }
  return (
    <code className="source-line-text">
      {tokens.map((token, index) => (
        <span
          key={index}
          style={token.color === undefined ? undefined : { color: token.color }}
        >
          {token.content}
        </span>
      ))}
    </code>
  );
}

export function SourceLines({
  text,
  language,
  "aria-label": ariaLabel,
}: {
  readonly text: string;
  readonly language?: string;
  readonly "aria-label": string;
}) {
  const lines = text.length === 0 ? [""] : text.split("\n");
  // A trailing newline leaves an empty final segment; keep it so the last
  // blank line is visible, matching the published file.
  const digits = String(lines.length).length;
  const [tokenLines, setTokenLines] = useState<
    readonly SourceTokenLine[] | undefined
  >(undefined);

  useEffect(() => {
    if (language === undefined) {
      setTokenLines(undefined);
      return;
    }
    let cancelled = false;
    setTokenLines(undefined);
    void highlightSourceLines(text, language).then((tokens) => {
      if (!cancelled && tokens !== undefined) setTokenLines(tokens);
    });
    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return (
    <pre
      className="source-lines"
      style={{ ["--line-number-digits" as string]: String(digits) }}
      tabIndex={0}
      aria-label={ariaLabel}
    >
      {lines.map((line, index) => (
        <div key={index} className="source-line">
          <span className="source-line-number" aria-hidden="true">
            {index + 1}
          </span>
          <LineText line={line} tokens={tokenLines?.[index]} />
        </div>
      ))}
    </pre>
  );
}
