// A story review's snapshot (`./storyReview.ts`) as its panel shows it: the
// context line, beneath the panel's header, names the branch, the baseline
// it compares against, and the worktree, beside the control that hides or
// shows the file browser; the review's body lists the story's changed files
// with their change kinds in that browser. The browser shows each file by
// name under folders that collapse and expand (`./StoryReviewFileTree.tsx`).
// The review opens on the first file in the browser's order. Selecting a
// file reads its diff (`./StoryReviewFileDiff.tsx`), headed by its kind and
// full path, shown from the top while the browser keeps its scroll; the two
// fill the review's body, each scrolling on its own. A worktree that matches
// its baseline says so in place of the browser. A refreshed snapshot keeps
// the browser as it was, its collapsed folders, and the selected file while
// the new snapshot still lists their paths; one that no longer lists the
// selected file selects its first file. Previous file and Next file beside
// the diff's heading move the selection in the browser's order
// (`./StoryReviewFileMoves.tsx`), expanding the folders that hold the file
// moved to and scrolling the browser to bring its row into view.

import { useLayoutEffect, useRef, useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import { reviewFileOrder, reviewFileTree } from "./reviewFileTree.ts";
import type { ReviewedFile, TakenStoryReview } from "./storyReview.ts";
import { FileDiff, type ReviewedStory } from "./StoryReviewFileDiff.tsx";
import { FileMoves, revealRow } from "./StoryReviewFileMoves.tsx";
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

// The file browser as the review places it: its element's id, and whether
// the developer shows it.
export type FileBrowserPlace = {
  readonly id: string;
  readonly shown: boolean;
};

// The review's context in one line that never wraps: branch, short baseline
// with the `<remote>/<target>` it meets, worktree, and, while the snapshot
// lists files, Hide files or Show files. Values that do not fit are
// shortened. Activating the line shows every value in full, and activating
// it again returns to the one line. Its name reads every value in full in
// either state.
export function ContextLine({
  snapshot,
  browser,
  onShowBrowser,
}: {
  readonly snapshot: TakenStoryReview;
  readonly browser?: FileBrowserPlace;
  readonly onShowBrowser: (shown: boolean) => void;
}) {
  const [full, setFull] = useState(false);
  const { branch, baseline, remote, target, workspace } = snapshot;
  const trunk = (
    <code>
      {remote}/{target}
    </code>
  );
  return (
    <div className="story-review-context-line">
      <button
        type="button"
        className="story-review-context-values"
        aria-expanded={full}
        onClick={() => {
          setFull(!full);
        }}
      >
        <span className="story-review-context-value">
          <span className="story-review-context-label">Branch</span>{" "}
          <code>{branch}</code>
        </span>{" "}
        <span className="story-review-context-value story-review-context-baseline">
          <span className="story-review-context-label">Baseline</span>{" "}
          {full ? (
            <>
              <code>{baseline}</code> where <code>{branch}</code> meets {trunk}
            </>
          ) : (
            <>
              <code aria-hidden="true">{shortRevision(baseline)}</code>
              <span className="visually-hidden">
                {baseline} where {branch} meets
              </span>{" "}
              {trunk}
            </>
          )}
        </span>{" "}
        <span className="story-review-context-value story-review-context-worktree">
          <span className="story-review-context-label">Worktree</span>{" "}
          <code>{workspace}</code>
        </span>
      </button>
      {browser !== undefined && (
        <button
          type="button"
          className="start-launch-button"
          aria-expanded={browser.shown}
          aria-controls={browser.id}
          onClick={() => {
            onShowBrowser(!browser.shown);
          }}
        >
          {browser.shown ? "Hide files" : "Show files"}
        </button>
      )}
    </div>
  );
}

export function SnapshotView({
  reviewed,
  snapshot,
  headingId,
  browser,
}: {
  readonly reviewed: ReviewedStory;
  readonly snapshot: TakenStoryReview;
  readonly headingId: string;
  readonly browser: FileBrowserPlace;
}) {
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  // Folders collapsed by path; every folder starts expanded on each opening,
  // and a refreshed snapshot keeps those it still has collapsed.
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const tree = reviewFileTree(snapshot.files);
  const order = reviewFileOrder(tree);
  const selected =
    snapshot.files.find((file) => file.path === selectedPath) ?? order[0];
  // The first file stays selected once shown, so a later snapshot that lists
  // an earlier selection again does not return to it.
  if (selected !== undefined && selected.path !== selectedPath)
    setSelectedPath(selected.path);
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
  const listName = changedFiles(snapshot.files.length);
  const { id: browserId } = browser;
  const diffHeadingId = `${headingId}-diff`;
  return selected === undefined ? (
    <p>
      No changes: the worktree matches baseline{" "}
      <code>{shortRevision(snapshot.baseline)}</code>.
    </p>
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
          // A new snapshot or file is a new read, never the last one's.
          key={`${snapshot.tree}:${selected.path}`}
          reviewed={reviewed}
          snapshot={snapshot}
          file={selected}
        />
      </section>
    </div>
  );
}
