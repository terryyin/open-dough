// Shared folder disclosure rows (`./reviewFileTree.ts`) and Review changes'
// file row: each folder a disclosure that collapses and expands, a collapsed
// folder telling how many files it holds in caller-supplied words, and each
// file rendered by the caller. Review changes supplies its FileRow and
// "changed files" wording (`./StoryReviewFileRow.tsx`,
// `./StoryReviewSnapshotView.tsx`). Intent may pass `folderSelection` so each
// folder is a caret disclosure plus a selectable name; Review changes passes
// nothing and keeps one disclosure row. Each file's row carries its change
// kind (`data-kind`), and each folder whether it contains changes
// (`data-contains-changes`), from the tree model (`./reviewFileTree.ts`); the
// shared change-kind styles show the kind (`./change-kinds.css`).

import { type ReactNode } from "react";
import type { PathBearing, PathTreeNode } from "./reviewFileTree.ts";
import "./story-review-files.css";
import "./change-kinds.css";

export {
  changedFiles,
  changedFileWords,
  FileRow,
  includesTrunkWords,
  kindWords,
} from "./StoryReviewFileRow.tsx";

function FolderCount({
  count,
  fileCountWords,
}: {
  readonly count: number;
  readonly fileCountWords: (count: number) => string;
}) {
  return (
    <>
      {" "}
      <span className="story-review-folder-count">
        {count}
        <span className="visually-hidden"> {fileCountWords(count)}</span>
      </span>
    </>
  );
}

// Opt-in Intent path: caret toggles disclosure; name selects (or toggles
// when already selected). Review changes omits this and keeps one row.
export type FolderSelection = {
  readonly selectedPath: string;
  readonly onSelect: (folderPath: string) => void;
};

// The browser's rows under one folder, or the top level: a folder's
// disclosure above its own rows, hidden while it is collapsed, or a file's
// control from the caller. A collapsed folder's row shows its count; the
// words after the number are read aloud only.
export function FileTree<T extends PathBearing>({
  nodes,
  selectedPath,
  onSelect,
  collapsed,
  onToggle,
  idPrefix,
  label,
  id,
  hidden,
  renderFile,
  fileCountWords,
  folderSelection,
}: {
  readonly nodes: readonly PathTreeNode<T>[];
  readonly selectedPath: string;
  readonly onSelect: (path: string) => void;
  readonly collapsed: ReadonlySet<string>;
  readonly onToggle: (folderPath: string) => void;
  readonly idPrefix: string;
  readonly label?: string;
  readonly id?: string;
  readonly hidden?: boolean;
  readonly renderFile: (row: {
    readonly file: T;
    readonly name: string;
    readonly selected: boolean;
    readonly onSelect: (path: string) => void;
  }) => ReactNode;
  readonly fileCountWords: (count: number) => string;
  readonly folderSelection?: FolderSelection;
}) {
  return (
    <ul aria-label={label} id={id} hidden={hidden}>
      {nodes.map((node) => {
        if (node.kind === "file")
          return (
            <li key={`file:${node.file.path}`} data-kind={node.file.kind}>
              {renderFile({
                file: node.file,
                name: node.name,
                selected: selectedPath === node.file.path,
                onSelect,
              })}
            </li>
          );
        const folderCollapsed = collapsed.has(node.path);
        const rowsId = `${idPrefix}-folder-${node.path}`;
        const count = folderCollapsed ? (
          <FolderCount count={node.fileCount} fileCountWords={fileCountWords} />
        ) : null;
        if (folderSelection !== undefined) {
          const folderSelected = folderSelection.selectedPath === node.path;
          return (
            <li
              key={`folder:${node.path}`}
              data-contains-changes={node.containsChanges || undefined}
            >
              <div className="story-review-folder-row">
                <button
                  type="button"
                  className="story-review-folder"
                  aria-expanded={!folderCollapsed}
                  aria-controls={rowsId}
                  aria-label={`${folderCollapsed ? "Expand" : "Collapse"} ${node.name}`}
                  onClick={() => {
                    onToggle(node.path);
                  }}
                />
                <button
                  type="button"
                  className="story-review-folder-name"
                  aria-pressed={folderSelected}
                  onClick={() => {
                    folderSelection.onSelect(node.path);
                  }}
                >
                  <code>{node.name}</code>
                  {count}
                </button>
              </div>
              <FileTree
                nodes={node.children}
                selectedPath={selectedPath}
                onSelect={onSelect}
                collapsed={collapsed}
                onToggle={onToggle}
                idPrefix={idPrefix}
                id={rowsId}
                hidden={folderCollapsed}
                renderFile={renderFile}
                fileCountWords={fileCountWords}
                folderSelection={folderSelection}
              />
            </li>
          );
        }
        return (
          <li
            key={`folder:${node.path}`}
            data-contains-changes={node.containsChanges || undefined}
          >
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
              {count}
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
              renderFile={renderFile}
              fileCountWords={fileCountWords}
            />
          </li>
        );
      })}
    </ul>
  );
}
