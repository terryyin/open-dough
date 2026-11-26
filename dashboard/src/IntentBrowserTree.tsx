// Project Intent and story review share the selectable repository tree.
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { NoFilesMatchNote } from "./FilesSidebarActions.tsx";
import { IntentFileTree } from "./IntentFileTree.tsx";
import { storyOverlayExpansion } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import { reviewFoldersHolding } from "./reviewFileTree.ts";
import type { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useIntentOpenFolders.ts";

export function IntentBrowserTree({
  locations,
  tree,
  storySelected,
  selection,
  onSelect,
  reveal,
}: {
  readonly locations: readonly IntentLocation[];
  readonly tree: ReturnType<typeof useIntentStoryTree>;
  readonly storySelected: boolean;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly reveal: TreeReveal | undefined;
}) {
  const { shown, overlay, round, owner } = tree;
  const expansion =
    !storySelected || round === undefined
      ? undefined
      : {
          round,
          folders: [
            ...storyOverlayExpansion(
              locations,
              overlay,
              shown.nodes,
              shown.changedFiles,
            ),
            ...(round === 0
              ? []
              : reviewFoldersHolding(shown.nodes, selection.path)),
          ],
        };
  return (
    <>
      <NoFilesMatchNote noMatch={shown.noMatch} />
      <IntentFileTree
        shown={shown}
        expansion={expansion}
        owner={owner}
        selection={selection}
        onSelect={onSelect}
        reveal={reveal}
      />
    </>
  );
}
