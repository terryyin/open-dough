// The selected story's changed files outside every Intent location, drawn
// after the locations (`./IntentTreeGroups.tsx`) under one heading, in their
// repository folders through the shared folder rows
// (`./StoryReviewFileTree.tsx`) and Intent's file rows
// (`./IntentTreeFileRow.tsx`). Selecting one selects its repository path as a
// file; it has no owning location, so a folder's name toggles it as its
// folder icon does and summarizes nothing. Its folders open as the story's
// expansion asks (`./useIntentStoryTree.ts`), kept apart from every location.

import { useIntentRowReveal } from "./useIntentRowReveal.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import { IntentTreeFileRow } from "./IntentTreeFileRow.tsx";
import { treeComparisonReadingOf } from "./intentTreeComparison.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import { reviewFileTree } from "./reviewFileTree.ts";
import { FileTree } from "./StoryReviewFileTree.tsx";
import {
  useLocationOpenFolders,
  type LocationExpansion,
  type TreeReveal,
} from "./useLocationOpenFolders.ts";
import "./story-review-files.css";
import "./intent-location-group.css";

const idPrefix = "intent-outside-locations";

export function IntentOutsideGroup({
  files,
  expansion,
  reveal,
  selection,
  onSelect,
}: {
  // The outside files, each at its repository path.
  readonly files: readonly IntentTreeFile[];
  readonly expansion: LocationExpansion | undefined;
  readonly reveal: TreeReveal | undefined;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
}) {
  const tree = reviewFileTree(files);
  const selectedPath =
    selectionScope(selection) === "file" ? selection.path : "";
  const outsideReveal =
    reveal !== undefined && files.some((file) => file.path === reveal.path)
      ? reveal
      : undefined;
  const section = useIntentRowReveal(outsideReveal);
  const { collapsed, toggleFolder } = useLocationOpenFolders({
    location: "",
    tree,
    revealPath: files.some((file) => file.path === selectedPath)
      ? selectedPath
      : "",
    expansion,
    reveal:
      outsideReveal === undefined
        ? undefined
        : { request: outsideReveal, path: outsideReveal.path },
  });
  const comparison = treeComparisonReadingOf(useIntentCiEvidence());
  if (files.length === 0) return null;
  return (
    <section
      ref={section}
      className="intent-outside-locations story-review-files"
      aria-labelledby={`${idPrefix}-heading`}
      data-contains-changes
    >
      <h4 id={`${idPrefix}-heading`} className="intent-location-header">
        Outside Intent locations
      </h4>
      <FileTree
        label="Changed files outside Intent locations"
        nodes={tree}
        selectedPath={selectedPath}
        onSelect={(path) => {
          onSelect({ path, scope: "file" });
        }}
        collapsed={collapsed}
        onToggle={toggleFolder}
        idPrefix={`${idPrefix}-tree`}
        folderSelection={{ selectedPath: "", onSelect: toggleFolder }}
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
