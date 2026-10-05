// A story review's file browser rows (`./reviewFileTree.ts`) as its panel
// shows them (`./StoryReviewSnapshotView.tsx`): each folder a disclosure that
// collapses and expands, a collapsed folder telling how many changed files it
// holds, and each file by its name, its kind told by the name's style alone.
// A file's control is named, and titled, by its kind and full path in words;
// a file that includes trunk's changes says so in its row and its name.
// A file whose diff adds or removes lines shows how many beside its name,
// and its control is described by them in words.

import { useId } from "react";
import type { ReviewTreeNode } from "./reviewFileTree.ts";
import type { ReviewedFile } from "./storyReview.ts";
import "./story-review-files.css";

export const kindWords: Record<ReviewedFile["kind"], string> = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
};

// The flag of a file that includes trunk's changes since the review.
export const includesTrunkWords = "includes trunk's changes";

// A file's kind and full path in words, and its flag, as its control is
// named.
const reviewedFileWords = (file: ReviewedFile) =>
  `${kindWords[file.kind]} ${
    file.kind === "renamed" ? `${file.oldPath} → ${file.path}` : file.path
  }${file.includesTrunkFrom === undefined ? "" : `, ${includesTrunkWords}`}`;

const changedFileWords = (count: number) =>
  count === 1 ? "changed file" : "changed files";

// How many files a snapshot lists, in words.
export const changedFiles = (count: number) =>
  `${String(count)} ${changedFileWords(count)}`;

const lineWords = (count: number, change: string) =>
  `${String(count)} ${count === 1 ? "line" : "lines"} ${change}`;

// A file's control: its name, and its line counts when its diff adds or
// removes any, which describe the control in words.
function FileRow({
  file,
  name,
  selected,
  onSelect,
}: {
  readonly file: ReviewedFile;
  readonly name: string;
  readonly selected: boolean;
  readonly onSelect: (path: string) => void;
}) {
  const countsId = useId();
  const counted =
    file.lines !== undefined && file.lines.added + file.lines.removed > 0
      ? file.lines
      : undefined;
  return (
    <button
      type="button"
      aria-label={reviewedFileWords(file)}
      aria-describedby={counted === undefined ? undefined : countsId}
      title={reviewedFileWords(file)}
      aria-pressed={selected}
      data-kind={file.kind}
      onClick={() => {
        onSelect(file.path);
      }}
    >
      <code>{name}</code>
      {file.includesTrunkFrom !== undefined && (
        <span className="story-review-trunk"> {includesTrunkWords}</span>
      )}
      {counted === undefined ? null : (
        <>
          {" "}
          <span className="story-review-line-counts">
            <span className="story-review-lines-added">+{counted.added}</span>{" "}
            <span className="story-review-lines-removed">
              −{counted.removed}
            </span>
            <span id={countsId} hidden>
              {`${lineWords(counted.added, "added")}, ${lineWords(counted.removed, "removed")}`}
            </span>
          </span>
        </>
      )}
    </button>
  );
}

// The browser's rows under one folder, or the top level: a folder's
// disclosure above its own rows, hidden while it is collapsed, or a file's
// control. A collapsed folder's row shows its count; the words after the
// number are read aloud only.
export function FileTree({
  nodes,
  selectedPath,
  onSelect,
  collapsed,
  onToggle,
  idPrefix,
  label,
  id,
  hidden,
}: {
  readonly nodes: readonly ReviewTreeNode[];
  readonly selectedPath: string;
  readonly onSelect: (path: string) => void;
  readonly collapsed: ReadonlySet<string>;
  readonly onToggle: (folderPath: string) => void;
  readonly idPrefix: string;
  readonly label?: string;
  readonly id?: string;
  readonly hidden?: boolean;
}) {
  return (
    <ul aria-label={label} id={id} hidden={hidden}>
      {nodes.map((node) => {
        if (node.kind === "file")
          return (
            <li key={`file:${node.file.path}`}>
              <FileRow
                file={node.file}
                name={node.name}
                selected={selectedPath === node.file.path}
                onSelect={onSelect}
              />
            </li>
          );
        const folderCollapsed = collapsed.has(node.path);
        const rowsId = `${idPrefix}-folder-${node.path}`;
        return (
          <li key={`folder:${node.path}`}>
            <button
              type="button"
              className="story-review-folder"
              aria-expanded={!folderCollapsed}
              aria-controls={rowsId}
              onClick={() => {
                onToggle(node.path);
              }}
            >
              <code>{node.name}</code>
              {folderCollapsed ? (
                <>
                  {" "}
                  <span className="story-review-folder-count">
                    {node.fileCount}
                    <span className="visually-hidden">
                      {" "}
                      {changedFileWords(node.fileCount)}
                    </span>
                  </span>
                </>
              ) : null}
            </button>
            <FileTree
              nodes={node.children}
              selectedPath={selectedPath}
              onSelect={onSelect}
              collapsed={collapsed}
              onToggle={onToggle}
              idPrefix={idPrefix}
              id={rowsId}
              hidden={folderCollapsed}
            />
          </li>
        );
      })}
    </ul>
  );
}
