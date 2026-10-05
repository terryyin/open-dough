// A story review's snapshot (`./storyReview.ts`) as its panel shows it: the
// worktree, its branch and the baseline it compares against, and the story's
// changed files with their change kinds in a file browser the developer can
// hide or show. The browser shows each file by name under folders that
// collapse and expand (`./StoryReviewFileTree.tsx`). Selecting a file reads
// its diff (`./StoryReviewFileDiff.tsx`), headed by its kind and full path.
// The browser lists the comparison shown: all changes from the baseline, or
// the changes since the review from the marked tree. A worktree that matches
// its baseline, or a snapshot that matches the marked one, says so in place
// of the browser.
// A refreshed snapshot keeps the browser as it was, its collapsed folders,
// and the selected file while the new snapshot still lists their paths.

import { useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import { reviewFileTree } from "./reviewFileTree.ts";
import type {
  ReviewComparison,
  ReviewedFile,
  TakenStoryReview,
} from "./storyReview.ts";
import { FileDiff, type ReviewedStory } from "./StoryReviewFileDiff.tsx";
import { changedFiles, FileTree, kindWords } from "./StoryReviewFileTree.tsx";

function ReviewedFileName({ file }: { readonly file: ReviewedFile }) {
  return (
    <>
      <span className="story-review-kind">{kindWords[file.kind]}</span>{" "}
      {file.kind === "renamed" ? (
        <>
          <code>{file.oldPath}</code> → <code>{file.path}</code>
        </>
      ) : (
        <code>{file.path}</code>
      )}
    </>
  );
}

export function SnapshotView({
  reviewed,
  snapshot,
  comparison,
  sinceReview,
  headingId,
}: {
  readonly reviewed: ReviewedStory;
  readonly snapshot: TakenStoryReview;
  // The comparison shown, and whether it is the changes since the review.
  readonly comparison: ReviewComparison;
  readonly sinceReview: boolean;
  readonly headingId: string;
}) {
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  // Folders collapsed by path; every folder starts expanded on each opening,
  // and a refreshed snapshot keeps those it still has collapsed.
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [browserShown, setBrowserShown] = useState(true);
  const { files } = comparison;
  const selected = files.find((file) => file.path === selectedPath);
  const listName = changedFiles(files.length);
  const browserId = `${headingId}-files`;
  const diffHeadingId = `${headingId}-diff`;
  return (
    <>
      <dl className="story-review-facts">
        <div>
          <dt>Worktree</dt>
          <dd>
            <code>{snapshot.workspace}</code>
          </dd>
        </div>
        <div>
          <dt>Branch</dt>
          <dd>
            <code>{snapshot.branch}</code>
          </dd>
        </div>
        <div>
          <dt>Baseline</dt>
          <dd>
            <code>{snapshot.baseline}</code>, where{" "}
            <code>{snapshot.branch}</code> meets{" "}
            <code>
              {snapshot.remote}/{snapshot.target}
            </code>
          </dd>
        </div>
      </dl>
      {files.length === 0 && sinceReview ? (
        <p>Nothing changed since the review.</p>
      ) : files.length === 0 ? (
        <p>
          No changes: the worktree matches baseline{" "}
          <code>{shortRevision(snapshot.baseline)}</code>.
        </p>
      ) : (
        <>
          <div>
            <button
              type="button"
              className="start-launch-button"
              aria-expanded={browserShown}
              aria-controls={browserId}
              onClick={() => {
                setBrowserShown(!browserShown);
              }}
            >
              {browserShown ? "Hide files" : "Show files"}
            </button>
          </div>
          <div className="story-review-workarea">
            <section
              id={browserId}
              className="story-review-files"
              aria-labelledby={`${browserId}-heading`}
              hidden={!browserShown}
            >
              <h3 id={`${browserId}-heading`}>{listName}</h3>
              <FileTree
                label={listName}
                nodes={reviewFileTree(files)}
                selectedPath={selected?.path}
                onSelect={setSelectedPath}
                collapsed={collapsed}
                onToggle={(folderPath) => {
                  setCollapsed((was) => {
                    const next = new Set(was);
                    if (!next.delete(folderPath)) next.add(folderPath);
                    return next;
                  });
                }}
                idPrefix={browserId}
              />
            </section>
            <section
              className="story-review-diff"
              aria-labelledby={diffHeadingId}
            >
              <h3 id={diffHeadingId}>
                {selected === undefined ? (
                  "Diff"
                ) : (
                  <ReviewedFileName file={selected} />
                )}
              </h3>
              {selected === undefined ? (
                <p className="quiet">Select a file to read its diff.</p>
              ) : (
                <FileDiff
                  // A new comparison or file is a new read, never the last
                  // one's.
                  key={`${comparison.from}:${snapshot.tree}:${selected.path}`}
                  reviewed={reviewed}
                  from={comparison.from}
                  tree={snapshot.tree}
                  file={selected}
                />
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
