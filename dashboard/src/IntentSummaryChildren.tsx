// A location or folder summary's per-child breakdown (`./IntentSummary.tsx`):
// each immediate folder or file in the browser's tree order
// (`./reviewFileTree.ts`), a folder with its file count. Each child's name
// opens that folder or file in Intent's one selection, as its tree name does.

import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import { reviewFileTree } from "./reviewFileTree.ts";

export function IntentSummaryChildren({
  path,
  files,
  onOpen,
}: {
  readonly path: string;
  readonly files: readonly string[];
  readonly onOpen: (next: IntentSelection) => void;
}) {
  const prefix = `${path}/`;
  const children = reviewFileTree(
    files.flatMap((full) =>
      full.startsWith(prefix) ? [{ path: full.slice(prefix.length) }] : [],
    ),
  );
  if (children.length === 0) return null;
  return (
    <ul
      className="intent-summary-children"
      aria-label="Summary by folder and file"
    >
      {children.map((child) => {
        const childPath = `${prefix}${child.kind === "file" ? child.file.path : child.path}`;
        return (
          <li key={childPath}>
            <button
              type="button"
              className="intent-open-link"
              onClick={() => {
                onOpen({ path: childPath, scope: child.kind });
              }}
            >
              <code>{child.name}</code>
            </button>
            {child.kind === "folder" ? (
              <p className="intent-summary-files">
                {child.fileCount} {intentFileCountWords(child.fileCount)}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
