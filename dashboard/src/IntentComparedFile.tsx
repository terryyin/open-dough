import type { ReactNode, RefObject } from "react";
import {
  diffStartOf,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import { useProjects } from "./projectList.tsx";
import { useReviewDiffSyntaxHint } from "./reviewDiffSyntaxHint.ts";
import { pathLanguage } from "./sourceHighlight.ts";
import { FileDiff } from "./StoryReviewFileDiff.tsx";
import { ReviewedFileHeader } from "./StoryReviewFileHeader.tsx";
import { StoryNoteComparison } from "./StoryDiffNote.tsx";
import type { ReviewedFile } from "./storyReviewFiles.ts";

export function IntentComparedFile({
  story,
  file,
  syntaxHint,
  moves,
  readingArea,
}: {
  readonly story: ShownStoryComparison;
  readonly file: ReviewedFile;
  readonly syntaxHint: string | undefined;
  readonly moves: ReactNode;
  readonly readingArea: RefObject<HTMLElement | null>;
}) {
  const from = diffStartOf(story.comparison, file);
  const { reviewed, tree } = story;
  const source = useProjects().find(
    (project) => project.id === reviewed.subject.source,
  );
  const settingsRevision =
    pathLanguage(file.path) === undefined
      ? (reviewed.completion ?? reviewed.publishedHead ?? tree)
      : undefined;
  const pinnedSyntax = useReviewDiffSyntaxHint(
    source,
    settingsRevision,
    file.path,
  );
  const syntax = pinnedSyntax ?? syntaxHint;
  return (
    <StoryNoteComparison.Provider value="All changes">
      <div className="intent-story-diff">
        <ReviewedFileHeader
          reviewed={reviewed}
          from={from}
          tree={tree}
          file={file}
          moves={moves}
        />
        <FileDiff
          key={`${from}:${tree}:${file.path}`}
          reviewed={reviewed}
          from={from}
          tree={tree}
          file={file}
          readingArea={readingArea}
          {...(syntax === undefined ? {} : { syntaxHint: syntax })}
        />
      </div>
    </StoryNoteComparison.Provider>
  );
}
