// A story review's snapshot (`./storyReview.ts`) as its panel's body shows
// it, beneath the context line (`./StoryReviewContextLine.tsx`): the story's
// changed files in the comparison shown, with their change kinds, in a file
// browser the developer can hide or show. The browser shows each file by
// name under folders that collapse and expand (`./StoryReviewFileTree.tsx`).
// The browser lists the comparison shown: all changes from the baseline, or
// the changes since the review from the restated marked tree, a flagged
// file's from the marked tree, or from the baseline when the story kept it
// as marked. The review opens on the first file in the browser's order.
// Selecting a file reads its diff (`./StoryReviewFileDiff.tsx`) from its
// *from* tree, headed by its kind and full path and flagged when it includes
// trunk's changes since the review, shown from the top while the browser
// keeps its scroll; the two fill the review's body, each scrolling on its
// own. A worktree that matches its baseline, or a snapshot that matches the
// marked one, says so in place of the browser; after trunk was integrated
// since the mark, it says nothing changed beyond what trunk now holds, since
// story work that reached trunk counts as trunk's. A refreshed snapshot, or
// the other comparison, keeps the browser as it was, its collapsed folders,
// and the selected file while the files shown still list their paths;
// otherwise the first file shown is selected. Previous file and Next file
// beside the diff's heading move the selection in the browser's order
// (`./StoryReviewFileMoves.tsx`), expanding the folders that hold the file
// moved to and scrolling the browser to bring its row into view.

import { useLayoutEffect, useRef, useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import { reviewFileOrder, reviewFileTree } from "./reviewFileTree.ts";
import {
  trunkIntegratedSince,
  type ReviewComparison,
  type ReviewedFile,
  type TakenStoryReview,
} from "./storyReview.ts";
import type { FileBrowserPlace } from "./StoryReviewContextLine.tsx";
import { FileDiff, type ReviewedStory } from "./StoryReviewFileDiff.tsx";
import { FileMoves, revealRow } from "./StoryReviewFileMoves.tsx";
import {
  changedFiles,
  FileTree,
  includesTrunkWords,
  kindWords,
} from "./StoryReviewFileTree.tsx";

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
      {file.includesTrunkFrom !== undefined && (
        <span className="story-review-trunk">, {includesTrunkWords}</span>
      )}
    </>
  );
}

// What the review says in place of the browser when the comparison shown
// lists no files.
function NoChanges({
  snapshot,
  sinceReview,
  commitsReview,
}: {
  readonly snapshot?: TakenStoryReview;
  readonly sinceReview: boolean;
  readonly commitsReview: boolean;
}) {
  if (snapshot === undefined)
    return (
      <p>
        No changes: this landed one-shot run has an empty delivered comparison.
      </p>
    );
  if (commitsReview) return <p>The chosen commits changed nothing.</p>;
  if (!sinceReview)
    return (
      <p>
        No changes: the worktree matches baseline{" "}
        <code>{shortRevision(snapshot.baseline)}</code>.
      </p>
    );
  return (
    <p>
      {snapshot.mark !== undefined &&
      trunkIntegratedSince(snapshot.mark, snapshot.baseline)
        ? "Nothing changed since the review beyond what trunk now holds."
        : "Nothing changed since the review."}
    </p>
  );
}

export function SnapshotView({
  reviewed,
  snapshot,
  comparison,
  sinceReview,
  headingId,
  browser,
  tree: comparedTree,
  commitsReview = false,
}: {
  readonly reviewed: ReviewedStory;
  readonly snapshot?: TakenStoryReview;
  // The comparison shown, and whether it is the changes since the review.
  readonly comparison: ReviewComparison;
  readonly sinceReview: boolean;
  readonly headingId: string;
  readonly browser: FileBrowserPlace;
  readonly tree: string;
  readonly commitsReview?: boolean;
}) {
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  // Folders collapsed by path; every folder starts expanded on each opening,
  // and a refreshed snapshot keeps those it still has collapsed.
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const { files } = comparison;
  const tree = reviewFileTree(files);
  const order = reviewFileOrder(tree);
  const selected = files.find((file) => file.path === selectedPath) ?? order[0];
  // The first file stays selected once shown, so a later snapshot that lists
  // an earlier selection again does not return to it.
  if (selected !== undefined && selected.path !== selectedPath)
    setSelectedPath(selected.path);
  // The selected file's *from* tree.
  const from = selected?.includesTrunkFrom ?? comparison.from;
  // A move asks for its file's row to be brought into view once shown.
  const browserPane = useRef<HTMLElement>(null);
  const revealing = useRef(false);
  const shownPath = selected?.path;
  useLayoutEffect(() => {
    if (!revealing.current) return;
    revealing.current = false;
    const row = browserPane.current?.querySelector(
      'button[aria-pressed="true"]',
    );
    if (browserPane.current && row) revealRow(browserPane.current, row);
  }, [shownPath]);
  const moveTo = (file: ReviewedFile) => {
    setCollapsed((was) => {
      const holders = [...was].filter((folder) =>
        file.path.startsWith(`${folder}/`),
      );
      if (holders.length === 0) return was;
      const next = new Set(was);
      for (const folder of holders) next.delete(folder);
      return next;
    });
    revealing.current = true;
    setSelectedPath(file.path);
  };
  const listName = changedFiles(files.length);
  const { id: browserId } = browser;
  const diffHeadingId = `${headingId}-diff`;
  return selected === undefined ? (
    <NoChanges
      {...(snapshot === undefined ? {} : { snapshot })}
      sinceReview={sinceReview}
      commitsReview={commitsReview}
    />
  ) : (
    <div className="story-review-workarea">
      <section
        id={browserId}
        ref={browserPane}
        className="story-review-files"
        aria-labelledby={`${browserId}-heading`}
        hidden={!browser.shown}
      >
        <h3 id={`${browserId}-heading`}>{listName}</h3>
        <FileTree
          label={listName}
          nodes={tree}
          selectedPath={selected.path}
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
      <section className="story-review-diff" aria-labelledby={diffHeadingId}>
        <div className="story-review-diff-heading">
          <h3 id={diffHeadingId}>
            <ReviewedFileName file={selected} />
          </h3>
          <FileMoves
            order={order}
            selectedPath={selected.path}
            onMove={moveTo}
          />
        </div>
        <FileDiff
          // A new comparison, snapshot, or file is a new read, never the
          // last one's.
          key={`${from}:${comparedTree}:${selected.path}`}
          reviewed={reviewed}
          from={from}
          tree={comparedTree}
          file={selected}
        />
      </section>
    </div>
  );
}
