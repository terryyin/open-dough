import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { IntentLocationHeader } from "./IntentLocationHeader.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import {
  overlayFilesByPath,
  storyOverlayExpansion,
  type StoryOverlay,
} from "./intentStoryOverlay.ts";
import { IntentTreeFileRow } from "./IntentTreeFileRow.tsx";
import { treeComparisonReadingOf } from "./intentTreeComparison.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import { reviewFileTree, reviewFoldersHolding } from "./reviewFileTree.ts";
import { FileTree } from "./StoryReviewFileTree.tsx";
import { useIntentRowReveal } from "./useIntentRowReveal.ts";
import {
  useLocationOpenFolders,
  type TreeReveal,
} from "./useLocationOpenFolders.ts";

export function IntentStoryFileTree({
  locations,
  overlay,
  changesOnly,
  round,
  selection,
  onSelect,
  reveal,
}: {
  readonly locations: readonly IntentLocation[];
  readonly overlay: StoryOverlay;
  readonly changesOnly: boolean;
  readonly round: number;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly reveal: TreeReveal | undefined;
}) {
  const filesByPath = overlayFilesByPath(locations, overlay);
  const roots = new Map(
    locations.flatMap((location, index) =>
      !changesOnly || overlay.locations[index]?.containsChanges
        ? [[location.path, location] as const]
        : [],
    ),
  );
  const tree = reviewFileTree(
    [...filesByPath].map(([path, file]) => ({ ...file, path })),
    { compact: false, folders: [...roots.keys()] },
  );
  const requested =
    reveal !== undefined && reveal.path === selection.path ? reveal : undefined;
  const section = useIntentRowReveal(requested);
  const { collapsed, toggleFolder } = useLocationOpenFolders({
    location: "",
    tree,
    revealPath: selection.path,
    expansion: {
      round,
      folders: [
        ...storyOverlayExpansion(locations, overlay, tree),
        ...(round === 0 ? [] : reviewFoldersHolding(tree, selection.path)),
      ],
    },
    reveal:
      requested === undefined
        ? undefined
        : { request: requested, path: requested.path },
  });
  const comparison = treeComparisonReadingOf(useIntentCiEvidence());
  const scope = selectionScope(selection);
  if (tree.length === 0) return null;
  return (
    <section className="intent-story-tree story-review-files" ref={section}>
      <FileTree
        label="Repository files"
        nodes={tree}
        selectedPath={scope === "file" ? selection.path : ""}
        onSelect={(path) => {
          onSelect({ path, scope: "file" });
        }}
        collapsed={collapsed}
        onToggle={toggleFolder}
        idPrefix="intent-story-tree"
        folderSelection={{
          selectedPath:
            scope === "folder" || scope === "location" ? selection.path : "",
          onSelect: (path) => {
            onSelect({ path, scope: "folder" });
          },
          renderFolder: ({
            path,
            name,
            rowsId,
            expanded,
            selected,
            onToggle,
          }) => {
            const location = roots.get(path);
            return location === undefined ? undefined : (
              <IntentLocationHeader
                location={location}
                reading={comparison}
                selected={selected}
                idPrefix={intentLocationIdPrefix(path)}
                expanded={expanded}
                onToggle={onToggle}
                onSelect={onSelect}
                folder={{ name, rowsId }}
              />
            );
          },
        }}
        renderFile={({ file, name, selected, onSelect: select }) => (
          <IntentTreeFileRow
            name={name}
            selected={selected}
            reading={comparison}
            path={file.path}
            treeFile={file}
            onSelect={() => {
              select(file.path);
            }}
          />
        )}
        fileCountWords={intentFileCountWords}
      />
    </section>
  );
}
