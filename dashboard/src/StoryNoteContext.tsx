// The immutable context a saved note keeps, also shown before an edit.
import type { StoryNoteContext as Context } from "./storyNote.ts";
export function StoryNoteContext({
  title,
  identity,
  context,
}: {
  readonly title: string;
  readonly identity: string;
  readonly context: Context | undefined;
}) {
  return (
    <div className="story-note-context">
      <p>
        {title} · {identity}
      </p>
      {context && (
        <>
          <p>{context.view}</p>
          <p>
            {context.oldPath
              ? `${context.oldPath} → ${context.path}`
              : context.path}
          </p>
          <p>
            {context.comparison.name} {context.comparison.baseline} →{" "}
            {context.comparison.tree}
          </p>
          {context.line && (
            <>
              <p>
                Line {context.line.number} · {context.line.side}
              </p>
              <pre>{context.line.text}</pre>
            </>
          )}
        </>
      )}
    </div>
  );
}
