// The locations column's groups (`./IntentBrowser.tsx`): each configured
// location in configured order (`./IntentLocationGroup.tsx`), those without
// changes left out under "Selected story only", then the selected story's
// changed files outside every location (`./IntentOutsideGroup.tsx`), all from
// one story tree (`./useIntentStoryTree.ts`). One location is expanded at a
// time; its toggle collapses it or expands it instead of another.

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { IntentOutsideGroup } from "./IntentOutsideGroup.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useLocationOpenFolders.ts";

export function IntentTreeGroups({
  locations,
  tree,
  selection,
  onSelect,
  reveal,
  expandedPath,
  onExpandedPath,
}: {
  readonly locations: readonly IntentLocation[];
  readonly tree: ReturnType<typeof useIntentStoryTree>;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly reveal: TreeReveal | undefined;
  readonly expandedPath: string | null;
  readonly onExpandedPath: (
    update: (was: string | null) => string | null,
  ) => void;
}) {
  const { shownOverlay, changesOnly, locationExpansion } = tree;
  return (
    <>
      {locations.map((location, index) => {
        const shown = shownOverlay.locations[index];
        if (changesOnly && !shown?.containsChanges) return null;
        return (
          <IntentLocationGroup
            key={location.path}
            location={location}
            files={shown?.files ?? []}
            containsChanges={shown?.containsChanges ?? false}
            expansion={locationExpansion(index)}
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
      <IntentOutsideGroup
        files={shownOverlay.outside}
        expansion={tree.outsideExpansion}
        reveal={reveal}
        selection={selection}
        onSelect={onSelect}
      />
    </>
  );
}
