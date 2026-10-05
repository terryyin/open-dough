// A story review's file browser rows (`./reviewFileTree.ts`) as its panel
// shows them (`./StoryReviewSnapshotView.tsx`): each folder a disclosure that
// collapses and expands, a collapsed folder telling how many changed files it
// holds, and each file by its name, its kind told by the name's style alone.
// A file's control is named, and titled, by its kind and full path in words;
// a file that includes trunk's changes says so in its row and its name.

import type { ReviewTreeNode } from "./reviewFileTree.ts";
import type { ReviewedFile } from "./storyReview.ts";

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
  readonly selectedPath: string | undefined;
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
              <button
                type="button"
                aria-label={reviewedFileWords(node.file)}
                title={reviewedFileWords(node.file)}
                aria-pressed={selectedPath === node.file.path}
                data-kind={node.file.kind}
                onClick={() => {
                  onSelect(node.file.path);
                }}
              >
                <code>{node.name}</code>
                {node.file.includesTrunkFrom !== undefined && (
                  <span className="story-review-trunk">
                    {" "}
                    {includesTrunkWords}
                  </span>
                )}
              </button>
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
