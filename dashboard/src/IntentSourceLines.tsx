// Intent Purpose source pane (`./IntentFileReading.tsx`): path and observed
// revision beside the shared whole-file source-lines view. The location's
// kind and path select the Shiki language (`sourceLanguage`); styling
// arrives when that highlighter is ready. An optional case target from the
// Intent selection positions Purpose on that case's line when unique.

import { resolveCaseTargetLine } from "./intentCaseTargetLine.ts";
import { SourceLines } from "./SourceLines.tsx";
import { sourceLanguage } from "./sourceHighlight.ts";
import "./intent-source-lines.css";

export function IntentSourceLines({
  text,
  revision,
  path,
  language,
  caseTarget,
}: {
  readonly text: string;
  readonly revision: string;
  readonly path: string;
  readonly language?: string;
  readonly caseTarget?: string;
}) {
  const highlightLanguage =
    language === undefined ? undefined : sourceLanguage(language, path);
  const targetLine =
    caseTarget === undefined
      ? undefined
      : resolveCaseTargetLine(text, caseTarget);
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
