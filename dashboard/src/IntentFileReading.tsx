// Purpose of the selected file (`./IntentSelectionReading.tsx`), filling the
// reading area, which scrolls it. Opening from the candidates record starts a
// fresh reading positioned on its case. The file read is the browser's. A file
// the selected story changed (`./intentStoryOverlay.ts`) shows Review changes'
// own diff of it as its Purpose (`storyDiffOf`), and the browser reads no
// published text for it; a file the published revision does not list is never
// read there. Text of an earlier revision whose update failed stays readable
// under that failure and its Retry.

import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import { resolveCaseTargetLine } from "./intentCaseTargetLine.ts";
import { shortRevision } from "./publishedWork.ts";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import type { ComparedStory } from "./IntentStorySummary.tsx";
import { diffStartOf } from "./storyComparisonShown.ts";
import { FileDiff } from "./StoryReviewFileDiff.tsx";
import { ReviewedFileName } from "./StoryReviewSnapshotView.tsx";
import "./intent-file-reading.css";

export type FileRead =
  | { readonly path: string; readonly state: "failed" }
  | { readonly path: string; readonly state: "ready"; readonly text: string };

// The selected story's change of the selected file, when its Purpose is that
// change's diff rather than the file's published text.
export function storyDiffOf(
  story: ComparedStory | undefined,
  treeFile: IntentTreeFile | undefined,
) {
  return story === undefined ? undefined : treeFile?.change;
}

export function IntentFileReading({
  path,
  revision,
  read,
  kind,
  caseTarget,
  treeFile,
  story,
  onFileRetry,
  failedRevision,
}: {
  // The selected file's path.
  readonly path: string;
  // The revision of the text shown, and a later one whose read failed.
  readonly revision: string;
  readonly failedRevision?: string | undefined;
  // The answered read of `path`, or undefined while it is being read.
  readonly read: FileRead | undefined;
  readonly kind: string | undefined;
  readonly caseTarget: string | undefined;
  // The selected file as the location's tree shows it.
  readonly treeFile: IntentTreeFile | undefined;
  readonly story: ComparedStory | undefined;
  readonly onFileRetry: () => void;
}) {
  const text = read?.state === "ready" ? read.text : undefined;
  // The opened case's line, which Purpose positions on.
  const targetLine =
    text === undefined || caseTarget === undefined
      ? undefined
      : resolveCaseTargetLine(text, caseTarget);
  const change = storyDiffOf(story, treeFile);
  // The selected change's *from* tree, as Review changes reads it.
  const changeFrom =
    story === undefined ? "" : diffStartOf(story.shown.comparison, change);

  return (
    <section className="intent-purpose" aria-label="Purpose">
      <h3 className="visually-hidden">Purpose</h3>
      {story !== undefined && change !== undefined ? (
        <div className="intent-story-diff">
          <p className="intent-story-diff-name">
            <ReviewedFileName file={change} />
          </p>
          <FileDiff
            // A new comparison or file is a new read.
            key={`${changeFrom}:${story.shown.tree}:${change.path}`}
            reviewed={story.shown.reviewed}
            from={changeFrom}
            tree={story.shown.tree}
            file={change}
          />
        </div>
      ) : read?.state === "failed" ? (
        <p className="intent-file-problem" role="alert">
          {path} could not be read.{" "}
          <button type="button" onClick={onFileRetry}>
            Retry
          </button>
        </p>
      ) : text !== undefined ? (
        <>
          {failedRevision !== undefined && (
            <p className="intent-file-problem" role="alert">
              {path} could not be read at revision{" "}
              <code>{shortRevision(failedRevision)}</code>; showing{" "}
              <code>{shortRevision(revision)}</code>.{" "}
              <button type="button" onClick={onFileRetry}>
                Retry
              </button>
            </p>
          )}
          <IntentSourceLines
            text={text}
            revision={revision}
            path={path}
            {...(kind === undefined ? {} : { language: kind })}
            {...(targetLine === undefined ? {} : { targetLine })}
          />
        </>
      ) : (
        <p className="quiet">Reading {path}…</p>
      )}
    </section>
  );
}
