import { useLayoutEffect, useRef } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { scopeCueElementAttrs } from "./ciScopeComparisonCuePresentation.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { intentFolderCues } from "./intentFolderCues.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import {
  storyOverlayExpansion,
  type StoryOverlay,
  type storyRepositoryTree,
} from "./intentStoryOverlay.ts";
import { IntentTreeFileRow } from "./IntentTreeFileRow.tsx";
import {
  treeComparisonAccessibleName,
  treeComparisonReadingOf,
  treeLocationComparisonOf,
} from "./intentTreeComparison.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import { reviewFoldersHolding } from "./reviewFileTree.ts";
import { FileTree } from "./StoryReviewFileTree.tsx";
import { useIntentRowReveal } from "./useIntentRowReveal.ts";
import {
  useLocationOpenFolders,
  type TreeReveal,
} from "./useLocationOpenFolders.ts";
import "./intent-folder-cues.css";

export function IntentStoryFileTree({
  locations,
  overlay,
  shown,
  round,
  selection,
  onSelect,
  reveal,
}: {
  readonly locations: readonly IntentLocation[];
  readonly overlay: StoryOverlay;
  readonly shown: ReturnType<typeof storyRepositoryTree>;
  readonly round: number | string | undefined;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly reveal: TreeReveal | undefined;
}) {
  const { nodes: tree, roots, changedFiles } = shown;
  const requested =
    reveal !== undefined && reveal.path === selection.path ? reveal : undefined;
  const section = useIntentRowReveal(requested);
  const { collapsed, toggleFolder } = useLocationOpenFolders({
    location: "",
    tree,
    revealPath: selection.path,
    expansion:
      round === undefined
        ? undefined
        : {
            round,
            folders: [
              ...storyOverlayExpansion(locations, overlay, tree, changedFiles),
              ...(round === 0
                ? []
                : reviewFoldersHolding(tree, selection.path)),
            ],
          },
    reveal:
      requested === undefined
        ? undefined
        : { request: requested, path: requested.path },
  });
  const comparison = treeComparisonReadingOf(useIntentCiEvidence());
  const cues = intentFolderCues(tree, collapsed, new Set(roots.keys()));
  const scope = selectionScope(selection);
  const focusedFile = useRef<HTMLButtonElement | undefined>(undefined);
  // A selected file may temporarily leave the inventory while its pin is
  // read. Recover that row's keyboard focus if the user stayed in place.
  useLayoutEffect(() => {
    const previous = focusedFile.current;
    if (previous === undefined || previous.isConnected) return;
    if (
      scope !== "file" ||
      previous.dataset.repositoryPath !== selection.path
    ) {
      focusedFile.current = undefined;
      return;
    }
    if (document.activeElement !== document.body) return;
    section.current
      ?.querySelector<HTMLButtonElement>(
        'button[data-repository-path][aria-pressed="true"]',
      )
      ?.focus({ preventScroll: true });
  }, [scope, section, selection.path, tree]);

  if (tree.length === 0) return null;
  return (
    <section
      className="intent-story-tree story-review-files"
      ref={section}
      onFocus={({ target }) => {
        focusedFile.current =
          target instanceof HTMLButtonElement &&
          target.dataset.repositoryPath !== undefined
            ? target
            : undefined;
      }}
      onBlur={({ relatedTarget }) => {
        if (relatedTarget !== null) focusedFile.current = undefined;
      }}
    >
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
            onSelect({ path, scope: roots.has(path) ? "location" : "folder" });
          },
          present: (path) => {
            const cue = cues.get(path);
            if (cue === undefined) return undefined;
            const compared =
              cue === "root"
                ? treeLocationComparisonOf(comparison, path)
                : undefined;
            const row = scopeCueElementAttrs(
              "story-review-folder-row",
              compared?.cues,
            );
            return {
              row: {
                ...row,
                "data-intent-folder-cue": cue,
              },
              ...(cue === "root" && {
                toggleLabel: path,
                nameLabel:
                  compared === undefined
                    ? path
                    : treeComparisonAccessibleName(path, compared),
              }),
            };
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
