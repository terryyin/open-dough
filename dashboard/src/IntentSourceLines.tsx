// Intent Purpose source pane (`./IntentBrowser.tsx`): path and observed
// revision beside the shared whole-file source-lines view. The location's
// kind names the Shiki grammar; styling arrives when that highlighter is ready.

import { SourceLines } from "./SourceLines.tsx";
import "./intent-source-lines.css";

export function IntentSourceLines({
  text,
  revision,
  path,
  language,
}: {
  readonly text: string;
  readonly revision: string;
  readonly path: string;
  readonly language?: string;
}) {
  return (
    <div className="intent-source">
      <p className="intent-source-meta">
        <code>{path}</code> at revision <code>{revision.slice(0, 7)}</code>
      </p>
      <SourceLines
        text={text}
        {...(language === undefined ? {} : { language })}
        aria-label={`${path} source`}
      />
    </div>
  );
}
