// Intent Purpose source pane (`./IntentFileReading.tsx`): path and observed
// revision beside the shared whole-file source-lines view. The file's syntax
// hint (`./intentLocationSelection.ts`) and path select the Shiki language
// (`sourceLanguage`); styling arrives when that highlighter is ready. An
// optional target line, the opened case's (`./IntentFileReading.tsx`),
// positions Purpose on it.

import { SourceLines } from "./SourceLines.tsx";
import { sourceLanguage } from "./sourceHighlight.ts";
import "./intent-source-lines.css";

export function IntentSourceLines({
  text,
  revision,
  path,
  syntaxHint,
  targetLine,
}: {
  readonly text: string;
  readonly revision: string;
  readonly path: string;
  readonly syntaxHint?: string;
  readonly targetLine?: number;
}) {
  const highlightLanguage =
    syntaxHint === undefined ? undefined : sourceLanguage(syntaxHint, path);
  return (
    <div className="intent-source">
      <p className="intent-source-meta">
        <code>{path}</code> at revision <code>{revision.slice(0, 7)}</code>
      </p>
      <SourceLines
        text={text}
        {...(highlightLanguage === undefined
          ? {}
          : { language: highlightLanguage })}
        {...(targetLine === undefined ? {} : { targetLine })}
        aria-label={`${path} source`}
      />
    </div>
  );
}
