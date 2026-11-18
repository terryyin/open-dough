// A story review's snapshot (`./storyReviewContract.ts`) as its panel's body shows
// it, beneath the review's toolbar, details and feedback: the story's
// changed files in the comparison shown, with their change kinds, in a file
// browser the toolbar hides or shows (`./StoryReviewToolbar.tsx`). The
// browser shows each file by name under folders that collapse and expand
// (`./StoryReviewFileTree.tsx`).
// The review opens on the first file in the browser's order. Selecting a file
// reads its diff (`./StoryReviewFileDiff.tsx`) from the comparison's start,
// with its kind and full path in the heading. The browser and diff scroll
// independently, and the reviewer resizes the browser against the diff
// (`./StoryReviewWorkarea.tsx`). Empty comparisons describe what was compared. A refreshed
// snapshot or a comparison switch keeps the collapsed folders and selected
// file while the file is still listed; otherwise the first file is selected.
import { useLayoutEffect, useRef, useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import { reviewFileOrder, reviewFileTree } from "./reviewFileTree.ts";
import {
  baselineRevision,
  type ReviewComparison,
  type ReviewedFile,
  type TakenStoryReview,
} from "./storyReviewContract.ts";
import { diffStartOf } from "./storyComparisonShown.ts";
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import { FileDiff, type ReviewedWork } from "./StoryReviewFileDiff.tsx";
import { ReviewedFileHeader } from "./StoryReviewFileHeader.tsx";
import { FileMoves, revealRow } from "./StoryReviewFileMoves.tsx";
import {
  changedFiles,
  changedFileWords,
  FileRow,
  FileTree,
} from "./StoryReviewFileTree.tsx";
import { isReviewedSessionSubject } from "./reviewedWorkSubject.ts";
import { useProjects } from "./projectList.tsx";
import { useReviewDiffSyntaxHint } from "./reviewDiffSyntaxHint.ts";
import { StoryReviewWorkarea } from "./StoryReviewWorkarea.tsx";

// What the review says in place of the browser when the comparison shown
// lists no files.
function NoChanges({
  snapshot,
  commitsReview,
  committedOnly,
  published,
  sessionSubject,
  sessionCommits,
}: {
  readonly snapshot?: TakenStoryReview;
  readonly commitsReview: boolean;
  readonly committedOnly: boolean;
  readonly published: boolean;
  readonly sessionSubject: boolean;
  // A session's kept commits rather than its landing, which names a launch.
  readonly sessionCommits: boolean;
}) {
  if (snapshot === undefined) {
    let words =
      "No changes: this landed run has an empty delivered comparison.";
    if (published)
      words =
        "No changes: this completed story has an empty published comparison.";
    else if (sessionSubject)
      words = sessionCommits
        ? "No changes: these session commits leave no difference."
        : "No changes: this session's delivered comparison is empty.";
    return <p>{words}</p>;
  }
  if (commitsReview) return <p>The chosen commits changed nothing.</p>;
  if (committedOnly)
    return (
      <p>
        Nothing is committed yet: every change in this worktree is uncommitted.
      </p>
    );
  return (
    <p>
      No changes: the worktree matches baseline{" "}
      <code>{shortRevision(baselineRevision(snapshot))}</code>.
    </p>
  );
}

export function SnapshotView({
  reviewed,
  snapshot,
  comparison,
  headingId,
  browser,
  tree: comparedTree,
  commitsReview = false,
  committedOnly = false,
  settingsRevision,
}: {
  readonly reviewed: ReviewedWork;
  readonly snapshot?: TakenStoryReview;
  readonly comparison: ReviewComparison;
  readonly headingId: string;
  readonly browser: FileBrowserPlace;
  readonly tree: string;
  readonly commitsReview?: boolean;
  // Whether all changes leave the snapshot's uncommitted changes out.
  readonly committedOnly?: boolean;
  // Intent locations revision for path-grammar fallback (`./reviewDiffSyntaxHint.ts`).
  readonly settingsRevision?: string;
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
  const from = diffStartOf(comparison, selected);
  const source = useProjects().find(
    (project) => project.id === reviewed.subject.source,
  );
  const syntaxHint = useReviewDiffSyntaxHint(
    source,
    settingsRevision,
    selected?.path ?? "",
  );
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
      commitsReview={commitsReview}
      committedOnly={committedOnly}
      published={reviewed.completion !== undefined}
      sessionSubject={isReviewedSessionSubject(reviewed.subject)}
      sessionCommits={reviewed.reference === undefined}
    />
  ) : (
    <StoryReviewWorkarea
      sidebarShown={browser.shown}
      sidebar={
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
            renderFile={(row) => <FileRow {...row} />}
            fileCountWords={changedFileWords}
          />
        </section>
      }
      diff={
        <section className="story-review-diff" aria-labelledby={diffHeadingId}>
          <ReviewedFileHeader
            reviewed={reviewed}
            from={from}
            tree={comparedTree}
            file={selected}
            headingId={diffHeadingId}
            moves={
              <FileMoves
                order={order}
                selectedPath={selected.path}
                onMove={moveTo}
              />
            }
          />
          <FileDiff
            // A new comparison, snapshot, or file is a new read, never the
            // last one's.
            key={`${from}:${comparedTree}:${selected.path}`}
            reviewed={reviewed}
            from={from}
            tree={comparedTree}
            file={selected}
            {...(syntaxHint === undefined ? {} : { syntaxHint })}
          />
        </section>
      }
    />
  );
}
