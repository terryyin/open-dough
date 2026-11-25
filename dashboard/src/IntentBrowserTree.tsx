// The story's repository tree or Project Intent's configured location groups.

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { IntentStoryFileTree } from "./IntentStoryFileTree.tsx";
import { StoryTreeScopeChoice } from "./IntentStorySummary.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useLocationOpenFolders.ts";

export function IntentBrowserTree({
  locations,
  tree,
  storySelected,
  selection,
  onSelect,
  reveal,
  expandedPath,
  onExpandedPath,
}: {
  readonly locations: readonly IntentLocation[];
  readonly tree: ReturnType<typeof useIntentStoryTree>;
  readonly storySelected: boolean;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly reveal: TreeReveal | undefined;
  readonly expandedPath: string | null;
  readonly onExpandedPath: (
    update: (was: string | null) => string | null,
  ) => void;
}) {
  if (storySelected)
    return (
      <>
        {tree.scope !== undefined && (
          <StoryTreeScopeChoice scope={tree.scope} />
        )}
        <IntentStoryFileTree
          locations={locations}
          overlay={tree.shownOverlay}
          changesOnly={tree.changesOnly}
          round={tree.round}
          selection={selection}
          onSelect={onSelect}
          reveal={reveal}
        />
      </>
    );
  return (
    <>
      {locations.map((location, index) => {
        const shown = tree.overlay.locations[index];
        return (
          <IntentLocationGroup
            key={location.path}
            location={location}
            files={shown?.files ?? []}
            containsChanges={shown?.containsChanges ?? false}
            selection={selection}
            onSelect={onSelect}
            reveal={reveal}
            idPrefix={intentLocationIdPrefix(location.path)}
            expanded={expandedPath === location.path}
            onToggle={() => {
              onExpandedPath((was) =>
                was === location.path ? null : location.path,
              );
            }}
          />
        );
      })}
    </>
  );
}
