// Exact published source text with line numbers for Intent Purpose reading
// (`./IntentBrowser.tsx`). Styling arrives later; line numbers sit
// outside the selectable text so copying yields the source alone.

import "./intent-source-lines.css";

export function IntentSourceLines({
  text,
  revision,
  path,
}: {
  readonly text: string;
  readonly revision: string;
  readonly path: string;
}) {
  const lines = text.length === 0 ? [""] : text.split("\n");
  // A trailing newline leaves an empty final segment; keep it so the last
  // blank line is visible, matching the published file.
  const digits = String(lines.length).length;
  return (
    <div className="intent-source">
      <p className="intent-source-meta">
        <code>{path}</code> at revision <code>{revision.slice(0, 7)}</code>
      </p>
      <pre
        className="intent-source-lines"
        style={{ ["--line-number-digits" as string]: String(digits) }}
        tabIndex={0}
        aria-label={`${path} source`}
      >
        {lines.map((line, index) => (
          <div key={index} className="intent-source-line">
            <span className="intent-source-line-number" aria-hidden="true">
              {index + 1}
            </span>
            <code className="intent-source-line-text">{line}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}
