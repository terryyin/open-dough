// Shared folder disclosure rows (`./reviewFileTree.ts`) for Intent's file
// tree (`./IntentFileTree.tsx`): each folder a folder-icon disclosure that
// collapses and expands (`FolderToggleIcon`) beside a name selected through
// `folderSelection`, a collapsed folder telling how many files it holds in
// caller-supplied words, and each file rendered by the caller. Each file's
// row carries its change kind (`data-kind`), and each folder whether it
// contains changes (`data-contains-changes`), from the tree model; the shared
// change-kind styles show the kind (`./change-kinds.css`).

import { type ReactNode } from "react";
import { FolderClosed, FolderOpen } from "lucide-react";
import { Icon } from "./Icon.tsx";
import type { PathBearing, PathTreeNode } from "./reviewFileTree.ts";
import "./story-review-files.css";
import "./change-kinds.css";

// A folder toggle's visual: an open folder while expanded, closed while
// collapsed. The toggle carries its name and expanded state.
export function FolderToggleIcon({ open }: { readonly open: boolean }) {
  return <Icon icon={open ? FolderOpen : FolderClosed} />;
}

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

// The icon discloses the folder and the name selects it.
export type FolderSelection = {
  readonly selectedPath: string;
  readonly onSelect: (folderPath: string) => void;
  readonly present?: (path: string) =>
    | {
        readonly row: {
          readonly className: string;
          readonly [attribute: `data-${string}`]: string | undefined;
        };
        readonly nameLabel?: string;
        readonly toggleLabel?: string;
      }
    | undefined;
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
  readonly folderSelection: FolderSelection;
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
        const folderSelected = folderSelection.selectedPath === node.path;
        const presentation = folderSelection.present?.(node.path);
        const disclosure = folderCollapsed ? "Expand" : "Collapse";
        return (
          <li
            key={`folder:${node.path}`}
            data-folder-path={node.path}
            data-contains-changes={node.containsChanges || undefined}
          >
            <div
              className="story-review-folder-row"
              {...presentation?.row}
              data-selected={folderSelected || undefined}
            >
              <button
                type="button"
                className="story-review-folder"
                aria-expanded={!folderCollapsed}
                aria-controls={rowsId}
                aria-label={`${disclosure} ${presentation?.toggleLabel ?? node.name}`}
                onClick={() => {
                  onToggle(node.path);
                }}
              >
                <FolderToggleIcon open={!folderCollapsed} />
              </button>
              <button
                type="button"
                className="story-review-folder-name"
                aria-pressed={folderSelected}
                aria-label={presentation?.nameLabel}
                aria-description={
                  folderCollapsed && presentation?.nameLabel !== undefined
                    ? `${node.fileCount} ${fileCountWords(node.fileCount)}`
                    : undefined
                }
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
      })}
    </ul>
  );
}
