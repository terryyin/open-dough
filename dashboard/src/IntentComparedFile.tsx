import type { ReactNode, RefObject } from "react";
import {
  diffStartOf,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import { FileDiff } from "./StoryReviewFileDiff.tsx";
import { ReviewedFileHeader } from "./StoryReviewFileHeader.tsx";
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
  return (
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
        {...(syntaxHint === undefined ? {} : { syntaxHint })}
      />
    </div>
  );
}
