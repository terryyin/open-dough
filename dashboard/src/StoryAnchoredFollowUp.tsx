// Follow up from a Done story's file header or line-number menu on a
// Published completion or landed run (`./FollowUp.tsx` session dialog): never
// a workspace snapshot. The file path offers a visible trigger; a line menu
// auto-opens the same dialog for one line and side.

import { useDoneStoryFollowUp } from "./doneStoryFollowUp.ts";
import type { DiffLineSide } from "./DiffLineNumber.tsx";
import type { FollowUpFileFacts } from "./followUpContext.ts";
import type { FollowUpFile } from "./followUpRequest.ts";
import { StoryFollowUpSession } from "./FollowUp.tsx";
import { usePageLaunches } from "./pageLaunches.ts";
import type { ReviewedFile } from "./storyReviewFiles.ts";
import type { ReviewedStory } from "./StoryReviewFileDiff.tsx";

// Request anchor and dialog facts for one reviewed file on a Published
// completion or landed run; undefined on a workspace snapshot.
export function fileFollowUpParts(
  reviewed: ReviewedStory,
  from: string,
  tree: string,
  file: ReviewedFile,
  line?: { readonly line: number; readonly side: DiffLineSide },
):
  | { readonly anchor: FollowUpFile; readonly facts: FollowUpFileFacts }
  | undefined {
  const comparison =
    reviewed.completion !== undefined
      ? ({ kind: "published", id: reviewed.completion } as const)
      : reviewed.reference !== undefined
        ? ({ kind: "landed", id: reviewed.reference } as const)
        : undefined;
  if (comparison === undefined) return undefined;
  const paths = {
    path: file.path,
    ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
  };
  const range = { baseline: from, tree };
  const lineAnchor =
    line === undefined ? {} : { line: line.line, side: line.side };
  return {
    anchor: {
      ...paths,
      ...range,
      ...lineAnchor,
      ...(comparison.kind === "published"
        ? { completion: comparison.id }
        : { reference: comparison.id }),
    },
    facts: { ...paths, ...range, kind: comparison.kind, ...lineAnchor },
  };
}

function DoneStoryAnchoredFollowUp({
  reviewed,
  from,
  tree,
  file,
  line,
  autoOpen = false,
  showTrigger = true,
  onClosed,
}: {
  readonly reviewed: ReviewedStory;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
  readonly line?: { readonly line: number; readonly side: DiffLineSide };
  readonly autoOpen?: boolean;
  readonly showTrigger?: boolean;
  readonly onClosed?: () => void;
}) {
  const launches = usePageLaunches();
  const target = useDoneStoryFollowUp(reviewed.identity);
  const parts = fileFollowUpParts(reviewed, from, tree, file, line);
  if (target === undefined || parts === undefined) return null;
  return (
    <StoryFollowUpSession
      story={target.story}
      revision={target.revision}
      sessions={target.sessions}
      project={target.project}
      sourceId={target.sourceId}
      launches={launches}
      file={parts}
      autoOpen={autoOpen}
      showTrigger={showTrigger}
      {...(onClosed === undefined ? {} : { onClosed })}
    />
  );
}

// Follow up from a Done story's file header in Review changes or Intent.
export function StoryFileFollowUp({
  reviewed,
  from,
  tree,
  file,
}: {
  readonly reviewed: ReviewedStory;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
}) {
  return (
    <DoneStoryAnchoredFollowUp
      reviewed={reviewed}
      from={from}
      tree={tree}
      file={file}
    />
  );
}

// Follow up from a Done story's line-number menu: same dialog as the file
// header for one line and side; unmounts when the dialog closes.
export function StoryLineFollowUp({
  reviewed,
  from,
  tree,
  file,
  line,
  side,
  onClosed,
}: {
  readonly reviewed: ReviewedStory;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
  readonly line: number;
  readonly side: DiffLineSide;
  readonly onClosed: () => void;
}) {
  return (
    <DoneStoryAnchoredFollowUp
      reviewed={reviewed}
      from={from}
      tree={tree}
      file={file}
      line={{ line, side }}
      autoOpen
      showTrigger={false}
      onClosed={onClosed}
    />
  );
}
