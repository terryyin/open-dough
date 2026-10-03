// A story review's snapshot (`./storyReview.ts`) as its panel shows it: the
// worktree, its branch and the baseline it compares against, and the story's
// changed files with their change kinds in a file browser the developer can
// hide or show. Selecting a file reads its diff (`./StoryReviewFileDiff.tsx`).
// A worktree that matches its baseline says so in place of the browser.
// A refreshed snapshot keeps the browser as it was and the selected file
// while the new snapshot still lists its path.

import { useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import type { ReviewedFile, TakenStoryReview } from "./storyReview.ts";
import { FileDiff, type ReviewedStory } from "./StoryReviewFileDiff.tsx";

const kindWords: Record<ReviewedFile["kind"], string> = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
};

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

// How many files a snapshot lists, in words.
export const changedFiles = (count: number) =>
  `${String(count)} changed ${count === 1 ? "file" : "files"}`;

export function SnapshotView({
  reviewed,
  snapshot,
  headingId,
}: {
  readonly reviewed: ReviewedStory;
  readonly snapshot: TakenStoryReview;
  readonly headingId: string;
}) {
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [browserShown, setBrowserShown] = useState(true);
  const selected = snapshot.files.find((file) => file.path === selectedPath);
  const listName = changedFiles(snapshot.files.length);
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
      {snapshot.files.length === 0 ? (
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
              <ul aria-label={listName}>
                {snapshot.files.map((file) => (
                  <li key={file.path}>
                    <button
                      type="button"
                      aria-pressed={selected?.path === file.path}
                      onClick={() => {
                        setSelectedPath(file.path);
                      }}
                    >
                      <ReviewedFileName file={file} />
                    </button>
                  </li>
                ))}
              </ul>
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
                  // A new snapshot or file is a new read, never the last one's.
                  key={`${snapshot.tree}:${selected.path}`}
                  reviewed={reviewed}
                  snapshot={snapshot}
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
