// Whole-file source text with line numbers for Intent Purpose reading and,
// later, other readers. Plain text shows immediately; when `language` is
// set, Shiki token colours arrive without delaying that text, and a failed
// grammar load leaves the lines plain with no error. Light and dark token
// colours ride as CSS custom properties so a system appearance change updates
// already rendered text without a new fetch or tokenization. An optional
// 1-based `targetLine` identifies and scrolls that case into view.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  highlightSourceLines,
  type SourceTokenLine,
} from "./sourceHighlight.ts";
import "./source-lines.css";

function tokenStyle(token: SourceTokenLine[number]): CSSProperties | undefined {
  if (token.light === undefined && token.dark === undefined) return undefined;
  return {
    ...(token.light === undefined ? {} : { ["--shiki-light"]: token.light }),
    ...(token.dark === undefined ? {} : { ["--shiki-dark"]: token.dark }),
  } as CSSProperties;
}

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
        <span key={index} className="source-token" style={tokenStyle(token)}>
          {token.content}
        </span>
      ))}
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
  const [tokenLines, setTokenLines] = useState<
    readonly SourceTokenLine[] | undefined
  >(undefined);
  const targetRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (targetLine === undefined) return;
    targetRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [targetLine, text, tokenLines]);

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
